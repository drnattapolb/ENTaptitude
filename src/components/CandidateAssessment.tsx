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
  Clock
} from 'lucide-react';
import { QUESTION_SETS } from '../data/assessmentData';
import { CandidateAssessmentResult, OptionKey } from '../types/assessment';
import { calculateCandidateResult } from '../utils/scoring';
import { saveCandidateResult } from '../data/mockCandidates';
import { ResultDashboard } from './ResultDashboard';

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

  const handleSubmitAssessment = () => {
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

    const result = calculateCandidateResult(candidateName.trim(), finalizedAnswers, {
      specialty,
      hospitalOrSchool: hospitalOrSchool.trim() || 'ผู้สมัครแพทย์ประจำบ้าน',
      candidateContextNote: candidateContextNote.trim() || undefined
    });

    saveCandidateResult(result);
    setFinalResult(result);
    setSubmissionId(result.id);
    setStep('SUCCESS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // -------------------------------------------------------------
  // STEP 1: NAME INPUT (Minimal & Fast)
  // -------------------------------------------------------------
  if (step === 'NAME_INPUT') {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[28px] organic-card p-6 sm:p-8 bg-white border border-[#D6E2DA] shadow-[0_10px_30px_rgba(74,107,86,0.08)]">
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
    );
  }

  // -------------------------------------------------------------
  // STEP 2: INSTRUCTIONS (Visual 3-Step Demo, Zero Dense Text)
  // -------------------------------------------------------------
  if (step === 'INSTRUCTIONS') {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-[28px] organic-card p-6 sm:p-8 bg-white border border-[#D6E2DA] shadow-[0_10px_30px_rgba(74,107,86,0.08)]">
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

          {/* Program Director's Reassurance Note */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 text-white mb-4 shadow-sm text-left">
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">💬</span>
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-0.5">ข้อความจากประธานหลักสูตร:</span>
                <span className="text-slate-300 italic">"ภาควิชาไม่ได้มองหาคนที่ไร้ความเครียด แต่เรามองหาคนที่ตระหนักรู้ในตนเอง ตอบตามความเป็นจริงเพื่อให้เราเข้าใจและพร้อมดูแลคุณ"</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Badge */}
          <div className="p-3 rounded-xl bg-[#F8ECE8] border border-[#E9C5B9] text-xs text-[#A64525] flex items-center gap-2 mb-6 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#D46B47]" />
            <span>แต่ละชุดต้องเลือก <strong>มากที่สุด 1 ข้อ</strong> และ <strong>น้อยที่สุด 1 ข้อ</strong> จึงจะไปชุดถัดไปได้</span>
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
    );
  }

  // -------------------------------------------------------------
  // STEP 4: SUBMIT CONFIRMATION & REVIEW (Visual Grid)
  // -------------------------------------------------------------
  if (step === 'SUBMIT_CONFIRM') {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-[28px] organic-card p-6 sm:p-8 bg-white border border-[#D6E2DA] shadow-[0_10px_30px_rgba(74,107,86,0.08)]">
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
              className="spring-bounce flex-1 py-3.5 px-5 rounded-xl bg-[#D46B47] hover:bg-[#BF5A37] text-white font-bold text-sm shadow-md shadow-[#D46B47]/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>ส่งแบบสำรวจ (Submit)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 5: SUCCESS & RPG INFOGRAPHIC RESULT DASHBOARD
  // -------------------------------------------------------------
  if (step === 'SUCCESS' && finalResult) {
    return (
      <ResultDashboard
        candidate={finalResult}
        onExit={onExit}
      />
    );
  }

  // -------------------------------------------------------------
  // STEP 3: QUESTIONS (Sets 1 to 7) - Zero-Scroll Bento Grid UX
  // -------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-3 sm:py-5 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header & Visual Stepper */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF2ED] text-[#375241] border border-[#C6D8CC]">
              ชุดที่ {currentSet.id} จาก 7
            </span>

            {/* Zen Timer Mode (Reduces Test Anxiety) */}
            <button
              type="button"
              onClick={() => setIsZenMode(!isZenMode)}
              className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#D6E2DA] bg-white text-[#58665E] hover:text-[#1F2823] transition-colors shadow-xs cursor-pointer"
              title={isZenMode ? "แตะเพื่อแสดงเวลา" : "แตะเพื่อเปิด Zen Mode (ซ่อนตัวจับเวลาเพื่อลดความกังวล)"}
            >
              {isZenMode ? (
                <span>🧘 Zen Mode</span>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-[#4A6B56]" />
                  <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
                </>
              )}
            </button>

            <span className="text-xs text-[#6E7E74] hidden sm:inline">
              • {candidateName}
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1 sm:gap-1.5">
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
                  title={`ไปชุดที่ ${q.id}`}
                  className={`text-xs font-mono font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-[#4A6B56] text-white shadow-sm ring-2 ring-[#4A6B56]/30'
                      : isCompleted
                      ? 'text-[#2D5C39] bg-[#E3EFE6] border border-[#B8D7C0]'
                      : 'text-[#9AA8A0] bg-white border border-[#D6E2DA] hover:text-[#1F2823]'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E2ECE5] rounded-full h-1.5 sm:h-2 overflow-hidden mb-2.5">
          <div
            className="bg-[#4A6B56] h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / 7) * 100}%` }}
          />
        </div>

        {/* Live Touch Selection Tracker (Very Friendly Status Pill) */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#D6E2DA] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#2C3831] text-[11px] sm:text-xs">สถานะชุดนี้:</span>

            {/* Blue Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
              blueOption
                ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-sm'
                : 'bg-[#FAF7F2] border-dashed border-[#CCD8D0] text-[#7E8F84]'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${blueOption ? 'bg-sky-500' : 'bg-gray-300'}`} />
              <span>มากที่สุด: {blueOption ? `ข้อ ${blueOption}` : 'ยังไม่เลือก'}</span>
              {blueOption && (
                <button
                  type="button"
                  onClick={() => handleClearOption('most')}
                  className="ml-1 text-sky-600 hover:text-sky-900 hover:bg-sky-100 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  title="ยกเลิกข้อมากที่สุด"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Red Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
              redOption
                ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm'
                : 'bg-[#FAF7F2] border-dashed border-[#CCD8D0] text-[#7E8F84]'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${redOption ? 'bg-rose-500' : 'bg-gray-300'}`} />
              <span>น้อยที่สุด: {redOption ? `ข้อ ${redOption}` : 'ยังไม่เลือก'}</span>
              {redOption && (
                <button
                  type="button"
                  onClick={() => handleClearOption('least')}
                  className="ml-1 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  title="ยกเลิกข้อน้อยที่สุด"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {(blueOption || redOption) && (
            <button
              type="button"
              onClick={handleResetCurrentSet}
              className="flex items-center gap-1 text-[11px] font-bold text-[#718278] hover:text-[#D46B47] self-end sm:self-center transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวเลือกชุดนี้</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Question Scenario & 4 Options */}
      <div className="space-y-2.5 mb-3">
        {/* Scenario Box */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white organic-card border border-[#D6E2DA] shadow-xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4A6B56] mb-0.5">
            {currentSet.title}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#1F2823] leading-snug sm:leading-relaxed">
            {currentSet.scenario}
          </h3>
          <p className="text-[11px] text-[#718278] mt-1.5 flex flex-wrap items-center justify-between gap-1 font-medium">
            <span>💡 เลือกข้อที่เป็นตัวท่าน <strong>มากที่สุด 1 ข้อ</strong> และ <strong>น้อยที่สุด 1 ข้อ</strong></span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-[#4A6B56] bg-[#EBF2ED] px-2 py-0.5 rounded-md border border-[#C6D8CC]">
              <span>⌨️ คีย์ลัด: กด [1-4] เลือกข้อ • [Enter/➔] ถัดไป</span>
            </span>
          </p>
        </div>

        {/* Normative Validation Banner (Reduces Response Bias & Enhances Psychological Safety) */}
        <div className="rounded-xl p-2.5 sm:p-3 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-sky-50/80 border border-emerald-200/90 shadow-xs flex items-center gap-2.5 text-xs text-slate-700">
          <span className="text-base shrink-0">💡</span>
          <span className="leading-relaxed">
            <strong className="text-[#2D5C39]">เกณฑ์การตอบเพื่อความสบายใจ:</strong> ภายใต้สภาวะความเครียดสะสม แพทย์ส่วนใหญ่อาจมีพฤติกรรมหลายรูปแบบผสมผสานกัน ไม่มีข้อใดผิดหรือถูก
          </span>
        </div>

        {/* 4 Compact, Streamlined Option Cards (2x2 Grid on Tablet/Desktop, 1 Col on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
          {currentSet.options.map((opt) => {
            const optState = currentSetState.options.find((o) => o.id === opt.id);
            const status = optState?.status || 'none';
            const isMost = status === 'most';
            const isLeast = status === 'least';

            return (
              <div
                key={opt.id}
                onClick={() => handleOptionTap(opt.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOptionTap(opt.id)}
                className={`group relative rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-150 cursor-pointer select-none border flex flex-col justify-between gap-2 shadow-xs ${
                  isMost
                    ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-200 shadow-xs'
                    : isLeast
                    ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-200 shadow-xs'
                    : 'bg-white border-[#D6E2DA] hover:border-[#4A6B56]/50 hover:bg-[#FAFDFB]'
                }`}
              >
                {/* Content Row: Letter Badge + Text */}
                <div className="flex items-start gap-2.5">
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <span
                      className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg font-bold font-mono text-xs flex items-center justify-center transition-all ${
                        isMost
                          ? 'bg-sky-500 text-white shadow-xs'
                          : isLeast
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-[#F4EFEA] text-[#4A5750] border border-[#D6E2DA]'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span
                      className="hidden lg:inline-flex text-[9px] font-mono text-[#718278] bg-[#F0F5F2] border border-[#D6E2DA] px-1 py-0.2 rounded"
                      title={`กดเลข [${opt.id === 'A' ? '1' : opt.id === 'B' ? '2' : opt.id === 'C' ? '3' : '4'}] บนแป้นพิมพ์`}
                    >
                      {opt.id === 'A' ? '1' : opt.id === 'B' ? '2' : opt.id === 'C' ? '3' : '4'}
                    </span>
                  </div>

                  <p className={`text-xs sm:text-[13px] leading-snug sm:leading-relaxed transition-colors flex-1 ${
                    isMost ? 'font-semibold text-sky-950' : isLeast ? 'font-semibold text-rose-950' : 'text-[#2C3831]'
                  }`}>
                    {opt.text}
                  </p>
                </div>

                {/* Bottom Inline Action Bar: Clean status indicator + Side-by-side compact toggle buttons */}
                <div className="pt-1.5 border-t border-black/[0.04] flex items-center justify-between gap-1.5">
                  {/* Subtle Status Label */}
                  <div className="min-w-0 flex items-center">
                    {isMost ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-sky-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-sky-600 stroke-[2.5]" />
                        <span className="truncate">มากที่สุด</span>
                      </span>
                    ) : isLeast ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                        <span className="truncate">น้อยที่สุด</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#88998E]">แตะเพื่อเลือก</span>
                    )}
                  </div>

                  {/* Compact Side-by-Side Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleSetMost(opt.id, e)}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer ${
                        isMost
                          ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                          : 'bg-white hover:bg-sky-50 text-sky-700 border border-sky-200/90 hover:border-sky-300'
                      }`}
                    >
                      {isMost && <CheckCircle2 className="w-3 h-3 text-white stroke-[2.5]" />}
                      <span>มากที่สุด</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleSetLeast(opt.id, e)}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer ${
                        isLeast
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                          : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200/90 hover:border-rose-300'
                      }`}
                    >
                      {isLeast && <CheckCircle2 className="w-3 h-3 text-white stroke-[2.5]" />}
                      <span>น้อยที่สุด</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation Warning */}
        {validationWarning && (
          <div className="text-xs text-rose-900 bg-rose-50 border border-rose-300 p-2.5 sm:p-3 rounded-xl flex items-center gap-2 animate-in shake duration-200 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-bold">{validationWarning}</span>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar (Optimized for Mobile Thumb Reach) */}
      <div className="sticky bottom-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-[#D6E2DA] p-3 sm:p-4 shadow-lg flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`spring-bounce flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed border-transparent text-[#9AA8A0]'
              : 'bg-[#FAF7F2] hover:bg-[#EBF2ED] border-[#D6E2DA] text-[#375241] shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ก่อนหน้า</span>
        </button>

        <div className="text-xs text-center font-bold">
          {isCurrentSetValid ? (
            <span className="text-[#2D5C39] bg-[#E3EFE6] px-3 py-1.5 rounded-xl border border-[#B8D7C0] flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#2D5C39]" />
              <span>ครบถ้วน (มากที่สุด 1 • น้อยที่สุด 1)</span>
            </span>
          ) : (
            <span className="text-[#D46B47] bg-[#F8ECE8] px-3 py-1.5 rounded-xl border border-[#E9C5B9] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#D46B47]" />
              {!blueOption && !redOption && 'กรุณาเลือก มากที่สุด 1 และ น้อยที่สุด 1'}
              {!blueOption && redOption && 'ยังไม่ได้เลือกข้อ "มากที่สุด"'}
              {blueOption && !redOption && 'ยังไม่ได้เลือกข้อ "น้อยที่สุด"'}
              {blueOption && redOption && blueOption === redOption && 'ห้ามเลือกข้อเดียวกัน'}
            </span>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!isCurrentSetValid}
          className={`spring-bounce flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
            isCurrentSetValid
              ? 'bg-[#D46B47] hover:bg-[#BF5A37] text-white shadow-[#D46B47]/20 active:scale-95 cursor-pointer'
              : 'bg-[#EBF2ED] text-[#88998E] border border-[#D6E2DA] cursor-not-allowed opacity-60'
          }`}
        >
          <span>{currentIndex === 6 ? 'ตรวจสอบ (Submit)' : 'ชุดถัดไป'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
