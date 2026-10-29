import React, { useState, useEffect } from 'react';
import {
  Zap,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Award,
  HeartHandshake,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  CheckSquare,
  Square,
  Star,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Send,
  Plus,
  Trash2
} from 'lucide-react';
import { CandidateAssessmentResult, RiskTier } from '../types/assessment';
import { QUESTION_SETS } from '../data/assessmentData';
import { ensureCandidateData } from '../utils/scoring';
import { updateCandidateInStorage } from '../data/mockCandidates';
import { RadarChartComponent } from './RadarChartComponent';

interface CandidateReportDetailProps {
  candidate: CandidateAssessmentResult;
  candidatesList?: CandidateAssessmentResult[];
  onSelectCandidateId?: (id: string) => void;
  onBack: () => void;
  onUpdateCandidate: (updated: CandidateAssessmentResult) => void;
}

export const INSTITUTIONAL_CARE_DEFAULTS = [
  'จัด Senior Resident Buddy ช่วยประคองช่วง 3 เดือนแรก',
  'เข้าโครงการ Faculty Mentorship ด้านการปรับตัว',
  'ติดตามสภาวะความล้าและตารางเวรเป็นพิเศษ',
  'จัดเซสชั่น Debrief เชิงสร้างสรรค์หลังเคสผ่าตัดฉุกเฉินหรือภาวะแทรกซ้อน'
];

