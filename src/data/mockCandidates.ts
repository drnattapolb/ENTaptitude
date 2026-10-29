import { CandidateAssessmentResult, OptionKey } from '../types/assessment';
import { calculateCandidateResult, ensureCandidateData } from '../utils/scoring';

// 1. Candidate: นพ. กฤษดา ธนวัฒน์เจริญ (Low Risk, High Task-Focused)
const cand1Answers: Record<number, { most: OptionKey; least: OptionKey }> = {
  1: { most: 'A', least: 'D' }, // A (Active 1) = 2, D (Pos Reframe 1) = 0. B=1, C=1
  2: { most: 'A', least: 'C' }, // A (Plan 2) = 2, C (Accept 1) = 0. B=1, D=1
  3: { most: 'D', least: 'C' }, // D (Humor 1) = 2, C (Self-blame 1) = 0. A=1, B=1
  4: { most: 'B', least: 'D' }, // B (Active 2) = 2, D (Substance 1) = 0. A=1, C=1
  5: { most: 'A', least: 'C' }, // A (Emo Supp 1) = 2, C (Humor 2) = 0. B=1, D=1
  6: { most: 'C', least: 'B' }, // C (Emo Supp 2) = 2, B (Self-blame 2) = 0. A=1, D=1
  7: { most: 'C', least: 'B' }  // C (Religion 2) = 2, B (Substance 2) = 0. A=1, D=1
};

// 2. Candidate: พญ. วริศรา เมธาคุณากร (Moderate Risk, Emotional / Venting)
const cand2Answers: Record<number, { most: OptionKey; least: OptionKey }> = {
  1: { most: 'C', least: 'B' }, // C (Inst Supp 1) = 2, B (Plan 1) = 0
  2: { most: 'D', least: 'A' }, // D (Inst Supp 2) = 2, A (Plan 2) = 0
  3: { most: 'A', least: 'B' }, // A (Venting 1) = 2, B (Denial 1) = 0
  4: { most: 'A', least: 'C' }, // A (Self-distract 1) = 2, C (Disengage 1) = 0
  5: { most: 'A', least: 'B' }, // A (Emo Supp 1) = 2, B (Religion 1) = 0
  6: { most: 'C', least: 'D' }, // C (Emo Supp 2) = 2, D (Disengage 2) = 0
  7: { most: 'A', least: 'C' }  // A (Venting 2) = 2, C (Religion 2) = 0
};

// 3. Candidate: นพ. ธนกฤต วิเศษไชยศรี (High Risk, Elevated Red Flags: Self-blame + Substance + Disengagement)
const cand3Answers: Record<number, { most: OptionKey; least: OptionKey }> = {
  1: { most: 'D', least: 'A' }, // D (Pos Reframe 1) = 2, A (Active 1) = 0
  2: { most: 'C', least: 'A' }, // C (Accept 1) = 2, A (Plan 2) = 0
  3: { most: 'C', least: 'D' }, // C (Self-blame 1) = 2, D (Humor 1) = 0
  4: { most: 'D', least: 'B' }, // D (Substance 1) = 2, B (Active 2) = 0
  5: { most: 'D', least: 'A' }, // D (Accept 2) = 2, A (Emo Supp 1) = 0
  6: { most: 'B', least: 'C' }, // B (Self-blame 2) = 2, C (Emo Supp 2) = 0
  7: { most: 'B', least: 'C' }  // B (Substance 2) = 2, C (Religion 2) = 0
};

