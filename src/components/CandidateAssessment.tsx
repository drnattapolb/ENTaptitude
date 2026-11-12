import React, { useState, useEffect } from 'react';
import {
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Home,
  Award,
  Sparkles,
  RotateCcw,
  Check,
  Clock,
  X,
  Stethoscope
} from 'lucide-react';
import { QUESTION_SETS } from '../data/assessmentData';
import { CandidateAssessmentResult, OptionKey } from '../types/assessment';
import { calculateCandidateResult } from '../utils/scoring';
import { saveCandidateResult } from '../data/mockCandidates';
import { saveCandidateToCloud } from '../services/candidateService';
import { CandidateCompletionScreen } from './CandidateCompletionScreen';

interface CandidateAssessmentProps {
  onComplete: () => void;
  onExit: () => void;
  setCandidateNameHeader: (name: string) => void;
}

export type OptionSelectionStatus = 'none' | 'most' | 'least';

export interface SetOptionStateItem {
  id: OptionKey;
  status: OptionSelectionStatus;
}

export interface QuestionSetState {
  setId: number;
  options: SetOptionStateItem[];
}

const INITIAL_SETS_STATE: QuestionSetState[] = QUESTION_SETS.map((q) => ({
  setId: q.id,
  options: [
    { id: 'A', status: 'none' },
    { id: 'B', status: 'none' },
    { id: 'C', status: 'none' },
    { id: 'D', status: 'none' }
  ]
}));

