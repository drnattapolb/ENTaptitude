import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  ChevronRight,
  TrendingUp,
  Star,
  LogOut,
  Layers
} from 'lucide-react';
import { CandidateAssessmentResult, RiskTier } from '../types/assessment';
import { CandidateReportDetail } from './CandidateReportDetail';
import { ensureCandidateData } from '../utils/scoring';

interface CommitteeDashboardProps {
  candidates: CandidateAssessmentResult[];
  onUpdateCandidate: (updated: CandidateAssessmentResult) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const CommitteeDashboard: React.FC<CommitteeDashboardProps> = ({
  candidates,
  onUpdateCandidate,
  onResetData,
  onLogout
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | RiskTier>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'RISK_DESC' | 'RISK_ASC' | 'NAME_ASC'>('DATE_DESC');

  const selectedCandidate = selectedCandidateId
    ? (() => {
        const found = candidates.find((c) => c.id === selectedCandidateId);
        return found ? ensureCandidateData(found) : null;
      })()
    : null;

  const handleSelectCandidate = (cand: CandidateAssessmentResult) => {
    setSelectedCandidateId(cand.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute Macro Metrics
  const totalCount = candidates.length;
  const lowRiskCount = candidates.filter((c) => c.redFlagAnalysis.tier === 'LOW').length;
  const modRiskCount = candidates.filter((c) => c.redFlagAnalysis.tier === 'MODERATE').length;
  const highRiskCount = candidates.filter((c) => c.redFlagAnalysis.tier === 'HIGH').length;

  const avgRedFlag = totalCount > 0
    ? (candidates.reduce((acc, c) => acc + c.redFlagAnalysis.score, 0) / totalCount).toFixed(1)
    : '0';

  const avgD1 = totalCount > 0
    ? (candidates.reduce((acc, c) => acc + (c.domainResults[0]?.percentage || 0), 0) / totalCount).toFixed(1)
    : '0';
  const avgD2 = totalCount > 0
    ? (candidates.reduce((acc, c) => acc + (c.domainResults[1]?.percentage || 0), 0) / totalCount).toFixed(1)
    : '0';
  const avgD3 = totalCount > 0
    ? (candidates.reduce((acc, c) => acc + (c.domainResults[2]?.percentage || 0), 0) / totalCount).toFixed(1)
    : '0';
  const avgD4 = totalCount > 0
    ? (candidates.reduce((acc, c) => acc + (c.domainResults[3]?.percentage || 0), 0) / totalCount).toFixed(1)
    : '0';

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.hospitalOrSchool && c.hospitalOrSchool.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRisk = filterRisk === 'ALL' || c.redFlagAnalysis.tier === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'DATE_DESC') {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
    if (sortBy === 'RISK_DESC') {
      return b.redFlagAnalysis.score - a.redFlagAnalysis.score;
    }
    if (sortBy === 'RISK_ASC') {
      return a.redFlagAnalysis.score - b.redFlagAnalysis.score;
    }
    if (sortBy === 'NAME_ASC') {
      return a.candidateName.localeCompare(b.candidateName, 'th');
    }
    return 0;
  });

  const handleExportCSV = () => {
    const headers = [
      'Candidate ID',
      'Name',
      'Specialty',
      'Submitted At',
      'Red Flag Score (out of 20)',
      'Risk Tier',
      'Domain 1 % (Task-Focused)',
      'Domain 2 % (Adaptive Emotion)',
      'Domain 3 % (Distraction)',
      'Domain 4 % (Maladaptive & Red Flags)',
      'Committee Status',
      'Rating',
      'Notes'
    ];

    const rows = candidates.map((c) => [
      c.id,
      `"${c.candidateName}"`,
      `"${c.specialty || ''}"`,
      c.submittedAt,
      c.redFlagAnalysis.score,
      c.redFlagAnalysis.tier,
      c.domainResults[0]?.percentage || 0,
      c.domainResults[1]?.percentage || 0,
      c.domainResults[2]?.percentage || 0,
      c.domainResults[3]?.percentage || 0,
      c.committeeStatus || '',
      c.interviewerRating || 0,
      `"${(c.committeeNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ResiCope_Cohort_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedCandidate) {
    return (
      <CandidateReportDetail
        key={selectedCandidate.id}
        candidate={selectedCandidate}
        candidatesList={candidates}
        onSelectCandidateId={(id) => {
          setSelectedCandidateId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBack={() => {
          setSelectedCandidateId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onUpdateCandidate={(updated) => {
          onUpdateCandidate(updated);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Welcome & Master Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EBF2ED] text-[#375241] border border-[#C6D8CC]">
              Selection Committee Portal
            </span>
            <span className="text-xs text-[#718278]">• เซสชันได้รับการยืนยันแล้ว</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2823] tracking-tight">
            แดชบอร์ดประเมินจิตวิทยาผู้สมัครแพทย์ประจำบ้าน
          </h1>
          <p className="text-xs sm:text-sm text-[#58665E] font-normal mt-0.5">
            ภาพรวมผลการประเมิน 14 มิติ และการจัดกลุ่มความเสี่ยง Red Flag Risk Stratification
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="spring-bounce flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#F2F7F4] border border-[#D6E2DA] text-xs font-bold text-[#375241] shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-[#D46B47]" />
            <span>ส่งออกข้อมูล (CSV)</span>
          </button>

          <button
            onClick={onLogout}
            className="spring-bounce flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F8ECE8] hover:bg-[#F2DFD9] border border-[#E9C5B9] text-xs font-bold text-[#A64525] transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* BENTO ROW 1: Key Metrics with Soft Organic Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Metric 1: Total Candidates */}
        <div className="rounded-[28px] p-5.5 organic-card bg-white border border-[#D6E2DA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#68776F] text-xs font-bold">
            <span>ผู้สมัครทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBF2ED] flex items-center justify-center text-[#4A6B56]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-[#1F2823] tracking-tight">
              {totalCount}
            </div>
            <div className="text-[11px] text-[#7E8F84] mt-1 font-normal">
              ประเมินครบ 7 ชุดคำถาม
            </div>
          </div>
        </div>

        {/* Metric 2: Low Risk (0-6) */}
        <div className="rounded-[28px] p-5.5 organic-card bg-[#F4F9F5] border border-[#C6E2CD] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#2D5C39] text-xs font-bold">
            <span>Low Risk (0–6 คะแนน)</span>
            <div className="w-8 h-8 rounded-xl bg-[#E2F0E6] flex items-center justify-center text-[#2D5C39]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-[#2D5C39] tracking-tight">
              {lowRiskCount}
            </div>
            <div className="text-[11px] text-[#4F7859] mt-1 font-normal">
              ทนทานและมีกลไกรับมือที่ดี ({totalCount > 0 ? Math.round((lowRiskCount / totalCount) * 100) : 0}%)
            </div>
          </div>
        </div>

        {/* Metric 3: Moderate Risk (7-12) */}
        <div className="rounded-[28px] p-5.5 organic-card bg-[#FFFDF5] border border-[#F3E5B5] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A6715] text-xs font-bold">
            <span>Moderate (7–12 คะแนน)</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDF3D2] flex items-center justify-center text-[#8A6715]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-[#8A6715] tracking-tight">
              {modRiskCount}
            </div>
            <div className="text-[11px] text-[#A68026] mt-1 font-normal">
              ควรมี Mentor ดูแล ({totalCount > 0 ? Math.round((modRiskCount / totalCount) * 100) : 0}%)
            </div>
          </div>
        </div>

        {/* Metric 4: High Risk 🚩 (13-20) */}
        <div className="rounded-[28px] p-5.5 organic-card bg-[#FFF5F5] border border-[#FCD4D4] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#B92A2A] text-xs font-bold">
            <span>High Risk 🚩 (13–20)</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#B92A2A]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-[#B92A2A] tracking-tight">
              {highRiskCount}
            </div>
            <div className="text-[11px] text-[#C44343] mt-1 font-normal">
              เสี่ยงสูงต่อ Burnout ({totalCount > 0 ? Math.round((highRiskCount / totalCount) * 100) : 0}%)
            </div>
          </div>
        </div>

        {/* Metric 5: Average Red Flag */}
        <div className="rounded-[28px] p-5.5 organic-card bg-white border border-[#D6E2DA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#68776F] text-xs font-bold">
            <span>ค่าเฉลี่ย Red Flag</span>
            <div className="w-8 h-8 rounded-xl bg-[#F8ECE8] flex items-center justify-center text-[#D46B47]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-[#1F2823] tracking-tight">
              {avgRedFlag} <span className="text-sm font-normal text-[#7E8F84]">/ 20</span>
            </div>
            <div className="text-[11px] text-[#7E8F84] mt-1 font-normal">
              เฉลี่ยรวมทุกผู้สมัคร
            </div>
          </div>
        </div>
      </div>

      {/* BENTO ROW 2: Macro Cohort Domains Breakdown */}
      <div className="rounded-[32px] p-6 sm:p-7 organic-card bg-white border border-[#D6E2DA] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3.5 border-b border-[#EDF3EF]">
          <div>
            <h3 className="text-base font-bold text-[#1F2823] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#4A6B56]" />
              <span>สัดส่วนค่าเฉลี่ย 4 Coping Domains ของกลุ่มผู้สมัคร (Cohort Profile)</span>
            </h3>
            <p className="text-xs text-[#58665E] font-normal">
              คำนวณจากเปอร์เซ็นต์ส่วนสัดของ 28 คะแนน
            </p>
          </div>
          <span className="text-xs font-bold font-mono text-[#375241] bg-[#EBF2ED] px-3 py-1 rounded-full border border-[#C6D8CC]">
            ผู้สมัคร N = {totalCount} คน
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4.5 rounded-2xl bg-[#EBF5FF] border border-sky-200">
            <div className="text-xs font-bold text-sky-800 mb-1">Domain 1: Task-Focused</div>
            <div className="text-2xl font-bold font-mono text-sky-950">{avgD1}%</div>
            <div className="text-[11px] text-sky-800/80 mt-1">การแก้ปัญหาเชิงรุก/วางแผน</div>
          </div>

          <div className="p-4.5 rounded-2xl bg-[#F6EEFD] border border-purple-200">
            <div className="text-xs font-bold text-purple-800 mb-1">Domain 2: Adaptive Emotion</div>
            <div className="text-2xl font-bold font-mono text-purple-950">{avgD2}%</div>
            <div className="text-[11px] text-purple-800/80 mt-1">การปรับอารมณ์/กำลังใจบวก</div>
          </div>

          <div className="p-4.5 rounded-2xl bg-[#EBF2ED] border border-[#C6D8CC]">
            <div className="text-xs font-bold text-[#375241] mb-1">Domain 3: Distraction</div>
            <div className="text-2xl font-bold font-mono text-[#1F2823]">{avgD3}%</div>
            <div className="text-[11px] text-[#4F6355] mt-1">การเบี่ยงเบนสมาธิ/พักฟื้น</div>
          </div>

          <div className="p-4.5 rounded-2xl bg-[#FFF1F2] border border-rose-200">
            <div className="text-xs font-bold text-rose-800 mb-1">Domain 4: Maladaptive 🚩</div>
            <div className="text-2xl font-bold font-mono text-rose-950">{avgD4}%</div>
            <div className="text-[11px] text-rose-800/80 mt-1">กลไกเชิงลบ/ความเสี่ยงสูง</div>
          </div>
        </div>
      </div>

      {/* TOOLBAR: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8C9C92]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้สมัคร, สังกัดเดิม, รหัส..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#D6E2DA] text-xs text-[#1F2823] placeholder:text-[#9AA8A0] focus:outline-none focus:border-[#4A6B56] focus:ring-4 focus:ring-[#4A6B56]/10 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-[#D6E2DA] text-xs shrink-0 shadow-sm">
            <span className="text-[11px] text-[#6E7E74] px-2.5 font-bold flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>ความเสี่ยง:</span>
            </span>
            {(['ALL', 'LOW', 'MODERATE', 'HIGH'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterRisk(t)}
                className={`spring-bounce px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterRisk === t
                    ? t === 'HIGH'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : t === 'MODERATE'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : t === 'LOW'
                      ? 'bg-[#4A6B56] text-white shadow-sm'
                      : 'bg-[#1F2823] text-white'
                    : 'text-[#58665E] hover:text-[#1F2823]'
                }`}
              >
                {t === 'ALL' ? 'ทั้งหมด' : t === 'LOW' ? 'ต่ำ' : t === 'MODERATE' ? 'ปานกลาง' : 'สูง 🚩'}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#D6E2DA] text-xs font-semibold text-[#38453E] focus:outline-none focus:border-[#4A6B56] shadow-sm shrink-0"
          >
            <option value="DATE_DESC">ล่าสุดก่อน (Newest)</option>
            <option value="RISK_DESC">Red Flag: สูงไปต่ำ</option>
            <option value="RISK_ASC">Red Flag: ต่ำไปสูง</option>
            <option value="NAME_ASC">ชื่อผู้สมัคร (ก-ฮ)</option>
          </select>
        </div>
      </div>

      {/* CANDIDATE LIST (Warm Organic Bento Cards) */}
      <div className="space-y-3.5">
        {sortedCandidates.length === 0 ? (
          <div className="rounded-[32px] p-12 organic-card bg-white border border-[#D6E2DA] text-center">
            <Users className="w-12 h-12 text-[#9AA8A0] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1F2823]">ไม่พบข้อมูลผู้สมัครที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs text-[#6E7E74] mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองระดับความเสี่ยง</p>
          </div>
        ) : (
          sortedCandidates.map((candidate) => {
            const isHighRisk = candidate.redFlagAnalysis.tier === 'HIGH';
            const isModRisk = candidate.redFlagAnalysis.tier === 'MODERATE';

            return (
              <div
                key={candidate.id}
                onClick={() => handleSelectCandidate(candidate)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectCandidate(candidate)}
                className={`group rounded-[28px] p-5 sm:p-6 bg-white border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                  isHighRisk
                    ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20'
                    : isModRisk
                    ? 'border-amber-200 hover:border-amber-300'
                    : 'border-[#D6E2DA] hover:border-[#4A6B56]/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold font-mono text-center border shrink-0 ${
                        isHighRisk
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : isModRisk
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-[#EBF2ED] border-[#C6D8CC] text-[#375241]'
                      }`}
                    >
                      <span className="text-lg leading-none">{candidate.redFlagAnalysis.score}</span>
                      <span className="text-[10px] text-[#7E8F84]">/ 20</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[#6E7E74]">
                          {candidate.id}
                        </span>
                        <span className="text-xs text-[#6E7E74]">
                          • {(() => {
                            try {
                              return new Date(candidate.submittedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
                            } catch {
                              return '';
                            }
                          })()}
                        </span>
                        {candidate.interviewerRating && candidate.interviewerRating > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-600 text-xs font-bold ml-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{candidate.interviewerRating}/5</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#1F2823] group-hover:text-[#4A6B56] transition-colors flex items-center gap-2">
                        <span>{candidate.candidateName}</span>
                        {isHighRisk && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                            🚩 High Risk
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#58665E] font-normal mt-0.5">
                        {candidate.hospitalOrSchool || candidate.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Middle: 4 Domains Segmented Bar */}
                  <div className="flex items-center gap-3 lg:w-72 shrink-0">
                    <div className="w-full space-y-1 text-xs">
                      <div className="flex justify-between text-[#58665E] font-mono text-[10px]">
                        <span>D1: {candidate.domainResults[0]?.percentage}%</span>
                        <span>D2: {candidate.domainResults[1]?.percentage}%</span>
                        <span>D3: {candidate.domainResults[2]?.percentage}%</span>
                        <span className="text-rose-700 font-bold">D4: {candidate.domainResults[3]?.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EBF2ED] flex overflow-hidden">
                        <div
                          style={{ width: `${candidate.domainResults[0]?.percentage}%`, backgroundColor: '#38BDF8' }}
                          title="Domain 1: Task-Focused"
                        />
                        <div
                          style={{ width: `${candidate.domainResults[1]?.percentage}%`, backgroundColor: '#A855F7' }}
                          title="Domain 2: Adaptive Emotion"
                        />
                        <div
                          style={{ width: `${candidate.domainResults[2]?.percentage}%`, backgroundColor: '#4A6B56' }}
                          title="Domain 3: Distraction"
                        />
                        <div
                          style={{ width: `${candidate.domainResults[3]?.percentage}%`, backgroundColor: '#E11D48' }}
                          title="Domain 4: Maladaptive"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Risk Badge & CTA */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EDF3EF]">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                        isHighRisk
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : isModRisk
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-[#EBF2ED] border-[#C6D8CC] text-[#2C4A37]'
                      }`}
                    >
                      {isHighRisk && <ShieldAlert className="w-3.5 h-3.5 shrink-0" />}
                      <span>{candidate.redFlagAnalysis.thaiLabel}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCandidate(candidate);
                      }}
                      className="spring-bounce flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#D46B47] hover:text-white bg-[#F8ECE8] hover:bg-[#D46B47] transition-all cursor-pointer"
                    >
                      <span>ดูผลเชิงลึก</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