export const INITIAL_MOCK_CANDIDATES: CandidateAssessmentResult[] = [
  {
    ...calculateCandidateResult('นพ. กฤษดา ธนวัฒน์เจริญ', cand1Answers, {
      specialty: 'โสต ศอ นาสิกวิทยา (ENT)',
      hospitalOrSchool: 'ศิริราชพยาบาล / แพทย์เพิ่มพูนทักษะ รพ.ศูนย์ชลบุรี',
      candidateContextNote: 'ในช่วงเพิ่มพูนทักษะที่ รพ.ศูนย์ ได้มีโอกาสช่วยเคสฉุกเฉินทางเดินหายใจหลายครั้ง ทำให้ฝึกการวางแผนและประสานงานกับทีมอย่างรวดเร็ว หากมีข้อผิดพลาดจะชอบเปิดอกคุยกับอาจารย์ทันทีเพื่อไม่ให้ค้างคาใจ'
    }),
    id: 'CAND-2026-081',
    submittedAt: '2026-10-21T09:15:00.000Z',
    committeeStatus: 'SHORTLISTED',
    interviewerRating: 5,
    committeeNotes: 'มีทักษะ Task-Focused โดดเด่นมาก กลไกเผชิญความกดดันใน OR ว่องไว มี Self-Awareness สูง',
    institutionalCarePlan: [
      'จัดเข้าโครงการ Faculty Mentorship ด้าน Work-Life Integration'
    ]
  },
  {
    ...calculateCandidateResult('พญ. วริศรา เมธาคุณากร', cand2Answers, {
      specialty: 'โสต ศอ นาสิกวิทยา (ENT)',
      hospitalOrSchool: 'จุฬาลงกรณ์มหาวิทยาลัย / แพทย์เพิ่มพูนทักษะ รพ.ราชวิถี',
      candidateContextNote: 'เมื่อเจอสถานการณ์ตึงเครียด มักจะหาเวลาพูดคุยปรึกษากับเพื่อนร่วมงานหรืออาจารย์ที่ไว้ใจ เพื่อทบทวนความรู้สึกและจัดระเบียบความคิดก่อนลุยงานต่อ'
    }),
    id: 'CAND-2026-082',
    submittedAt: '2026-10-21T11:42:00.000Z',
    committeeStatus: 'NEEDS_INTERVIEW_PROBE',
    interviewerRating: 4,
    committeeNotes: 'มี Support-seeking ดี สะท้อนความต้องการการสนับสนุนอย่างจริงใจ ควรชวนคุยแนวทางการระบายความเครียดในวอร์ด',
    institutionalCarePlan: [
      'แต่งตั้ง Senior Resident Buddy ช่วยประคองช่วง 3 เดือนแรก',
      'จัดเข้าโครงการ Faculty Mentorship ด้าน Work-Life Integration'
    ]
  },
  {
    ...calculateCandidateResult('นพ. ธนกฤต วิเศษไชยศรี', cand3Answers, {
      specialty: 'โสต ศอ นาสิกวิทยา (ENT)',
      hospitalOrSchool: 'รพ.รามาธิบดี / รพ.ทั่วไปสุราษฎร์ธานี',
      candidateContextNote: 'ช่วงที่ผ่านมาควงเวรติดต่อกันหลายวัน ทำให้พักผ่อนน้อยและรู้สึกกดดันกับตนเองมาก บางครั้งจึงใช้เวลากับตนเองหรือกาแฟเข้มข้นเพื่อประคองวัน แต่พร้อมอย่างยิ่งที่จะเรียนรู้และปรับตัวภายใต้การดูแลของอาจารย์'
    }),
    id: 'CAND-2026-083',
    submittedAt: '2026-10-21T14:30:00.000Z',
    committeeStatus: 'NEEDS_INTERVIEW_PROBE',
    interviewerRating: 3,
    committeeNotes: 'Support Needs Index อยู่ในระดับที่แนะนำระบบ Mentor ดูแลใกล้ชิด (คะแนน 15/20) ชื่นชมในความกล้าเปิดเผยข้อจำกัดเรื่องการนอนหลับ แนะนำจับคู่ Mentor และสนับสนุนเรื่อง Sleep Hygiene',
    institutionalCarePlan: [
      'แต่งตั้ง Senior Resident Buddy ช่วยประคองช่วง 3 เดือนแรก',
      'ติดตามระบบ Sleep Hygiene & Rotation Schedule เป็นพิเศษ',
      'จัดเซสชั่น Debrief เชิงสร้างสรรค์หลังเคสผ่าตัดฉุกเฉินหรือภาวะแทรกซ้อน'
    ]
  }
];

const LOCAL_STORAGE_KEY = 'resicope_candidates_v3';

export function getStoredCandidates(): CandidateAssessmentResult[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CANDIDATES));
      return INITIAL_MOCK_CANDIDATES.map((c) => ensureCandidateData(c));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c: any) => ensureCandidateData(c));
    }
    return INITIAL_MOCK_CANDIDATES.map((c) => ensureCandidateData(c));
  } catch {
    return INITIAL_MOCK_CANDIDATES.map((c) => ensureCandidateData(c));
  }
}

export function saveCandidateResult(result: CandidateAssessmentResult): void {
  try {
    const list = getStoredCandidates();
    const updated = [result, ...list.filter((c) => c.id !== result.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save candidate to localStorage', e);
  }
}

export function updateCandidateInStorage(result: CandidateAssessmentResult): void {
  try {
    const list = getStoredCandidates();
    const updated = list.map((c) => (c.id === result.id ? result : c));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update candidate in localStorage', e);
  }
}

export function resetCandidatesToDefault(): CandidateAssessmentResult[] {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CANDIDATES));
    return INITIAL_MOCK_CANDIDATES;
  } catch {
    return INITIAL_MOCK_CANDIDATES;
  }
}
