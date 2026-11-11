import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { CandidateAssessmentResult } from '../types/assessment';
import { ensureCandidateData } from '../utils/scoring';
import { INITIAL_MOCK_CANDIDATES } from '../data/mockCandidates';

const COLLECTION_NAME = 'candidates';
const LOCAL_STORAGE_KEY = 'resicope_candidates_v3';

// Sanitize helper to remove undefined values without JSON serialize/deserialize overhead
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value === undefined) {
      result[key] = null;
    } else if (value !== null && typeof value === 'object') {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

// In-memory cache to preserve object reference identity across snapshot updates
const candidateCache = new Map<string, { rawHash: string; processed: CandidateAssessmentResult }>();

function computeCandidateSignature(c: CandidateAssessmentResult): string {
  return `${c.id}_${c.submittedAt}_${c.committeeStatus || ''}_${c.interviewerRating || 0}_${c.committeeNotes || ''}_${(c.institutionalCarePlan || []).join('|')}`;
}

// Save to local cache as immediate fallback
function updateLocalCache(list: CandidateAssessmentResult[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to update local cache', e);
  }
}

// Seed initial mock candidates into Firestore if collection is empty
export async function seedInitialCandidatesIfEmpty(): Promise<CandidateAssessmentResult[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      console.log('Seeding initial candidates to Firestore cloud database...');
      for (const cand of INITIAL_MOCK_CANDIDATES) {
        const clean = sanitizeForFirestore(cand);
        await setDoc(doc(db, COLLECTION_NAME, cand.id), clean);
      }
      updateLocalCache(INITIAL_MOCK_CANDIDATES);
      return INITIAL_MOCK_CANDIDATES;
    }

    const list: CandidateAssessmentResult[] = [];
    snap.forEach((docSnap) => {
      const raw = docSnap.data() as CandidateAssessmentResult;
      const signature = computeCandidateSignature(raw);
      const cached = candidateCache.get(docSnap.id);
      if (cached && cached.rawHash === signature) {
        list.push(cached.processed);
      } else {
        const processed = ensureCandidateData(raw);
        candidateCache.set(docSnap.id, { rawHash: signature, processed });
        list.push(processed);
      }
    });

    // Sort by submission date descending
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    updateLocalCache(list);
    return list;
  } catch (error) {
    console.error('Error seeding/fetching candidates from Firestore:', error);
    return INITIAL_MOCK_CANDIDATES;
  }
}

// Real-time listener: Any applicant submitting on their phone will instantly appear on the committee's screen
export function subscribeToCandidates(
  onUpdate: (candidates: CandidateAssessmentResult[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If empty in cloud, seed and trigger update
          seedInitialCandidatesIfEmpty().then((seeded) => onUpdate(seeded));
          return;
        }

        const candidates: CandidateAssessmentResult[] = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data() as CandidateAssessmentResult;
          const signature = computeCandidateSignature(raw);
          const cached = candidateCache.get(docSnap.id);

          if (cached && cached.rawHash === signature) {
            candidates.push(cached.processed);
          } else {
            const processed = ensureCandidateData(raw);
            candidateCache.set(docSnap.id, { rawHash: signature, processed });
            candidates.push(processed);
          }
        });

        // Sort latest submitted first
        candidates.sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );

        updateLocalCache(candidates);
        onUpdate(candidates);
      },
      (error) => {
        console.error('Firestore real-time subscription error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to setup Firestore subscription:', err);
    return () => {};
  }
}

// Save a newly submitted candidate to central cloud server & local cache
export async function saveCandidateToCloud(result: CandidateAssessmentResult): Promise<void> {
  const cleanData = sanitizeForFirestore(result);

  // 1. Always update local storage first so user has immediate feedback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: CandidateAssessmentResult[] = raw ? JSON.parse(raw) : [];
    const updated = [result, ...existing.filter((c) => c.id !== result.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Transmit to Firestore central database for committee devices to see
  try {
    await setDoc(doc(db, COLLECTION_NAME, result.id), cleanData);
    console.log(`Candidate ${result.candidateName} (${result.id}) saved to Firestore successfully.`);
  } catch (cloudError) {
    console.error('Error saving candidate to Firestore central server:', cloudError);
    throw cloudError;
  }
}

// Update committee evaluation notes / status in cloud
export async function updateCandidateInCloud(result: CandidateAssessmentResult): Promise<void> {
  const cleanData = sanitizeForFirestore(result);

  // Update local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: CandidateAssessmentResult[] = raw ? JSON.parse(raw) : [];
    const updated = existing.map((c) => (c.id === result.id ? result : c));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage update error:', e);
  }

  // Update Firestore central server
  try {
    await setDoc(doc(db, COLLECTION_NAME, result.id), cleanData, { merge: true });
    console.log(`Candidate ${result.id} updated in Firestore.`);
  } catch (cloudError) {
    console.error('Error updating candidate in Firestore:', cloudError);
    throw cloudError;
  }
}

// Reset candidates in cloud back to initial mock set
export async function resetCandidatesInCloud(): Promise<CandidateAssessmentResult[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);

    // Delete existing documents
    const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, COLLECTION_NAME, d.id)));
    await Promise.all(deletePromises);

    // Seed defaults
    for (const cand of INITIAL_MOCK_CANDIDATES) {
      await setDoc(doc(db, COLLECTION_NAME, cand.id), sanitizeForFirestore(cand));
    }

    updateLocalCache(INITIAL_MOCK_CANDIDATES);
    return INITIAL_MOCK_CANDIDATES;
  } catch (e) {
    console.error('Failed to reset candidates in cloud:', e);
    updateLocalCache(INITIAL_MOCK_CANDIDATES);
    return INITIAL_MOCK_CANDIDATES;
  }
}
