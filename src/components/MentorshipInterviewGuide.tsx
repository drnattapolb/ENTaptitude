import React, { useState } from 'react';
import {
  Clock,
  Copy,
  Check,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  CheckSquare,
  Square,
  MessageCircle,
  Lightbulb,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';
import { CandidateAssessmentResult } from '../types/assessment';
import { updateCandidateInStorage } from '../data/mockCandidates';

interface MentorshipInterviewGuideProps {
  candidate: CandidateAssessmentResult;
  onUpdateCandidate: (updated: CandidateAssessmentResult) => void;
  isCompact?: boolean;
}

export const INSTITUTIONAL_CARE_OPTIONS = [
  {
    id: 'senior_buddy',
    label: 'แต่งตั้ง Senior Resident Buddy ช่วยประคองช่วง 3 เดือนแรก',
    description: 'จับคู่พี่เดนท์ปีสูงเป็นบัดดี้คอยประกบ แนะนำระบบวอร์ดและเทคนิคการปรับตัว'
  },
  {
    id: 'faculty_mentor',
    label: 'จัดเข้าโครงการ Faculty Mentorship ด้าน Work-Life Integration',
    description: 'ให้อาจารย์ที่ปรึกษาประจำตัวนัดหมายพูดคุยแบบสบายใจทุก 1-2 เดือน'
  },
  {
    id: 'sleep_hygiene_rotation',
    label: 'ติดตามระบบ Sleep Hygiene & Rotation Schedule เป็นพิเศษ',
    description: 'ดูแลความถี่ของการอยู่เวรติดกันและสนับสนุนสุขอนามัยการนอนหลับ'
  },
  {
    id: 'crisis_debrief',
    label: 'จัดเซสชั่น Debrief เชิงสร้างสรรค์หลังเคสผ่าตัดฉุกเฉินหรือภาวะแทรกซ้อน',
    description: 'สร้างพื้นที่ปลอดภัยทบทวนเคสโดยไม่ตอกย้ำความผิดพลาดส่วนบุคคล'
  }
];

export const MentorshipInterviewGuide: React.FC<MentorshipInterviewGuideProps> = ({
  candidate,
  onUpdateCandidate,
  isCompact = false
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [isCommitmentSaved, setIsCommitmentSaved] = useState(false);
  const [customCommitment, setCustomCommitment] = useState('');
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  // Current care plan items
  const carePlan = candidate.institutionalCarePlan || [];

  // 1. Extract Top Strengths / Buffs
  const topStrengths = candidate.rpgProfile?.activeBuffs && candidate.rpgProfile.activeBuffs.length > 0
    ? candidate.rpgProfile.activeBuffs.map((b) => `${b.icon} ${b.name} (${b.level})`).join(', ')
    : (() => {
        // Fallback from dimension results
        const sortedAdaptive = [...candidate.dimensionResults]
          .filter((d) => !d.isRedFlag)
          .sort((a, b) => b.score - a.score);
        return sortedAdaptive.slice(0, 2).map((d) => d.thaiName).join(', ') || 'Active Coping & Planning';
      })();

  // 2. Extract Top Support Needs (Energy Drains / High Red Flags)
  const supportNeeds = candidate.rpgProfile?.energyDrains && candidate.rpgProfile.energyDrains.length > 0
    ? candidate.rpgProfile.energyDrains
    : [];

  const handleCopyScript = () => {
    const text = 'ผลประเมินนี้ไม่ได้มีไว้เพื่อตัดคะแนน แต่มีไว้เพื่อให้ภาควิชาเข้าใจว่าจะช่วยซัพพอร์ตคุณอย่างไรให้เรียนได้อย่างมีความสุขตลอด 3 ปี';
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2200);
  };

  const handleToggleCareItem = (optionLabel: string) => {
    const exists = carePlan.includes(optionLabel);
    const updatedPlan = exists
      ? carePlan.filter((item) => item !== optionLabel)
      : [...carePlan, optionLabel];

    const updatedCandidate: CandidateAssessmentResult = {
      ...candidate,
      institutionalCarePlan: updatedPlan
    };

    updateCandidateInStorage(updatedCandidate);
    onUpdateCandidate(updatedCandidate);
    setIsCommitmentSaved(true);
    setTimeout(() => setIsCommitmentSaved(false), 1800);
  };

  const handleAddCustomCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommitment.trim()) return;

    const trimmed = customCommitment.trim();
    if (!carePlan.includes(trimmed)) {
      const updatedPlan = [...carePlan, trimmed];
      const updatedCandidate: CandidateAssessmentResult = {
        ...candidate,
        institutionalCarePlan: updatedPlan
      };
      updateCandidateInStorage(updatedCandidate);
      onUpdateCandidate(updatedCandidate);
      setCustomCommitment('');
      setIsCommitmentSaved(true);
      setTimeout(() => setIsCommitmentSaved(false), 1800);
    }
  };

  const handleRemoveCareItem = (itemToRemove: string) => {
    const updatedPlan = carePlan.filter((item) => item !== itemToRemove);
    const updatedCandidate: CandidateAssessmentResult = {
      ...candidate,
      institutionalCarePlan: updatedPlan
    };
    updateCandidateInStorage(updatedCandidate);
    onUpdateCandidate(updatedCandidate);
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#D6E2DA] shadow-sm overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white cursor-pointer select-none flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Interviewer Mentorship Guide</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-400/40 text-indigo-200">
                15-Min Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              แนวทางสนทนาเชิงจิตวิทยาและการจัดทำคำมั่นสัญญาการดูแล (Institutional Care)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {carePlan.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hidden sm:inline-flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{carePlan.length} แผนดูแลที่เลือก</span>
            </span>
          )}
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5 bg-[#FCFDFD]">
          {/* 3-STEP PROTOCOL CONTAINER */}
          <div className="space-y-4">
            {/* STEP 1: OPENING (1-2 Min) */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-sky-50/80 via-indigo-50/50 to-white border border-sky-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-sky-950">
                    STEP 1: OPENING (1-2 นาที) — สร้างความปลอดภัยทางจิตใจ (Psychological Safety)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-semibold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1–2 Min
                </span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-sky-200/80 relative group">
                <div className="text-[11px] font-bold text-sky-800 mb-1 flex items-center gap-1">
                  <span>🗣️ สคริปต์แนะนำให้อาจารย์กล่าวเพื่อเปิดบทสนทนา:</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed italic pr-20">
                  "ผลประเมินนี้ไม่ได้มีไว้เพื่อตัดคะแนน แต่มีไว้เพื่อให้ภาควิชาเข้าใจว่าจะช่วยซัพพอร์ตคุณอย่างไรให้เรียนได้อย่างมีความสุขตลอด 3 ปี"
                </p>

                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                  title="คัดลอกสคริปต์นี้"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 2: STRENGTHS & BUFFS (5 Min) */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2D5C39] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#1B3E25]">
                    STEP 2: STRENGTHS & BUFFS (5 นาที) — ชื่นชมจุดแข็งและกลไกเชิงรุก
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[#2D5C39] bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 5 Min
                </span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-[#2D5C39] font-bold">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>จุดเด่นที่ตรวจพบในสไตล์ของผู้สมัคร:</span>
                  <span className="font-semibold text-slate-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {topStrengths}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#1B3E25] block mb-0.5">💬 คำถามชวนคุย:</strong>
                  <span>"เห็นว่าคุณมีจุดเด่นในการวางแผนและรับมือเชิงบวกได้ดีมาก อยากให้เล่าถึงเคสหรือสถานการณ์จริงในวอร์ดที่คุณเคยดึงทักษะนี้มาใช้ประคองความเครียดให้ฟังหน่อยครับ/ค่ะ"</span>
                </div>
              </div>
            </div>

            {/* STEP 3: SUPPORT PROBES (7 Min) */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50/80 via-rose-50/40 to-white border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">
                    STEP 3: SUPPORT PROBES (7 นาที) — เจาะลึกจุดประคองพลังงานแบบเปิดใจ
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 7 Min
                </span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-amber-200/80 space-y-2.5">
                {/* Highlighted Energy Drains */}
                <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>จุดประคองพลังงาน (Support Need Area):</span>
                  <span className="text-slate-700 font-medium">
                    {supportNeeds.length > 0
                      ? supportNeeds.map((d) => d.name).join(' • ')
                      : 'ความล้าจากภาระงาน และสุขอนามัยการนอนหลับ'}
                  </span>
                </div>

                {/* Candidate Context Note Callout if available */}
                {candidate.candidateContextNote && (
                  <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200/80 text-xs">
                    <span className="font-bold text-indigo-900 block mb-0.5">
                      📝 ข้อมูลที่ผู้สมัครบันทึกไว้ล่วงหน้า (Candidate Note):
                    </span>
                    <p className="italic text-slate-800 font-medium">
                      "{candidate.candidateContextNote}"
                    </p>
                  </div>
                )}

                {/* Dynamic Probing Questions */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    💬 คำถามชวนคุย (ระบบสร้างให้อัตโนมัติตามสไตล์ผู้สมัคร):
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E2ECE5] text-xs text-slate-800 leading-relaxed flex items-start gap-2">
                    <span className="font-bold text-amber-700 shrink-0">•</span>
                    <span>
                      "เมื่อต้องเผชิญกับเคสที่ไม่เป็นไปตามความคาดหวัง หรือมีความรู้สึกโทษตัวเอง คุณมีวิธีสลัดความรู้สึกกดดันนี้อย่างไร?"
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E2ECE5] text-xs text-slate-800 leading-relaxed flex items-start gap-2">
                    <span className="font-bold text-amber-700 shrink-0">•</span>
                    <span>
                      "ในช่วงที่ต้องอยู่เวรดึกติดต่อกันหลายวัน คุณอยากให้อาจารย์และภาควิชาช่วยซัพพอร์ตเรื่องใดเป็นพิเศษ?"
                    </span>
                  </div>

                  {candidate.candidateContextNote && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs text-slate-800 leading-relaxed flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">•</span>
                      <span>
                        "เห็นที่คุณแชร์ไว้ในบันทึกเรื่องการปรับตัว อยากให้อธิบายเพิ่มเติมว่าภาควิชาจะช่วยเป็นลมใต้ปีกให้คุณได้อย่างไรบ้าง?"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INSTITUTIONAL CARE COMMITMENT (Actionable Post-Assessment Checklist) */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#FAF7F2] via-emerald-50/40 to-teal-50/30 border-2 border-[#B8D7C0] shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#D6E2DA]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#2D5C39]" />
                <h4 className="text-xs sm:text-sm font-extrabold text-[#1B3E25]">
                  📋 INSTITUTIONAL CARE COMMITMENT (แผนการดูแลต่อในชั้นเรียน)
                </h4>
              </div>
              {isCommitmentSaved && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3" />
                  <span>บันทึกแผนเรียบร้อย</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#58665E] mb-3 leading-relaxed">
              หากผู้สมัครคนนี้ผ่านการคัดเลือกเป็นแพทย์ประจำบ้าน ภาควิชาควรจัดเตรียมระบบสนับสนุนใดให้พร้อมตั้งแต่วันแรก:
            </p>

            {/* Checklist Options */}
            <div className="space-y-2 mb-4">
              {INSTITUTIONAL_CARE_OPTIONS.map((opt) => {
                const isSelected = carePlan.includes(opt.label);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleCareItem(opt.label)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggleCareItem(opt.label)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-300'
                        : 'bg-white border-[#D6E2DA] hover:border-[#4A6B56]/60 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-snug">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-[#6E7E74] mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Custom Added Commitments */}
              {carePlan
                .filter((item) => !INSTITUTIONAL_CARE_OPTIONS.some((o) => o.label === item))
                .map((customItem, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border bg-emerald-50/90 border-emerald-400 text-emerald-950 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <CheckSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="text-xs font-bold">{customItem}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCareItem(customItem)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                      title="ลบรายการนี้"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
            </div>

            {/* Add Custom Commitment Field */}
            <form onSubmit={handleAddCustomCommitment} className="flex gap-2">
              <input
                type="text"
                value={customCommitment}
                onChange={(e) => setCustomCommitment(e.target.value)}
                placeholder="เพิ่มแผนการดูแลเฉพาะบุคคล (กด Enter เพื่อเพิ่ม)..."
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#D6E2DA] text-xs text-[#1F2823] placeholder:text-[#9AA8A0] focus:outline-none focus:border-[#4A6B56]"
              />
              <button
                type="submit"
                disabled={!customCommitment.trim()}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  customCommitment.trim()
                    ? 'bg-[#2D5C39] hover:bg-[#1E4027] text-white shadow-xs cursor-pointer'
                    : 'bg-[#EBF2ED] text-[#9AA8A0] cursor-not-allowed'
                }`}
              >
                เพิ่ม
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
