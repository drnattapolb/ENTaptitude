import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Printer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Brain,
  MessageSquare,
  Award,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Star,
  Activity,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CandidateAssessmentResult } from '../types/assessment';
import { QUESTION_SETS } from '../data/assessmentData';
import { generateInterviewProbingQuestions, ensureCandidateData } from '../utils/scoring';
import { updateCandidateInStorage } from '../data/mockCandidates';

interface CandidateReportDetailProps {
  candidate: CandidateAssessmentResult;
  candidatesList?: CandidateAssessmentResult[];
  onSelectCandidateId?: (id: string) => void;
  onBack: () => void;
  onUpdateCandidate: (updated: CandidateAssessmentResult) => void;
}

export const CandidateReportDetail: React.FC<CandidateReportDetailProps> = ({
  candidate: rawCandidate,
  candidatesList,
  onSelectCandidateId,
  onBack,
  onUpdateCandidate
}) => {
  const candidate = ensureCandidateData(rawCandidate);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOMAINS' | 'DIMENSIONS' | 'QUESTIONS' | 'INTERVIEW'>('OVERVIEW');
  const [committeeNotes, setCommitteeNotes] = useState(candidate.committeeNotes || '');
  const [status, setStatus] = useState(candidate.committeeStatus || 'UNREVIEWED');
  const [rating, setRating] = useState<number>(candidate.interviewerRating || 0);
  const [expandedSetId, setExpandedSetId] = useState<number | null>(1);
  const [isSaved, setIsSaved] = useState(false);
  const [showOnlyRedFlags, setShowOnlyRedFlags] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const interviewQuestions = generateInterviewProbingQuestions(candidate);

  const currentIndex = candidatesList ? candidatesList.findIndex((c) => c.id === candidate.id) : -1;
  const prevCandidate = currentIndex > 0 && candidatesList ? candidatesList[currentIndex - 1] : null;
  const nextCandidate = currentIndex >= 0 && candidatesList && currentIndex < candidatesList.length - 1 ? candidatesList[currentIndex + 1] : null;

  const handleSaveNotes = () => {
    const updated: CandidateAssessmentResult = {
      ...candidate,
      committeeNotes,
      committeeStatus: status,
      interviewerRating: rating
    };
    updateCandidateInStorage(updated);
    onUpdateCandidate(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isHighRisk = candidate.redFlagAnalysis?.tier === 'HIGH';
  const isModRisk = candidate.redFlagAnalysis?.tier === 'MODERATE';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in duration-200">
      {/* Top Action Header with Breadcrumbs & Candidate Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="spring-bounce inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2F7F4] border border-[#D6E2DA] text-xs font-bold text-[#375241] shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่แดชบอร์ด</span>
          </button>

          <span className="text-xs text-[#88998E] hidden md:inline">/</span>
          <span className="text-xs font-bold text-[#4A6B56] hidden md:inline truncate max-w-xs">
            แฟ้มประเมิน: {candidate.candidateName}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Candidate Switcher Buttons */}
          {candidatesList && candidatesList.length > 1 && onSelectCandidateId && (
            <div className="flex items-center gap-1 bg-white border border-[#D6E2DA] rounded-xl p-1 shadow-sm">
              <button
                type="button"
                disabled={!prevCandidate}
                onClick={() => prevCandidate && onSelectCandidateId(prevCandidate.id)}
                title={prevCandidate ? `คนก่อนหน้า: ${prevCandidate.candidateName}` : 'คนแรก'}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  prevCandidate
                    ? 'text-[#375241] hover:bg-[#EBF2ED] cursor-pointer'
                    : 'text-[#C6D8CC] cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">คนก่อนหน้า</span>
              </button>

              <span className="text-[11px] font-mono text-[#718278] px-1.5 border-x border-[#E2ECE5]">
                {currentIndex + 1} / {candidatesList.length}
              </span>

              <button
                type="button"
                disabled={!nextCandidate}
                onClick={() => nextCandidate && onSelectCandidateId(nextCandidate.id)}
                title={nextCandidate ? `คนถัดไป: ${nextCandidate.candidateName}` : 'คนสุดท้าย'}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  nextCandidate
                    ? 'text-[#375241] hover:bg-[#EBF2ED] cursor-pointer'
                    : 'text-[#C6D8CC] cursor-not-allowed'
                }`}
              >
                <span className="hidden sm:inline">คนถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="spring-bounce flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D46B47] hover:bg-[#BF5A37] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน (PDF)</span>
          </button>
        </div>
      </div>

      {/* CANDIDATE HERO BANNER */}
      <div className="rounded-[28px] p-5 sm:p-7 organic-card bg-white border border-[#D6E2DA] mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2ED] text-[#375241]">
                {candidate.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#47574D] border border-[#D6E2DA]">
                {candidate.specialty}
              </span>
              <span className="text-xs text-[#718278] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {(() => {
                    try {
                      return new Date(candidate.submittedAt).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch {
                      return new Date(candidate.submittedAt).toLocaleDateString('th-TH');
                    }
                  })()}
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2823] tracking-tight flex items-center gap-2.5">
              <span>{candidate.candidateName}</span>
              <UserCheck className="w-5 h-5 text-[#4A6B56]" />
            </h1>
            <p className="text-xs text-[#58665E] mt-0.5">
              {candidate.hospitalOrSchool || 'ผู้สมัครแพทย์ประจำบ้าน'}
            </p>
          </div>

          {/* Red Flag Risk Badge */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E2ECE5] shrink-0">
            <div
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-center border ${
                isHighRisk
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : isModRisk
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-[#EBF2ED] border-[#C6D8CC] text-[#375241]'
              }`}
            >
              <span className="text-xl font-mono leading-none">{candidate.redFlagAnalysis.score}</span>
              <span className="text-[10px] text-[#7E8F84]">/ 20</span>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-[#7E8F84]">
                Red Flag Score
              </div>
              <div className={`text-sm font-bold flex items-center gap-1 ${
                isHighRisk ? 'text-rose-700' : isModRisk ? 'text-amber-800' : 'text-[#375241]'
              }`}>
                {isHighRisk && <ShieldAlert className="w-4 h-4 shrink-0" />}
                {isModRisk && <AlertTriangle className="w-4 h-4 shrink-0" />}
                {!isHighRisk && !isModRisk && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{candidate.redFlagAnalysis.thaiLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Advisory Alert */}
        <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
          isHighRisk
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : isModRisk
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-[#EBF2ED] border-[#C6D8CC] text-[#2C4A37]'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
            isHighRisk ? 'bg-rose-500' : isModRisk ? 'bg-amber-500' : 'bg-[#4A6B56]'
          }`} />
          <p className="font-medium">{candidate.redFlagAnalysis.clinicalInterpretation}</p>
        </div>
      </div>

      {/* STICKY TAB NAVIGATION (Zero-Scroll Section Switcher) */}
      <div className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-[#D6E2DA] mb-6 flex items-center justify-between gap-2 overflow-x-auto no-print">
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'OVERVIEW', label: 'ภาพรวม (Overview)', icon: Layers },
            { id: 'DOMAINS', label: '4 โดเมนหลัก', icon: Activity },
            { id: 'DIMENSIONS', label: '14 มิติการรับมือ', icon: Brain },
            { id: 'QUESTIONS', label: 'ตรวจคำตอบ (Audit)', icon: FileText },
            { id: 'INTERVIEW', label: 'สัมภาษณ์ & บันทึก', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`spring-bounce flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4A6B56] text-white shadow-sm ring-2 ring-[#4A6B56]/20'
                    : 'text-[#58665E] hover:text-[#1F2823] bg-white border border-[#E2ECE5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Right Indicator in Sticky Nav */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-[#6E7E74]">สถานะ:</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
            status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            status === 'SHORTLISTED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
            status === 'CONCERN' ? 'bg-rose-50 text-rose-800 border-rose-200' :
            status === 'NEEDS_INTERVIEW_PROBE' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-[#FAF7F2] text-[#6E7E74] border-[#D6E2DA]'
          }`}>
            {status === 'APPROVED' ? 'อนุมัติรับเข้า' :
             status === 'SHORTLISTED' ? 'ผ่านคัดเลือก' :
             status === 'CONCERN' ? 'มีข้อกังวล' :
             status === 'NEEDS_INTERVIEW_PROBE' ? 'สัมภาษณ์เจาะลึก' : 'รอตรวจสอบ'}
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* 4 Domains Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {candidate.domainResults.map((domain) => (
              <div
                key={domain.id}
                className="rounded-2xl p-4.5 organic-card bg-white border border-[#D6E2DA] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#EBF2ED] text-[#375241]">
                      D{domain.id}
                    </span>
                    <span className="text-lg font-bold font-mono text-[#1F2823]">
                      {domain.percentage}%
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#1F2823]">{domain.name}</h3>
                  <div className="text-[11px] text-[#4A6B56] font-semibold">{domain.thaiName}</div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#EDF3EF]">
                  <div className="flex justify-between text-[11px] mb-1 font-mono text-[#6E7E74]">
                    <span>คะแนน</span>
                    <span className="font-bold text-[#1F2823]">{domain.score} / {domain.itemCount * 2}</span>
                  </div>
                  <div className="w-full bg-[#EBF2ED] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (domain.score / (domain.itemCount * 2)) * 100)}%`,
                        backgroundColor: domain.id === 4 ? '#E11D48' : domain.id === 1 ? '#0284C7' : '#4A6B56'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Domains Summary Table */}
          <div className="rounded-2xl p-5 sm:p-6 organic-card bg-white border border-[#D6E2DA]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EDF3EF]">
              <h3 className="text-sm font-bold text-[#1F2823]">สรุป 4 โดเมนการรับมือ (4 Coping Domains)</h3>
              <span className="text-xs font-bold font-mono text-[#375241] bg-[#EBF2ED] px-2.5 py-0.5 rounded-full">
                รวม: 28 คะแนน (100%)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D6E2DA] text-[#6E7E74] font-bold">
                    <th className="py-2.5 px-3">โดเมน</th>
                    <th className="py-2.5 px-3">มิติย่อย</th>
                    <th className="py-2.5 px-3 text-center">ข้อ</th>
                    <th className="py-2.5 px-3 text-center">คะแนน</th>
                    <th className="py-2.5 px-3 text-center">สัดส่วน (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF3EF]">
                  {candidate.domainResults.map((domain) => (
                    <tr key={domain.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-3 px-3 font-bold text-[#1F2823]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: domain.id === 4 ? '#E11D48' : domain.id === 1 ? '#0284C7' : '#4A6B56' }}
                          />
                          <span>{domain.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#58665E]">
                        {domain.subDimensions.join(', ')}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#58665E]">
                        {domain.itemCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#1F2823]">
                        {domain.score}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#375241]">
                        {domain.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOMAINS DETAILED */}
      {activeTab === 'DOMAINS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {candidate.domainResults.map((domain) => (
            <div
              key={domain.id}
              className="rounded-2xl p-5 organic-card bg-white border border-[#D6E2DA] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#1F2823]">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: domain.id === 4 ? '#E11D48' : domain.id === 1 ? '#0284C7' : '#4A6B56' }}
                    />
                    <span>Domain {domain.id}: {domain.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#EBF2ED] text-[#375241]">
                    {domain.percentage}%
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  {candidate.dimensionResults
                    .filter((d) => d.domainId === domain.id)
                    .map((dim) => (
                      <div
                        key={dim.id}
                        className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2ECE5] flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-[#1F2823] flex items-center gap-1.5">
                          <span>{dim.name}</span>
                          {dim.isRedFlag && <span className="text-rose-600 font-bold">🚩</span>}
                        </span>
                        <span className="font-mono font-bold text-[#375241]">{dim.score} / 4</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: 14 DIMENSIONS BREAKDOWN */}
      {activeTab === 'DIMENSIONS' && (
        <div className="rounded-2xl p-5 sm:p-6 organic-card bg-white border border-[#D6E2DA]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-[#EDF3EF]">
            <div>
              <h3 className="text-sm font-bold text-[#1F2823]">14 มิติการรับมือตาม Brief COPE</h3>
              <p className="text-[11px] text-[#718278]">วิเคราะห์การตอบสนองเชิงพฤติกรรมในสถานการณ์ต่าง ๆ</p>
            </div>
            <button
              type="button"
              onClick={() => setShowOnlyRedFlags((prev) => !prev)}
              className={`spring-bounce text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                showOnlyRedFlags
                  ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                  : 'bg-[#FAF7F2] border-[#D6E2DA] text-[#58665E] hover:text-[#1F2823]'
              }`}
            >
              <span>🚩</span>
              <span>{showOnlyRedFlags ? 'แสดงมิติทั้งหมด (14 มิติ)' : 'แสดงเฉพาะตัวบ่งชี้ความเสี่ยง (Red Flags)'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {candidate.dimensionResults
              .filter((d) => !showOnlyRedFlags || d.isRedFlag)
              .map((dim) => (
              <div
                key={dim.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  dim.isRedFlag && dim.score >= 3
                    ? 'bg-rose-50/70 border-rose-300'
                    : dim.isRedFlag
                    ? 'bg-rose-50/30 border-rose-200'
                    : 'bg-[#FAF7F2] border-[#E2ECE5]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-white border border-[#D6E2DA] font-mono font-bold text-[11px] flex items-center justify-center">
                    {dim.id}
                  </span>
                  <div>
                    <div className="font-bold text-[#1F2823] flex items-center gap-1.5">
                      <span>{dim.name}</span>
                      {dim.isRedFlag && <span className="text-rose-600 font-bold text-[10px]">🚩 Red Flag</span>}
                    </div>
                    <div className="text-[11px] text-[#6E7E74]">{dim.thaiName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className="font-mono text-[11px] text-[#7E8F84]">{dim.itemLocations.join(' & ')}</span>
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-white border border-[#D6E2DA] text-[#1F2823]">
                    {dim.score} / 4
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT RAW ANSWERS (Accordion) */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-3">
          {QUESTION_SETS.map((q) => {
            const ans = candidate.answers?.[q.id];
            const isExpanded = expandedSetId === q.id;

            return (
              <div key={q.id} className="rounded-2xl organic-card bg-white border border-[#D6E2DA] overflow-hidden text-xs">
                <div
                  onClick={() => setExpandedSetId(isExpanded ? null : q.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF7F2]"
                >
                  <div className="flex items-center gap-2.5 font-bold text-[#1F2823]">
                    <span className="px-2 py-0.5 rounded bg-[#EBF2ED] text-[#375241] font-mono">#{q.id}</span>
                    <span>{q.title}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">ฟ้า: {ans?.most || '-'}</span>
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">แดง: {ans?.least || '-'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#88998E]" /> : <ChevronDown className="w-4 h-4 text-[#88998E]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-[#EDF3EF] bg-[#FAF7F2] space-y-2">
                    {q.options.map((opt) => {
                      const isMost = ans?.most === opt.id;
                      const isLeast = ans?.least === opt.id;

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                            isMost
                              ? 'bg-sky-50 border-sky-300 font-medium'
                              : isLeast
                              ? 'bg-rose-50 border-rose-300 font-medium'
                              : 'bg-white border-[#E2ECE5] text-[#58665E]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs">{opt.id}.</span>
                            <span>{opt.text}</span>
                            <span className="text-[11px] text-[#4A6B56] font-bold">({opt.dimensionName})</span>
                          </div>

                          <div className="shrink-0 font-bold text-xs">
                            {isMost && <span className="text-sky-700">+2 (มากที่สุด)</span>}
                            {isLeast && <span className="text-rose-700">0 (น้อยที่สุด)</span>}
                            {!isMost && !isLeast && <span className="text-gray-400">+1</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: INTERVIEW & NOTES */}
      {activeTab === 'INTERVIEW' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Interview Questions */}
          <div className="rounded-2xl p-5 organic-card bg-white border border-[#D6E2DA] space-y-3">
            <h3 className="text-sm font-bold text-[#1F2823] flex items-center gap-2 pb-2 border-b border-[#EDF3EF]">
              <MessageSquare className="w-4 h-4 text-[#4A6B56]" />
              <span>แนวทางคำถามสัมภาษณ์ (Interview Guide)</span>
            </h3>

            <div className="space-y-2.5">
              {interviewQuestions.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2ECE5] text-xs text-[#2C3831] leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#EBF2ED] text-[#375241] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Committee Notes */}
          <div className="rounded-2xl p-5 organic-card bg-white border border-[#D6E2DA] space-y-4">
            <h3 className="text-sm font-bold text-[#1F2823] flex items-center gap-2 pb-2 border-b border-[#EDF3EF]">
              <Award className="w-4 h-4 text-[#D46B47]" />
              <span>บันทึกการประเมิน</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#2C3831] mb-1">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#D6E2DA] text-xs font-medium"
              >
                <option value="UNREVIEWED">รอตรวจสอบ</option>
                <option value="SHORTLISTED">ผ่านการคัดเลือก (Shortlisted)</option>
                <option value="NEEDS_INTERVIEW_PROBE">สัมภาษณ์เจาะลึกเพิ่มเติม</option>
                <option value="APPROVED">อนุมัติรับเข้าฝึกอบรม</option>
                <option value="CONCERN">มีข้อกังวล (Concern Flag)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3831] mb-1">ความเหมาะสม (1-5)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                    <Star className={`w-5 h-5 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3831] mb-1">ความเห็นเพิ่มเติม</label>
              <textarea
                rows={3}
                value={committeeNotes}
                onChange={(e) => setCommitteeNotes(e.target.value)}
                placeholder="ระบุข้อสังเกตของกรรมการ..."
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#D6E2DA] text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {isSaved && <span className="text-xs text-[#2D5C39] font-bold">✓ บันทึกแล้ว</span>}
              <button
                type="button"
                onClick={handleSaveNotes}
                className="spring-bounce ml-auto py-2 px-5 rounded-xl bg-[#D46B47] text-white font-bold text-xs shadow-sm hover:bg-[#BF5A37]"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING DECISION DOCK (Zero-Scroll Instant Evaluation Bar) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl border border-[#D6E2DA] p-2.5 sm:p-3 shadow-xl flex items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:block truncate">
            <div className="text-[10px] uppercase font-bold text-[#7E8F84]">ผู้สมัคร</div>
            <div className="text-xs font-bold text-[#1F2823] truncate max-w-[140px]">{candidate.candidateName}</div>
          </div>
          <div className="hidden sm:block h-6 w-px bg-[#E2ECE5] mx-1" />
          {/* Quick Rating Stars */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                title={`ให้ ${star} ดาว`}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
              >
                <Star className={`w-4 h-4 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Status Select & Save Action */}
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FBF9F5] border border-[#D6E2DA] text-xs font-semibold text-[#1F2823] focus:outline-none"
          >
            <option value="UNREVIEWED">รอตรวจสอบ</option>
            <option value="SHORTLISTED">ผ่านการคัดเลือก</option>
            <option value="NEEDS_INTERVIEW_PROBE">สัมภาษณ์เจาะลึก</option>
            <option value="APPROVED">อนุมัติรับเข้า</option>
            <option value="CONCERN">มีข้อกังวล</option>
          </select>

          <button
            type="button"
            onClick={handleSaveNotes}
            className="spring-bounce px-3.5 py-1.5 rounded-xl bg-[#D46B47] hover:bg-[#BF5A37] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>บันทึกแล้ว</span>
              </>
            ) : (
              <span>บันทึกผล</span>
            )}
          </button>
        </div>
      </div>

      {/* DYNAMIC BACK TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 sm:right-8 z-40 p-2.5 rounded-2xl bg-[#4A6B56] text-white shadow-lg hover:bg-[#375241] transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 animate-in fade-in duration-200 no-print"
          title="กลับขึ้นบนสุด"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="hidden sm:inline">ขึ้นบนสุด</span>
        </button>
      )}
    </div>
  );
};