export const CandidateReportDetail: React.FC<CandidateReportDetailProps> = ({
  candidate: rawCandidate,
  candidatesList,
  onSelectCandidateId,
  onBack,
  onUpdateCandidate
}) => {
  const candidate = ensureCandidateData(rawCandidate);

  // 3-TAB PROGRESSIVE DISCLOSURE ARCHITECTURE
  // Tab 1: ⚡ 15-Sec Quick View (Default)
  // Tab 2: 💬 Mentorship Protocol
  // Tab 3: 📊 Full Analytics
  const [activeTab, setActiveTab] = useState<'QUICK_VIEW' | 'MENTORSHIP_PROTOCOL' | 'ANALYTICS'>('QUICK_VIEW');

  // Interactive interview data state
  const [committeeNotes, setCommitteeNotes] = useState(candidate.committeeNotes || '');
  const [status, setStatus] = useState<'UNREVIEWED' | 'SHORTLISTED' | 'NEEDS_INTERVIEW_PROBE' | 'APPROVED' | 'CONCERN'>(candidate.committeeStatus || 'UNREVIEWED');
  const [rating, setRating] = useState<number>(candidate.interviewerRating || 0);
  const [carePlan, setCarePlan] = useState<string[]>(candidate.institutionalCarePlan || []);
  const [customCareText, setCustomCareText] = useState('');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Analytics accordion states
  const [expandedDimId, setExpandedDimId] = useState<number | null>(null);
  const [expandedSetId, setExpandedSetId] = useState<number | null>(null);
  const [filterSupportOnly, setFilterSupportOnly] = useState(false);

  // Sync state if candidate prop changes
  useEffect(() => {
    setCommitteeNotes(candidate.committeeNotes || '');
    setStatus(candidate.committeeStatus || 'UNREVIEWED');
    setRating(candidate.interviewerRating || 0);
    setCarePlan(candidate.institutionalCarePlan || []);
  }, [candidate.id]);

  // Candidate Navigation Switcher
  const currentIndex = candidatesList ? candidatesList.findIndex((c) => c.id === candidate.id) : -1;
  const prevCandidate = currentIndex > 0 && candidatesList ? candidatesList[currentIndex - 1] : null;
  const nextCandidate = currentIndex >= 0 && candidatesList && currentIndex < candidatesList.length - 1 ? candidatesList[currentIndex + 1] : null;

  // 1. Extract Top 2 Adaptive Strengths
  const topStrengths = candidate.rpgProfile?.activeBuffs && candidate.rpgProfile.activeBuffs.length > 0
    ? candidate.rpgProfile.activeBuffs.slice(0, 2)
    : [
        { id: 'active', name: 'Active Problem Solving', icon: '⚔️', level: 'Lv.2', effectDescription: 'ลงมือแก้ไขสถานการณ์เฉพาะหน้าอย่างรวดเร็ว' },
        { id: 'planning', name: 'Strategic Surgical Planning', icon: '🗺️', level: 'Lv.2', effectDescription: 'จัดลำดับขั้นตอนการรักษาอย่างเป็นระบบ' }
      ];

  // 2. Extract Top 1 Support Focus (Reframed Red Flag)
  const topSupportNeed = candidate.rpgProfile?.energyDrains && candidate.rpgProfile.energyDrains.length > 0
    ? {
        id: candidate.rpgProfile.energyDrains[0].id,
        name: candidate.rpgProfile.energyDrains[0].name,
        icon: candidate.rpgProfile.energyDrains[0].icon,
        advice: candidate.rpgProfile.energyDrains[0].reframedAdvice || candidate.rpgProfile.energyDrains[0].reframedTitle
      }
    : {
        id: 'self_blame',
        name: 'Self-Blame Loop',
        icon: '🌀',
        advice: 'แนวโน้มตำหนิตนเองเมื่อผลลัพธ์ไม่เป็นไปตามคาด แนะนำให้ส่งเสริม Psychologically Safe Debriefing'
      };

  // 3. Extract Key Value / Primary Asset
  const primaryAsset = candidate.rpgProfile?.archetype?.description ||
    'ความละเอียดรอบคอบในการทำหัตถการ ความมุ่งมั่นในการเรียนรู้ และความพร้อมในการร่วมมือกับทีมแพทย์ผ่าตัด';

  // 4. Dynamic Teleprompter Questions (High-Visibility)
  const dynamicStrengthsQuestion = (() => {
    const firstStrength = topStrengths[0]?.name.toLowerCase() || '';
    if (firstStrength.includes('plan') || firstStrength.includes('active')) {
      return 'เห็นว่าคุณวางแผนเชิงรุกและจัดระบบงานได้ดีมาก ช่วยเล่าเคสฉุกเฉินหรือหัตถการยากที่คุณดึงทักษะนี้มาใช้ให้ฟังหน่อยครับ/ค่ะ?';
    }
    if (firstStrength.includes('alliance') || firstStrength.includes('support')) {
      return 'คุณมีความโดดเด่นในการขอคำปรึกษาและประสานงานกับทีมแพทย์ ช่วยเล่าเหตุการณ์ที่คุณดึงความร่วมมือนี้มาช่วยคนไข้ให้ฟังหน่อยครับ/ค่ะ?';
    }
    return 'จากข้อมูลเห็นว่าคุณมีจุดแข็งด้านความยืดหยุ่นและการปรับมุมมองบวก ช่วยเล่าสถานการณ์ที่เจอปัญหาหนักแล้วคุณปรับสภาพจิตใจกลับมาได้อย่างไรครับ/ค่ะ?';
  })();

  const dynamicSupportQuestion = (() => {
    const drainName = topSupportNeed.name.toLowerCase();
    if (drainName.includes('blame')) {
      return 'ในการผ่าตัดจริง หากเกิดภาวะแทรกซ้อนที่อยู่นอกเหนือการควบคุมจนเกิดความรู้สึกกังวลในใจ คุณอยากให้อาจารย์และภาควิชาช่วยซัพพอร์ตอย่างไรเพื่อประคองความมั่นใจของคุณ?';
    }
    if (drainName.includes('substance') || drainName.includes('sleep') || drainName.includes('drain')) {
      return 'เมื่อต้องรับมือกับภาวะความล้าสะสมจากการอยู่เวรหนักต่อเนื่อง คุณอยากให้ภาควิชาช่วยซัพพอร์ตด้านสุขอนามัยการนอนหลับหรือตารางเวรอย่างไรเป็นพิเศษ?';
    }
    return 'เมื่อต้องรับมือกับภาวะความล้าสะสมจากการฝึกอบรม คุณอยากให้ภาควิชาช่วยซัพพอร์ตเรื่องไหนเป็นพิเศษเพื่อให้เรียนได้อย่างมีความสุขตลอด 3 ปี?';
  })();

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const handleToggleCareItem = (itemText: string) => {
    const exists = carePlan.includes(itemText);
    const updatedPlan = exists
      ? carePlan.filter((i) => i !== itemText)
      : [...carePlan, itemText];
    setCarePlan(updatedPlan);

    const updatedCandidate: CandidateAssessmentResult = {
      ...candidate,
      institutionalCarePlan: updatedPlan
    };
    updateCandidateInStorage(updatedCandidate);
    onUpdateCandidate(updatedCandidate);
    triggerAutoSaveToast();
  };

  const handleAddCustomCare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCareText.trim()) return;
    const trimmed = customCareText.trim();
    if (!carePlan.includes(trimmed)) {
      const updatedPlan = [...carePlan, trimmed];
      setCarePlan(updatedPlan);
      const updatedCandidate: CandidateAssessmentResult = {
        ...candidate,
        institutionalCarePlan: updatedPlan
      };
      updateCandidateInStorage(updatedCandidate);
      onUpdateCandidate(updatedCandidate);
      setCustomCareText('');
      triggerAutoSaveToast();
    }
  };

  const handleSaveAssessmentNotes = () => {
    const updated: CandidateAssessmentResult = {
      ...candidate,
      committeeNotes,
      committeeStatus: status,
      interviewerRating: rating,
      institutionalCarePlan: carePlan
    };
    updateCandidateInStorage(updated);
    onUpdateCandidate(updated);
    triggerAutoSaveToast();
  };

  const triggerAutoSaveToast = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-16">
      {/* Top Ambient Light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-60 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* STICKY TOP NAV & APPLICANT SWITCHER */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Back & Candidate Quick Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ภาพรวม Cohort</span>
            </button>

            <div className="h-4 w-px bg-slate-800" />

            {/* Candidate Identity Pill */}
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{candidate.candidateName}</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden md:inline">
                {candidate.specialty || 'ENT'}
              </span>
            </div>
          </div>

          {/* Previous / Next Candidate Shortcuts */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกแล้ว</span>
              </span>
            )}

            {candidatesList && candidatesList.length > 1 && onSelectCandidateId && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  type="button"
                  disabled={!prevCandidate}
                  onClick={() => prevCandidate && onSelectCandidateId(prevCandidate.id)}
                  title={prevCandidate ? `คนก่อนหน้า: ${prevCandidate.candidateName}` : 'คนแรก'}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    prevCandidate
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">คนก่อนหน้า</span>
                </button>
                <span className="text-[11px] font-mono text-slate-500 px-1">
                  {currentIndex + 1}/{candidatesList.length}
                </span>
                <button
                  type="button"
                  disabled={!nextCandidate}
                  onClick={() => nextCandidate && onSelectCandidateId(nextCandidate.id)}
                  title={nextCandidate ? `คนถัดไป: ${nextCandidate.candidateName}` : 'คนสุดท้าย'}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    nextCandidate
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">คนถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3-TAB NAVIGATION BAR */}
        <div className="max-w-6xl mx-auto mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('QUICK_VIEW')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'QUICK_VIEW'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-300" />
            <span>⚡ 15-Sec Quick View</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-950/80 text-emerald-200 border border-emerald-700/50 hidden md:inline">
              แนะนำขณะสัมภาษณ์
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MENTORSHIP_PROTOCOL')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'MENTORSHIP_PROTOCOL'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-cyan-300" />
            <span>💬 Mentorship Protocol (15-Min Guide)</span>
            {carePlan.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-700">
                {carePlan.length} คำมั่นสัญญา
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'ANALYTICS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-300" />
            <span>📊 Full Analytics (Radar & 14 Dims)</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ======================================================== */}
        {/* TAB 1: ⚡ 15-SEC QUICK VIEW (EXECUTIVE TELEPROMPTER)     */}
        {/* ======================================================== */}
        {activeTab === 'QUICK_VIEW' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* 1. EXECUTIVE SUMMARY HEADER */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 backdrop-blur-md shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{candidate.rpgProfile?.archetype?.badge || '🎖️'}</span>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {candidate.rpgProfile?.archetype?.title || 'The Tactical Master'}{' '}
                      <span className="text-emerald-400 font-bold">
                        ({candidate.rpgProfile?.archetype?.thaiTitle || 'นักวางแผนเชิงรุก'})
                      </span>
                    </h1>
                  </div>

                  {/* Single-line summary sentence */}
                  <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-3xl">
                    {candidate.rpgProfile?.archetype?.subtext ||
                      candidate.rpgProfile?.archetype?.description ||
                      'เน้นการวิเคราะห์และวางแผนล่วงหน้า มีความเด็ดขาดในการผ่าตัด แต่ควรระวังการแบกรับความรับผิดชอบไว้คนเดียว'}
                  </p>
                </div>

                {/* Quick Status Tag */}
                <div className="shrink-0 flex sm:flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    candidate.redFlagAnalysis.tier === 'LOW'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                      : candidate.redFlagAnalysis.tier === 'MODERATE'
                      ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
                      : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
                  }`}>
                    {candidate.redFlagAnalysis.tier === 'LOW' ? '🟢 พึ่งพาตนเองได้ดี' : candidate.redFlagAnalysis.tier === 'MODERATE' ? '🟡 ต้องการซัพพอร์ตมาตรฐาน' : '🤝 แนะนำ Mentor ประกบ'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Support Score: {candidate.redFlagAnalysis.score}/20
                  </span>
                </div>
              </div>

              {/* Optional: Candidate's Context Note */}
              {candidate.candidateContextNote && (
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="text-base shrink-0 mt-0.5">📝</span>
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-400 block">
                      บันทึกบริบทจากผู้สมัคร (Context Note):
                    </span>
                    <p className="italic text-slate-200 leading-relaxed font-light">
                      &ldquo;{candidate.candidateContextNote}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. TOP INSIGHTS GRID (3 CARDS ONLY) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Top Strengths (Emerald / Cyan) */}
              <div className="rounded-2xl bg-slate-900/80 border border-emerald-800/50 p-5 backdrop-blur-md shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>จุดแข็งหลัก (Top Strengths)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/60">
                      Adaptive Coping
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {topStrengths.map((buff, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-900/60 flex items-center gap-2.5"
                      >
                        <span className="text-lg">{buff.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-emerald-200 truncate">
                            {buff.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {buff.effectDescription}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-emerald-300/80 italic pt-1">
                  💡 กลไกเชิงรุกที่ผู้สมัครใช้รับมือวิกฤติตามธรรมชาติ
                </p>
              </div>

              {/* Card 2: Support Focus (Soft Coral / Amber) */}
              <div className="rounded-2xl bg-slate-900/80 border border-amber-800/50 p-5 backdrop-blur-md shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4" />
                      <span>จุดที่ต้องช่วยประคอง (Support Focus)</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-700/60">
                      Reframed Red Flag
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-900/60 space-y-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{topSupportNeed.icon || '🌀'}</span>
                      <span className="text-sm font-bold text-amber-200">
                        {topSupportNeed.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {topSupportNeed.advice}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-amber-300/80 italic pt-1">
                  🤝 โอกาสในการพัฒนาผ่านการมี Senior Buddy หรือ Mentor ประกบ
                </p>
              </div>

              {/* Card 3: Key Value (Cyan / Indigo) */}
              <div className="rounded-2xl bg-slate-900/80 border border-cyan-800/50 p-5 backdrop-blur-md shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>คุณค่าต่อภาควิชา (Key Value)</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-700/60">
                      Personal Asset
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/60 mb-3">
                    <p className="text-xs sm:text-[13px] text-cyan-100 leading-relaxed font-normal">
                      {primaryAsset}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-cyan-300/80 italic pt-1">
                  💎 จุดเด่นที่ช่วยเสริมความเข้มแข็งของทีมแพทย์ในหอผู้ป่วย
                </p>
              </div>

            </div>

            {/* 3. TELEPROMPTER QUESTION PROMPTS (LARGE HIGH-VISIBILITY TEXT) */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎙️</span>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Teleprompter Prompts: คำถามเปิดใจชวนคุยในการสัมภาษณ์
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  ข้อความขนาดใหญ่ อ่านง่าย ไม่ต้องละสายตาจากผู้สมัคร
                </span>
              </div>

              {/* Prompt 1: Strengths Probe */}
              <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/30 border border-emerald-500/40 relative group shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Strengths Probe (เจาะลึกจุดเด่นและกลไกเชิงรุก)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyText(dynamicStrengthsQuestion, 'q1')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedScript === 'q1' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>

                {/* LARGE TEXT QUESTION */}
                <p className="text-lg sm:text-xl font-medium text-emerald-100 leading-relaxed">
                  &ldquo;{dynamicStrengthsQuestion}&rdquo;
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  🎯 เป้าหมาย: ให้ผู้สมัครได้แสดงความภาคภูมิใจ และสะท้อนวิธีการรับมือปัญหาเฉพาะหน้าในชีวิตจริง
                </p>
              </div>

              {/* Prompt 2: Support Probe */}
              <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/30 border border-amber-500/40 relative group shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Support Probe (สำรวจความต้องการซัพพอร์ตเชิงบวก)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyText(dynamicSupportQuestion, 'q2')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedScript === 'q2' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>

                {/* LARGE TEXT QUESTION */}
                <p className="text-lg sm:text-xl font-medium text-amber-100 leading-relaxed">
                  &ldquo;{dynamicSupportQuestion}&rdquo;
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  🤝 เป้าหมาย: เปลี่ยนคำถามจับผิดเป็นบทสนทนาสร้างพื้นที่ปลอดภัย ให้ผู้สมัครกล้าขอความช่วยเหลือ
                </p>
              </div>

              {/* Quick Actions Footer inside Quick View */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('MENTORSHIP_PROTOCOL')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>ดูสคริปต์สัมภาษณ์ 15 นาทีฉบับเต็ม (Mentorship Protocol) ➔</span>
                </button>

                {/* Fast Evaluator Quick Status */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStatus('SHORTLISTED');
                      handleSaveAssessmentNotes();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      status === 'SHORTLISTED' || status === 'APPROVED'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ✓ รับเข้าหลักสูตร
                  </button>
                  <button
                    onClick={() => {
                      setStatus('NEEDS_INTERVIEW_PROBE');
                      handleSaveAssessmentNotes();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      status === 'NEEDS_INTERVIEW_PROBE'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🤝 รับเข้า + มี Mentor
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: 💬 MENTORSHIP PROTOCOL (15-MIN INTERVIEW ROADMAP) */}
        {/* ======================================================== */}
        {activeTab === 'MENTORSHIP_PROTOCOL' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Header Description */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 text-xl">
                  💬
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    15-Minute Mentorship Interview Protocol
                  </h2>
                  <p className="text-xs text-slate-400">
                    แนวทางบทสนทนา 3 ขั้นตอน เพื่อสร้างความผูกพันและทำคำมั่นสัญญาการดูแล (Institutional Care)
                  </p>
                </div>
              </div>
            </div>

            {/* 1. 3-STEP INTERVIEW ROADMAP */}
            <div className="space-y-4">
              
              {/* STEP 1: OPENING (1-2 Min) */}
              <div className="rounded-2xl p-5 bg-slate-900/90 border border-sky-800/60 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-sky-300">
                      STEP 1: OPENING (1-2 นาที) — สร้างความปลอดภัยทางจิตใจ (Psychological Safety)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 1–2 Min
                  </span>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-sky-900/80 relative group">
                  <p className="text-xs font-semibold text-sky-400 mb-1">
                    🗣️ สคริปต์แนะนำให้อาจารย์กล่าวเปิดบทสนทนา:
                  </p>
                  <blockquote className="text-sm sm:text-base text-slate-100 font-medium italic pr-16 leading-relaxed">
                    &ldquo;ผลประเมินนี้ไม่ได้มีไว้เพื่อตัดคะแนน แต่มีไว้เพื่อให้ภาควิชาเข้าใจว่าจะช่วยซัพพอร์ตคุณอย่างไรให้เรียนได้อย่างมีความสุขตลอด 3 ปีในหลักสูตร ENT&rdquo;
                  </blockquote>

                  <button
                    onClick={() => handleCopyText('ผลประเมินนี้ไม่ได้มีไว้เพื่อตัดคะแนน แต่มีไว้เพื่อให้ภาควิชาเข้าใจว่าจะช่วยซัพพอร์ตคุณอย่างไรให้เรียนได้อย่างมีความสุขตลอด 3 ปีในหลักสูตร ENT', 'step1')}
                    className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedScript === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript === 'step1' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: STRENGTHS EXPLORATION (5 Min) */}
              <div className="rounded-2xl p-5 bg-slate-900/90 border border-emerald-800/60 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-emerald-300">
                      STEP 2: STRENGTHS EXPLORATION (5 นาที) — ชื่นชมจุดแข็งและกลไกเชิงรุก
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 5 Min
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-950 p-4 border border-emerald-900/80">
                    <div className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>จุดแข็งที่ตรวจพบ: {topStrengths.map((s) => `${s.icon} ${s.name}`).join(' • ')}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      💬 คำถามชวนคุย: &ldquo;ในสถานการณ์ผ่าตัดที่มีเวลาจำกัด คุณมักจะจัดลำดับความสำคัญอย่างไร และทักษะนี้เคยช่วยชีวิตผู้ป่วยหรือคลี่คลายปัญหาอย่างไรบ้าง?&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 3: SUPPORT PROBE (5-7 Min) */}
              <div className="rounded-2xl p-5 bg-slate-900/90 border border-amber-800/60 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-amber-300">
                      STEP 3: SUPPORT PROBE (5-7 นาที) — สำรวจความต้องการการสนับสนุนอย่างสร้างสรรค์
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 5–7 Min
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-950 p-4 border border-amber-900/80">
                    <div className="text-xs text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4" />
                      <span>จุดสังเกตด้านพลังงานล้า: {topSupportNeed.name}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      💬 คำถามชวนคุย: &ldquo;เมื่อเผชิญกับเคสที่ไม่เป็นไปตามแผนจนเกิดความรู้สึกล้าสะสมในใจ คุณสังเกตสัญญาณแรกของตนเองอย่างไร และอยากให้ภาควิชาเตรียมการสนับสนุนด้านใดเป็นพิเศษ?&rdquo;
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. INSTITUTIONAL CARE COMMITMENT CHECKLIST */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Institutional Care Commitment (คำมั่นสัญญาการดูแลเมื่อรับเข้าเรียน)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ติ๊กเลือกแผนการดูแลที่ภาควิชาพร้อมจัดให้ผู้สมัครท่านนี้ (บันทึกลงแฟ้มประเมินทันที)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-xl">
                  เลือกแล้ว {carePlan.length} รายการ
                </span>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {INSTITUTIONAL_CARE_DEFAULTS.map((item, idx) => {
                  const isChecked = carePlan.includes(item);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleCareItem(item)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-600/80 text-white shadow-xs'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Commitment */}
              <form onSubmit={handleAddCustomCare} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customCareText}
                  onChange={(e) => setCustomCareText(e.target.value)}
                  placeholder="ระบุคำมั่นสัญญาหรือแผนการดูแลเพิ่มเติมเฉพาะบุคคล..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!customCareText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่ม</span>
                </button>
              </form>
            </div>

            {/* 3. EVALUATION SCORING & INTERVIEW NOTES */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>การตัดสินใจและความเห็นของกรรมการ (Evaluator Notes)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    สถานะการพิจารณา
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const val = e.target.value as 'UNREVIEWED' | 'SHORTLISTED' | 'NEEDS_INTERVIEW_PROBE' | 'APPROVED' | 'CONCERN';
                      setStatus(val);
                      setTimeout(handleSaveAssessmentNotes, 100);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="UNREVIEWED">รอการพิจารณา (Unreviewed)</option>
                    <option value="SHORTLISTED">ผ่านการคัดเลือก (Shortlisted)</option>
                    <option value="NEEDS_INTERVIEW_PROBE">รับเข้าหลักสูตร + แนะนำ Mentor ประกบ (Needs Mentorship)</option>
                    <option value="APPROVED">อนุมัติการรับเข้า (Approved)</option>
                    <option value="CONCERN">มีข้อกังวลที่ต้องติดตาม (Concern)</option>
                  </select>
                </div>

                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    คะแนนความพร้อมในการเรียนรู้ (1–5 ดาว)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setRating(s);
                          setTimeout(handleSaveAssessmentNotes, 100);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-6 h-6 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      {rating > 0 ? `${rating}/5 คะแนน` : 'ยังไม่ได้ให้คะแนน'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Area */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  บันทึกเพิ่มเติมของอาจารย์ผู้สัมภาษณ์ (Private Notes)
                </label>
                <textarea
                  rows={3}
                  value={committeeNotes}
                  onChange={(e) => setCommitteeNotes(e.target.value)}
                  placeholder="บันทึกข้อสังเกต บุคลิกภาพ ความตั้งใจจริง หรือประเด็นที่พูดคุยในห้องสัมภาษณ์..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAssessmentNotes}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกความเห็นการประเมิน</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: 📊 FULL ANALYTICS (HIDDEN DEEP BREAKDOWN)         */}
        {/* ======================================================== */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Top Grid: Radar Chart + 5 Core Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Radar Chart (5-Point Polygon) */}
              <div className="lg:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md shadow-xl flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>5-Point Radar Polygon Chart</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
                    STR • INT • VIT • DEX • DRAIN
                  </span>
                </div>

                <div className="py-2">
                  {candidate.rpgProfile?.stats && (
                    <RadarChartComponent
                      stats={candidate.rpgProfile.stats}
                      size={340}
                    />
                  )}
                </div>
              </div>

              {/* 5 Core RPG Stats Summary Cards */}
              <div className="lg:col-span-6 space-y-2.5">
                {Object.values(candidate.rpgProfile?.stats || {}).map((st) => (
                  <div
                    key={st.key}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-white" style={{ color: st.color }}>
                          {st.key}
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          {st.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {st.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black font-mono" style={{ color: st.color }}>
                        {st.score}/{st.maxScore}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {st.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* 4 Coping Domains Visual Breakdown */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>4 Coping Domains (กลุ่มมิติการปรับตัว)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {candidate.domainResults.map((dom) => (
                  <div
                    key={dom.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold" style={{ color: dom.color }}>
                          {dom.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {dom.percentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        {dom.thaiName}
                      </p>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${dom.percentage}%`,
                          backgroundColor: dom.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 14 DIMENSIONS ACCORDION */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">
                    14 Dimensions Detailed Breakdown (Brief-COPE Adaptation)
                  </h3>
                  <p className="text-xs text-slate-400">
                    คลิกเพื่อเปิดดูรายละเอียดคำถามและคำตอบที่ผู้สมัครเลือกในแต่ละมิติ (คะแนนเต็ม 4)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterSupportOnly(!filterSupportOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      filterSupportOnly
                        ? 'bg-amber-950 border-amber-700 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filterSupportOnly ? 'แสดงเฉพาะ Support Needs' : 'แสดงทั้งหมด 14 มิติ'}
                  </button>
                </div>
              </div>

              {/* Accordion List */}
              <div className="space-y-2 pt-2">
                {candidate.dimensionResults
                  .filter((dim) => (!filterSupportOnly ? true : dim.isRedFlag))
                  .map((dim) => {
                    const isOpen = expandedDimId === dim.id;
                    return (
                      <div
                        key={dim.id}
                        className="rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden transition-all"
                      >
                        <div
                          onClick={() => setExpandedDimId(isOpen ? null : dim.id)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                              {dim.id}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-white mr-2">
                                {dim.name}
                              </span>
                              <span className="text-[11px] text-slate-400 hidden sm:inline">
                                ({dim.thaiName})
                              </span>
                            </div>
                            {dim.isRedFlag && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">
                                Support Focus
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {dim.score}/4 คะแนน
                            </span>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {isOpen && (
                          <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-300 space-y-2 animate-in fade-in">
                            <p className="text-slate-400 leading-relaxed font-light">
                              {dim.itemLocations.join(' • ')}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="font-bold text-emerald-400 block mb-0.5">
                                  {dim.details?.item1.location}:
                                </span>
                                <span className="text-slate-300">
                                  {dim.details?.item1.text || 'ไม่มีรายละเอียด'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block mt-1">
                                  คะแนนที่ได้: {dim.details?.item1.points} คะแนน
                                </span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="font-bold text-emerald-400 block mb-0.5">
                                  {dim.details?.item2.location}:
                                </span>
                                <span className="text-slate-300">
                                  {dim.details?.item2.text || 'ไม่มีรายละเอียด'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block mt-1">
                                  คะแนนที่ได้: {dim.details?.item2.points} คะแนน
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Questions 1-7 Scenario Response Log */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Candidate Response Choices Across 7 Clinical Scenarios</span>
              </h3>

              <div className="space-y-2">
                {QUESTION_SETS.map((qSet) => {
                  const ans = candidate.answers[qSet.id];
                  const isOpen = expandedSetId === qSet.id;
                  const mostOpt = qSet.options.find((o) => o.id === ans?.most);
                  const leastOpt = qSet.options.find((o) => o.id === ans?.least);

                  return (
                    <div
                      key={qSet.id}
                      className="rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden"
                    >
                      <div
                        onClick={() => setExpandedSetId(isOpen ? null : qSet.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/80"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-cyan-400 font-mono">
                            ชุดที่ {qSet.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-200 truncate max-w-md">
                            {qSet.scenario}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                            มากที่สุด: {ans?.most || '-'}
                          </span>
                          <span className="text-[11px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded-md border border-rose-800">
                            น้อยที่สุด: {ans?.least || '-'}
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs space-y-2 animate-in fade-in">
                          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/60">
                            <span className="font-bold text-emerald-400 block mb-1">
                              ข้อที่เป็นตัวตนมากที่สุด ({ans?.most}):
                            </span>
                            <span className="text-slate-200">
                              {mostOpt?.text || '-'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                              มิติ: {mostOpt?.dimensionName} ({mostOpt?.dimensionLabel})
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/60">
                            <span className="font-bold text-rose-400 block mb-1">
                              ข้อที่เป็นตัวตนน้อยที่สุด ({ans?.least}):
                            </span>
                            <span className="text-slate-200">
                              {leastOpt?.text || '-'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                              มิติ: {leastOpt?.dimensionName} ({leastOpt?.dimensionLabel})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