export const CandidateAssessment: React.FC<CandidateAssessmentProps> = ({
  onComplete,
  onExit,
  setCandidateNameHeader
}) => {
  const [step, setStep] = useState<'NAME_INPUT' | 'INSTRUCTIONS' | 'QUESTIONS' | 'SUBMIT_CONFIRM' | 'SUCCESS'>('NAME_INPUT');
  
  const [candidateName, setCandidateName] = useState('');
  const [specialty, setSpecialty] = useState('โสต ศอ นาสิกวิทยา (ENT)');
  const [hospitalOrSchool, setHospitalOrSchool] = useState('');
  const [candidateContextNote, setCandidateContextNote] = useState('');
  const [nameError, setNameError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);

  // Centralized state array for all 7 sets, tracking 4 options with status 'none' | 'most' | 'least'
  const [setsState, setSetsState] = useState<QuestionSetState[]>(INITIAL_SETS_STATE);

  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [finalResult, setFinalResult] = useState<CandidateAssessmentResult | null>(null);

  // Zen Timer Mode (Reduces Test Anxiety)
  const [isZenMode, setIsZenMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (step !== 'QUESTIONS') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const currentSet = QUESTION_SETS[currentIndex];
  const currentSetState = setsState[currentIndex] || {
    setId: currentSet.id,
    options: [
      { id: 'A', status: 'none' },
      { id: 'B', status: 'none' },
      { id: 'C', status: 'none' },
      { id: 'D', status: 'none' }
    ]
  };

  const blueOption = currentSetState.options.find((o) => o.status === 'most')?.id || null;
  const redOption = currentSetState.options.find((o) => o.status === 'least')?.id || null;
  const mostCount = currentSetState.options.filter((o) => o.status === 'most').length;
  const leastCount = currentSetState.options.filter((o) => o.status === 'least').length;

  // Strict validation: exactly one 'most' (blue) and one 'least' (red)
  const isCurrentSetValid = mostCount === 1 && leastCount === 1 && blueOption !== null && redOption !== null && blueOption !== redOption;

  // -------------------------------------------------------------
  // CENTRALIZED OPTION STATUS CONTROLLER
  // Mutates the centralized state array:
  // - Enforces at most 1 'most' and at most 1 'least' per set.
  // - Ensures an option is never both 'most' and 'least'.
  // - Supports direct toggle ('most'/'least') and smart card tap cycle.
  // -------------------------------------------------------------
  const selectOptionStatus = (optId: OptionKey, mode: 'most' | 'least' | 'cycle') => {
    setValidationWarning(null);

    setSetsState((prevSets) =>
      prevSets.map((set, sIdx) => {
        if (sIdx !== currentIndex) return set;

        const currentOptions = set.options;
        const currentItem = currentOptions.find((o) => o.id === optId);
        const currentStatus = currentItem?.status || 'none';

        let nextOptions: SetOptionStateItem[];

        if (mode === 'most') {
          // Toggle off if already 'most'
          if (currentStatus === 'most') {
            nextOptions = currentOptions.map((o) =>
              o.id === optId ? { ...o, status: 'none' } : o
            );
          } else {
            // Set this optId to 'most', clear 'most' from other options
            nextOptions = currentOptions.map((o) => {
              if (o.id === optId) return { ...o, status: 'most' };
              if (o.status === 'most') return { ...o, status: 'none' };
              return o;
            });
          }
        } else if (mode === 'least') {
          // Toggle off if already 'least'
          if (currentStatus === 'least') {
            nextOptions = currentOptions.map((o) =>
              o.id === optId ? { ...o, status: 'none' } : o
            );
          } else {
            // Set this optId to 'least', clear 'least' from other options
            nextOptions = currentOptions.map((o) => {
              if (o.id === optId) return { ...o, status: 'least' };
              if (o.status === 'least') return { ...o, status: 'none' };
              return o;
            });
          }
        } else {
          // 'cycle': 'none' -> 'most' -> 'least' -> 'none'
          if (currentStatus === 'most') {
            nextOptions = currentOptions.map((o) => {
              if (o.id === optId) return { ...o, status: 'least' };
              if (o.status === 'least') return { ...o, status: 'none' };
              return o;
            });
          } else if (currentStatus === 'least') {
            nextOptions = currentOptions.map((o) =>
              o.id === optId ? { ...o, status: 'none' } : o
            );
          } else {
            // Smart cycle: If another option is already 'most' and no option is 'least',
            // assign as 'least' directly!
            const hasMost = currentOptions.some((o) => o.status === 'most');
            const hasLeast = currentOptions.some((o) => o.status === 'least');

            if (hasMost && !hasLeast) {
              nextOptions = currentOptions.map((o) =>
                o.id === optId ? { ...o, status: 'least' } : o
              );
            } else {
              nextOptions = currentOptions.map((o) => {
                if (o.id === optId) return { ...o, status: 'most' };
                if (o.status === 'most') return { ...o, status: 'none' };
                return o;
              });
            }
          }
        }

        return {
          ...set,
          options: nextOptions
        };
      })
    );
  };

  const handleOptionTap = (optId: OptionKey) => {
    selectOptionStatus(optId, 'cycle');
  };

  const handleSetMost = (optId: OptionKey, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    selectOptionStatus(optId, 'most');
  };

  const handleSetLeast = (optId: OptionKey, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    selectOptionStatus(optId, 'least');
  };

  const handleResetCurrentSet = () => {
    setValidationWarning(null);
    setSetsState((prevSets) =>
      prevSets.map((set, sIdx) =>
        sIdx === currentIndex
          ? {
              ...set,
              options: set.options.map((o) => ({ ...o, status: 'none' }))
            }
          : set
      )
    );
  };

  const handleClearOption = (statusToClear: 'most' | 'least') => {
    setValidationWarning(null);
    setSetsState((prevSets) =>
      prevSets.map((set, sIdx) =>
        sIdx === currentIndex
          ? {
              ...set,
              options: set.options.map((o) =>
                o.status === statusToClear ? { ...o, status: 'none' } : o
              )
            }
          : set
      )
    );
  };

  const handleNext = () => {
    if (!isCurrentSetValid) {
      if (mostCount === 0 && leastCount === 0) {
        setValidationWarning('กรุณาเลือก ข้อที่เป็นตัวท่านมากที่สุด 1 ข้อ และน้อยที่สุด 1 ข้อ');
      } else if (mostCount === 0) {
        setValidationWarning('ยังไม่ได้เลือกข้อที่ "เป็นตัวท่านมากที่สุด"');
      } else if (leastCount === 0) {
        setValidationWarning('ยังไม่ได้เลือกข้อที่ "เป็นตัวท่านน้อยที่สุด"');
      }
      return;
    }

    setValidationWarning(null);
    if (currentIndex < QUESTION_SETS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('SUBMIT_CONFIRM');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setValidationWarning(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitAssessment = async () => {
    for (let i = 0; i < setsState.length; i++) {
      const set = setsState[i];
      const m = set.options.find((o) => o.status === 'most')?.id;
      const l = set.options.find((o) => o.status === 'least')?.id;
      if (!m || !l || m === l) {
        setValidationWarning(`ชุดที่ ${set.setId} ยังเลือกไม่ครบ (ต้องมีข้อมากที่สุด 1 ข้อ และน้อยที่สุด 1 ข้อ)`);
        setCurrentIndex(i);
        setStep('QUESTIONS');
        return;
      }
    }

    const finalizedAnswers: Record<number, { most: OptionKey; least: OptionKey }> = {};
    setsState.forEach((set) => {
      const m = set.options.find((o) => o.status === 'most')!.id;
      const l = set.options.find((o) => o.status === 'least')!.id;
      finalizedAnswers[set.setId] = { most: m, least: l };
    });

    setIsSubmitting(true);
    let result: CandidateAssessmentResult;

    // Secure Backend State Management & Scoring Verification:
    // Call server API endpoint to validate answers and calculate authoritative scores
    try {
      const response = await fetch('/api/assessment/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          answers: finalizedAnswers,
          metadata: {
            specialty,
            hospitalOrSchool: hospitalOrSchool.trim() || 'ผู้สมัครแพทย์ประจำบ้าน',
            candidateContextNote: candidateContextNote.trim() || undefined
          }
        })
      });

      if (response.ok) {
        const payload = await response.json();
        result = payload.result;
        console.log('✅ Server-authoritative evaluation completed & verified.');
      } else {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || 'Server evaluation returned non-200');
      }
    } catch (apiErr) {
      console.warn('Backend evaluation fallback to resilient client calculation:', apiErr);
      result = calculateCandidateResult(candidateName.trim(), finalizedAnswers, {
        specialty,
        hospitalOrSchool: hospitalOrSchool.trim() || 'ผู้สมัครแพทย์ประจำบ้าน',
        candidateContextNote: candidateContextNote.trim() || undefined
      });
    }

    saveCandidateResult(result);

    try {
      await saveCandidateToCloud(result);
    } catch (cloudErr) {
      console.warn('Direct cloud save notification (cached locally):', cloudErr);
    } finally {
      setIsSubmitting(false);
      setFinalResult(result);
      setSubmissionId(result.id);
      setStep('SUCCESS');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard Shortcuts for Rapid Zero-Scroll Assessment (1-4, Arrow Keys)
  React.useEffect(() => {
    if (step !== 'QUESTIONS') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;

      const key = e.key.toLowerCase();
      if (key === '1' || key === 'a') {
        selectOptionStatus('A', 'cycle');
      } else if (key === '2' || key === 'b') {
        selectOptionStatus('B', 'cycle');
      } else if (key === '3' || key === 'c') {
        selectOptionStatus('C', 'cycle');
      } else if (key === '4' || key === 'd') {
        selectOptionStatus('D', 'cycle');
      } else if (key === 'arrowright' || (key === 'enter' && isCurrentSetValid)) {
        if (isCurrentSetValid) {
          handleNext();
        }
      } else if (key === 'arrowleft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isCurrentSetValid, currentIndex]);

  // Auto-Scroll to top smoothly on question change or step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, step]);

  const handleSafeExit = () => {
    if (window.confirm('คุณต้องการออกจากแบบสำรวจและกลับสู่หน้าหลักหรือไม่?')) {
      onExit();
    }
  };

  const renderMinimalHeader = () => (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E2ECE5] transition-all">
      <div className="w-full max-w-[680px] mx-auto px-4 h-12 sm:h-13 flex items-center justify-between box-border">
        <div
          onClick={handleSafeExit}
          title="แตะเพื่อกลับหน้าแรก"
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group select-none"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#5A826B] to-[#3D5C4A] p-0.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[6px] sm:rounded-[9px] flex items-center justify-center">
              <Stethoscope className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4A6B56]" />
            </div>
          </div>
          <span className="text-xs sm:text-base font-extrabold tracking-tight text-[#1F2823] group-hover:text-[#4A6B56] transition-colors">
            ResiCope
          </span>
        </div>
        <button
          onClick={handleSafeExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#58665E] hover:text-[#1F2823] px-3 py-1.5 rounded-xl border border-[#D6E2DA] bg-white hover:bg-[#F2F7F4] transition-all cursor-pointer shadow-2xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>หน้าแรก</span>
        </button>
      </div>
    </header>
  );

  // -------------------------------------------------------------
  // STEP 1: NAME INPUT (Minimal & Fast)
  // -------------------------------------------------------------
  if (step === 'NAME_INPUT') {
    return (
      <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col justify-between pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {renderMinimalHeader()}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 w-full box-border">
          <div className="w-full max-w-[680px] rounded-[28px] organic-card p-5 sm:p-8 bg-white border border-[#D6E2DA] shadow-[0_10px_30px_rgba(74,107,86,0.08)] box-border">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EBF2ED] border border-[#C6D8CC] flex items-center justify-center text-[#4A6B56] mb-3 shadow-sm">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#1F2823]">
              ข้อมูลผู้สมัคร
            </h2>
            <p className="text-xs text-[#58665E] mt-1">
              กรอกชื่อเพื่อเริ่มต้นทำแบบสำรวจ
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!candidateName.trim()) {
                setNameError('กรุณากรอกชื่อ-นามสกุล');
                return;
              }
              setCandidateNameHeader(candidateName.trim());
              setStep('INSTRUCTIONS');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-[#38453E] mb-1.5">
                ชื่อ-นามสกุล <span className="text-[#D46B47]">*</span>
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  setNameError('');
                }}
                placeholder="เช่น นพ. วัฒนา สุขสมบูรณ์"
                className={`w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border text-sm text-[#1F2823] placeholder:text-[#9AA8A0] focus:outline-none transition-all ${
                  nameError
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-[#D6E2DA] focus:border-[#4A6B56] focus:ring-2 focus:ring-[#4A6B56]/15'
                }`}
                autoFocus
              />
              {nameError && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#38453E] mb-1.5">
                สาขาวิชา
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border border-[#D6E2DA] text-sm text-[#1F2823] focus:outline-none focus:border-[#4A6B56]"
              >
                <option value="โสต ศอ นาสิกวิทยา (ENT)">โสต ศอ นาสิกวิทยา (ENT)</option>
                <option value="ศัลยศาสตร์ทั่วไป (Surgery)">ศัลยศาสตร์ทั่วไป (Surgery)</option>
                <option value="อายุรศาสตร์ (Medicine)">อายุรศาสตร์ (Medicine)</option>
                <option value="กุมารเวชศาสตร์ (Pediatrics)">กุมารเวชศาสตร์ (Pediatrics)</option>
                <option value="สูติศาสตร์-นรีเวชวิทยา (OB-GYN)">สูติศาสตร์-นรีเวชวิทยา (OB-GYN)</option>
                <option value="ออร์โธปิดิกส์ (Orthopedics)">ออร์โธปิดิกส์ (Orthopedics)</option>
                <option value="เวชศาสตร์ฉุกเฉิน (ER)">เวชศาสตร์ฉุกเฉิน (ER)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#38453E] mb-1.5">
                สังกัดเดิม / โรงพยาบาล
              </label>
              <input
                type="text"
                value={hospitalOrSchool}
                onChange={(e) => setHospitalOrSchool(e.target.value)}
                placeholder="เช่น รพ.ศูนย์ หรือสถาบันเดิม"
                className="w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border border-[#D6E2DA] text-sm text-[#1F2823] placeholder:text-[#9AA8A0] focus:outline-none focus:border-[#4A6B56]"
              />
            </div>

            <button
              type="submit"
              className="spring-bounce w-full mt-2 py-3.5 px-4 rounded-xl bg-[#D46B47] hover:bg-[#BF5A37] text-white font-bold text-sm shadow-md shadow-[#D46B47]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>ขั้นตอนถัดไป</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

  // -------------------------------------------------------------
  // STEP 2: INSTRUCTIONS (Visual 3-Step Demo, Zero Dense Text)
  // -------------------------------------------------------------
  if (step === 'INSTRUCTIONS') {
    return (
      <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col justify-between pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {renderMinimalHeader()}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 w-full box-border">
          <div className="w-full max-w-[680px] rounded-[28px] organic-card p-5 sm:p-8 bg-white border border-[#D6E2DA] shadow-[0_10px_30px_rgba(74,107,86,0.08)] box-border">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF2ED] text-[#375241] border border-[#C6D8CC] inline-block mb-2">
              7 ชุดคำถาม • ชุดละ 4 ตัวเลือก
            </span>
            <h2 className="text-xl font-bold text-[#1F2823]">
              วิธีตอบแบบสำรวจ
            </h2>
            <p className="text-xs text-[#58665E] mt-1">
              ในแต่ละชุดคำถาม ให้เลือก 2 ตัวเลือกตามพฤติกรรมจริงของท่าน (ไม่มีข้อถูกหรือผิด)
            </p>
          </div>

          {/* VISUAL 3-CARD RULE GUIDE (Replaces lengthy text) */}
          <div className="space-y-3 mb-6">
            {/* Rule 1 */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  1
                </span>
                <div>
                  <div className="text-xs font-bold text-sky-950">เป็นตัวท่านมากที่สุด</div>
                  <div className="text-[11px] text-sky-800">เลือก 1 ข้อความที่ตรงกับพฤติกรรมจริงของท่านมากที่สุด</div>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-lg">
                มากที่สุด (1 ข้อ)
              </span>
            </div>

            {/* Rule 2 */}
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  2
                </span>
                <div>
                  <div className="text-xs font-bold text-rose-950">เป็นตัวท่านน้อยที่สุด</div>
                  <div className="text-[11px] text-rose-800">เลือก 1 ข้อความที่ตรงกับพฤติกรรมจริงของท่านน้อยที่สุด</div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                น้อยที่สุด (1 ข้อ)
              </span>
            </div>

            {/* Rule 3 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E2ECE5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white border border-[#D6E2DA] text-[#6E7E74] font-bold text-xs flex items-center justify-center shadow-sm">
                  3
                </span>
                <div>
                  <div className="text-xs font-bold text-[#1F2823]">2 ตัวเลือกที่เหลือ</div>
                  <div className="text-[11px] text-[#6E7E74]">เว้นว่างไว้เป็นพฤติกรรมระดับปานกลาง</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#4A6B56] bg-[#EBF2ED] px-2.5 py-1 rounded-lg">
                ปานกลาง (2 ข้อ)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('NAME_INPUT')}
              className="spring-bounce px-4 py-3 rounded-xl text-xs font-bold text-[#58665E] hover:text-[#1F2823] bg-[#EBF2ED] transition-colors"
            >
              แก้ไขชื่อ
            </button>
            <button
              onClick={() => setStep('QUESTIONS')}
              className="spring-bounce flex-1 py-3.5 px-5 rounded-xl bg-[#D46B47] hover:bg-[#BF5A37] text-white font-bold text-sm shadow-md shadow-[#D46B47]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>เริ่มทำแบบสำรวจ (ชุดที่ 1)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

  // -------------------------------------------------------------
  // STEP 4: SUBMIT CONFIRMATION & REVIEW (Visual Grid)
  // -------------------------------------------------------------
  if (step === 'SUBMIT_CONFIRM') {
    return (
      <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col justify-between pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {renderMinimalHeader()}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 w-full box-border">
          <div className="w-full max-w-[680px] rounded-[28px] organic-card p-5 sm:p-8 bg-white border border-[#D6E2DA] shadow-[0_10px_30px_rgba(74,107,86,0.08)] box-border">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EBF2ED] border border-[#C6D8CC] flex items-center justify-center text-[#4A6B56] mb-3 shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#1F2823]">
              ตรวจสอบคำตอบ
            </h2>
            <p className="text-xs text-[#58665E] mt-1">
              ผู้สมัคร: <strong className="text-[#1F2823]">{candidateName}</strong> ({specialty})
            </p>
          </div>

          {/* Visual Mini Grid */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E2ECE5] mb-6">
            <div className="flex justify-between text-xs font-bold text-[#1F2823] mb-2.5 px-1">
              <span>สรุป 7 ชุดคำถาม</span>
              <span className="text-[#4A6B56]">ครบถ้วน ✓</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-xs">
              {QUESTION_SETS.map((q, idx) => {
                const setObj = setsState[idx];
                const mostOpt = setObj?.options.find((o) => o.status === 'most')?.id;
                const leastOpt = setObj?.options.find((o) => o.status === 'least')?.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setStep('QUESTIONS');
                    }}
                    className="cursor-pointer p-2 rounded-xl bg-white hover:bg-[#EBF2ED] border border-[#D6E2DA] shadow-sm transition-all"
                    title={`คลิกแก้ไขชุดที่ ${q.id}`}
                  >
                    <div className="text-[10px] text-[#7E8F84] font-sans">#{q.id}</div>
                    <div className="text-sky-600 font-bold mt-0.5">{mostOpt || '-'}</div>
                    <div className="text-rose-500 font-bold">{leastOpt || '-'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Candidate's Context Note (Mentorship Conversation Starter) */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#FAF7F2] via-emerald-50/40 to-teal-50/50 border border-emerald-200/80 shadow-xs text-left">
            <div className="flex items-start gap-2.5 mb-2">
              <span className="text-base shrink-0">📝</span>
              <div>
                <h3 className="text-xs font-bold text-[#2D5C39] flex items-center flex-wrap gap-1.5">
                  <span>บันทึกบริบทเพิ่มเติมถึงอาจารย์ผู้สัมภาษณ์ (Context Note)</span>
                  <span className="text-[10px] font-normal text-[#58665E] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    ไม่บังคับ (Optional)
                  </span>
                </h3>
                <p className="text-[11px] text-[#58665E] leading-relaxed mt-1">
                  มีบริบทการทำงาน ข้อจำกัด หรือเหตุการณ์เฉพาะที่อยากแชร์ให้อาจารย์ผู้สัมภาษณ์เข้าใจสไตล์การรับมือของคุณเพิ่มเติมหรือไม่? ภาควิชาใช้ข้อความนี้เพื่อเปิดบทสนทนาการให้คำปรึกษา (Mentorship) อย่างสร้างสรรค์
                </p>
              </div>
            </div>
            <textarea
              rows={3}
              value={candidateContextNote}
              onChange={(e) => setCandidateContextNote(e.target.value)}
              placeholder="เช่น 'ในช่วงที่อยู่เวรหนักติดต่อกัน อาจมีความกังวลเรื่องการนอนหลับบ้าง หรือในเคสที่ท้าทาย มักชอบทบทวนร่วมกับอาจารย์หรือพี่เดนท์เพื่อหาแนวทางปรับปรุง...'"
              className="w-full p-3 rounded-xl bg-white border border-[#D6E2DA] text-xs text-[#1F2823] placeholder:text-[#9AA8A0] focus:outline-none focus:border-[#4A6B56] focus:ring-2 focus:ring-[#4A6B56]/15 transition-all resize-none mt-1"
            />
          </div>

          {validationWarning && (
            <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-300 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationWarning}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentIndex(6);
                setStep('QUESTIONS');
              }}
              className="spring-bounce px-4 py-3 rounded-xl text-xs font-bold text-[#58665E] hover:text-[#1F2823] bg-[#EBF2ED] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>แก้ไข</span>
            </button>
            <button
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
              className={`spring-bounce flex-1 py-3.5 px-5 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-emerald-700 opacity-80 cursor-wait'
                  : 'bg-[#D46B47] hover:bg-[#BF5A37] shadow-[#D46B47]/20 cursor-pointer active:scale-95'
              }`}
            >
              <Send className={`w-4 h-4 ${isSubmitting ? 'animate-bounce' : ''}`} />
              <span>{isSubmitting ? 'กำลังส่งข้อมูลเข้าสู่ระบบกลาง...' : 'ส่งแบบสำรวจ (Submit)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

  // -------------------------------------------------------------
  // STEP 5: SUCCESS - ROUTE CANDIDATE TO COMPLETION SCREEN
  // -------------------------------------------------------------
  if (step === 'SUCCESS') {
    return (
      <CandidateCompletionScreen
        onReturnHome={onExit}
      />
    );
  }

  // -------------------------------------------------------------
  // STEP 3: QUESTIONS (Sets 1 to 7) - Streamlined Zero-Clutter UX
  // -------------------------------------------------------------
  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] text-[#1F2823] flex flex-col justify-between overflow-x-hidden">
      {/* SINGLE CONSOLIDATED STICKY TOP HEADER BAR */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E2ECE5] transition-all">
        <div className="w-full max-w-[680px] mx-auto px-3 sm:px-4 h-12 sm:h-13 flex items-center justify-between gap-1.5 sm:gap-2 box-border">
          
          {/* 1. Left: Logo/Title 'ResiCope' */}
          <div
            onClick={handleSafeExit}
            title="แตะเพื่อกลับหน้าแรก"
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group select-none shrink-0"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#5A826B] to-[#3D5C4A] p-0.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#FAF7F2] rounded-[6px] sm:rounded-[9px] flex items-center justify-center">
                <Stethoscope className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4A6B56]" />
              </div>
            </div>
            <span className="text-xs sm:text-base font-extrabold tracking-tight text-[#1F2823] group-hover:text-[#4A6B56] transition-colors">
              ResiCope
            </span>
          </div>

          {/* 2. Center Progress: Compact badge on Mobile (< sm), Full 1-7 Numeric Stepper on Tablet/Desktop (>= sm) */}
          {/* Mobile view (< sm): Compact badge 'ชุดที่ X/7' to prevent overflow on narrow screens */}
          <div className="flex sm:hidden items-center justify-center shrink-0">
            <span className="text-[11px] font-mono font-bold text-[#2D5C39] bg-[#E3EFE6] border border-[#B8D7C0] px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
              ชุดที่ {currentIndex + 1}/7
            </span>
          </div>

          {/* Tablet & Desktop (>= sm): Stepper Dots (1-7) */}
          <div className="hidden sm:flex items-center justify-center gap-1 sm:gap-1.5 flex-1 max-w-xs mx-auto">
            {QUESTION_SETS.map((q, idx) => {
              const setItem = setsState[idx];
              const hasMost = setItem?.options.some((o) => o.status === 'most');
              const hasLeast = setItem?.options.some((o) => o.status === 'least');
              const isCompleted = Boolean(hasMost && hasLeast);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setValidationWarning(null);
                  }}
                  title={`ไปชุดที่ ${q.id}${isCompleted ? ' (ตอบครบแล้ว)' : ''}`}
                  aria-label={`ชุดที่ ${q.id}`}
                  className={`font-mono text-xs font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#4A6B56] text-white shadow-xs ring-2 ring-[#4A6B56]/30 scale-105'
                      : isCompleted
                      ? 'text-[#2D5C39] bg-[#E3EFE6] border border-[#B8D7C0] hover:bg-[#d5e7d9]'
                      : 'text-[#829288] bg-white border border-[#D6E2DA] hover:text-[#1F2823] hover:border-[#4A6B56]/50'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>

          {/* 3. Right: Timer + Info (?) Button */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Zen Timer Mode */}
            <button
              type="button"
              onClick={() => setIsZenMode(!isZenMode)}
              className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg border border-[#D6E2DA] bg-white text-[#58665E] hover:text-[#1F2823] hover:bg-[#F2F7F4] transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
              title={isZenMode ? "แตะเพื่อแสดงเวลา" : "แตะเพื่อเปิด Zen Mode"}
              aria-label="จับเวลาทำแบบสำรวจ"
            >
              {isZenMode ? (
                <span className="font-sans font-medium text-[10px]">🧘 Zen</span>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-[#4A6B56]" />
                  <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
                </>
              )}
            </button>

            {/* Info (?) Button */}
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="p-1 sm:p-1.5 rounded-lg text-[#6E7E74] hover:text-[#2D5C39] hover:bg-[#EBF2ED] border border-transparent hover:border-[#C6D8CC] transition-all cursor-pointer shrink-0"
              title="เกณฑ์การตอบเพื่อความสบายใจ"
              aria-label="เกณฑ์การตอบเพื่อความสบายใจ"
            >
              <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#4A6B56]" />
            </button>
          </div>
        </div>

        {/* Thin 2px Progress Bar flush at bottom edge of sticky header */}
        <div className="w-full bg-[#E2ECE5] h-0.5 overflow-hidden">
          <div
            className="bg-[#4A6B56] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / 7) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Assessment Container (Target max-width: 680px for visual focus & ergonomic reading) */}
      <div className="flex-1 w-full max-w-[680px] mx-auto px-4 box-border pt-3.5 sm:pt-4.5 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col justify-between">
        <div>
          {/* Scenario Box (Clean & Compact) */}
          <div className="rounded-xl sm:rounded-2xl p-3.5 sm:p-4 bg-white border border-[#D6E2DA] shadow-xs mb-2.5 sm:mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4A6B56]">
                {currentSet.title.replace(/^ชุดที่\s*\d+\s*:\s*/, '')}
              </span>
            {(blueOption || redOption) && (
              <button
                type="button"
                onClick={handleResetCurrentSet}
                className="text-[10px] sm:text-[11px] text-[#718278] hover:text-[#D46B47] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้างตัวเลือก</span>
              </button>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#1F2823] leading-snug sm:leading-relaxed">
            {currentSet.scenario}
          </h3>
        </div>

        {/* 4 Standardized Option Cards with Toggle Chips */}
        <div className="space-y-2 mb-3">
          {currentSet.options.map((opt) => {
            const optState = currentSetState.options.find((o) => o.id === opt.id);
            const status = optState?.status || 'none';
            const isMost = status === 'most';
            const isLeast = status === 'least';

            return (
              <div
                key={opt.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                    selectOptionStatus(opt.id, 'cycle');
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && selectOptionStatus(opt.id, 'cycle')}
                className={`group rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-150 cursor-pointer select-none border flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 shadow-xs ${
                  isMost
                    ? 'bg-sky-50/75 border-sky-400 ring-1 ring-sky-300'
                    : isLeast
                    ? 'bg-rose-50/75 border-rose-400 ring-1 ring-rose-300'
                    : 'bg-white border-[#D6E2DA] hover:border-[#4A6B56]/40 hover:bg-[#FAFDFB]'
                }`}
              >
                {/* Content: Letter Badge + Text */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isMost
                        ? 'bg-sky-600 text-white'
                        : isLeast
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#F4EFEA] text-[#4A5750] border border-[#D6E2DA]'
                    }`}
                  >
                    {opt.id}
                  </span>

                  <p className={`text-xs sm:text-[13px] leading-snug sm:leading-relaxed transition-colors ${
                    isMost ? 'font-semibold text-sky-950' : isLeast ? 'font-semibold text-rose-950' : 'text-[#2C3831]'
                  }`}>
                    {opt.text}
                  </p>
                </div>

                {/* Right Side: Standardized Toggle Chips */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectOptionStatus(opt.id, 'most');
                    }}
                    className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isMost
                        ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs border border-sky-600'
                        : 'bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200'
                    }`}
                  >
                    {isMost && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>มากที่สุด</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectOptionStatus(opt.id, 'least');
                    }}
                    className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isLeast
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-600'
                        : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200'
                    }`}
                  >
                    {isLeast && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>น้อยที่สุด</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation Warning (Inline if explicitly triggered) */}
        {validationWarning && (
          <div className="text-xs text-rose-900 bg-rose-50 border border-rose-300 p-2 sm:p-2.5 rounded-xl flex items-center gap-2 mb-2 animate-in shake duration-200 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{validationWarning}</span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar: Keep only [ก่อนหน้า] and [ชุดถัดไป] */}
      <div className="sticky bottom-0 sm:bottom-3 z-50 w-full bg-white/95 backdrop-blur-md rounded-2xl border border-[#D6E2DA] p-2 sm:p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:pb-2.5 shadow-md flex items-center justify-between gap-2 box-border mt-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`spring-bounce flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold border transition-all ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed border-transparent text-[#9AA8A0]'
              : 'bg-[#FAF7F2] hover:bg-[#EBF2ED] border-[#D6E2DA] text-[#375241] shadow-2xs cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ก่อนหน้า</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!isCurrentSetValid}
          className={`spring-bounce flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
            isCurrentSetValid
              ? 'bg-[#D46B47] hover:bg-[#BF5A37] text-white shadow-[#D46B47]/20 active:scale-95 cursor-pointer'
              : 'bg-[#EBF2ED] text-[#718278] border border-[#D6E2DA] cursor-not-allowed opacity-85'
          }`}
        >
          <span>
            {isCurrentSetValid
              ? currentIndex === 6
                ? 'ตรวจสอบ (Submit)'
                : 'ชุดถัดไป'
              : !blueOption && !redOption
              ? 'เลือกอีก 2 ข้อ (มากที่สุด • น้อยที่สุด)'
              : !blueOption
              ? 'เลือกอีก 1 ข้อ (มากที่สุด)'
              : 'เลือกอีก 1 ข้อ (น้อยที่สุด)'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>

      {/* Psychological Safety Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-[#D6E2DA] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1F2823] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#4A6B56]" />
                <span>เกณฑ์การตอบเพื่อความสบายใจ</span>
              </h4>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#58665E] leading-relaxed">
              ภายใต้สภาวะความเครียดสะสมในการผ่าตัดและการเทรนนิ่ง แพทย์ส่วนใหญ่อาจมีพฤติกรรมหลายรูปแบบผสมผสานกัน ไม่มีข้อใดผิดหรือถูก ขอให้ท่านตอบตามความเป็นจริงที่สุด เพื่อให้ภาควิชาเข้าใจและเตรียมแผนซัพพอร์ตการเรียนของท่านได้อย่างตรงจุด
            </p>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#4A6B56] hover:bg-[#3D5C4A] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
