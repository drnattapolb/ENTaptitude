import React, { useState, useEffect } from 'react';
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
  Layers,
  ArrowUp,
  BarChart3,
  PieChart,
  X,
  SlidersHorizontal,
  Info
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'GRAPHICS'>('ROSTER');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Macro Metrics Calculations
  const totalCount = candidates.length;
  const lowRiskCount = candidates.filter((c) => c.redFlagAnalysis.tier === 'LOW').length;
  const modRiskCount = candidates.filter((c) => c.redFlagAnalysis.tier === 'MODERATE').length;
  const highRiskCount = candidates.filter((c) => c.redFlagAnalysis.tier === 'HIGH').length;

  const lowPercent = totalCount > 0 ? Math.round((lowRiskCount / totalCount) * 100) : 0;
  const modPercent = totalCount > 0 ? Math.round((modRiskCount / totalCount) * 100) : 0;
  const highPercent = totalCount > 0 ? Math.round((highRiskCount / totalCount) * 100) : 0;

  const avgRedFlagNum = totalCount > 0
    ? candidates.reduce((acc, c) => acc + c.redFlagAnalysis.score, 0) / totalCount
    : 0;
  const avgRedFlag = avgRedFlagNum.toFixed(1);

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

  // SVG Donut Chart Math
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const lowStroke = totalCount > 0 ? (lowRiskCount / totalCount) * circumference : 0;
  const modStroke = totalCount > 0 ? (modRiskCount / totalCount) * circumference : 0;
  const highStroke = totalCount > 0 ? (highRiskCount / totalCount) * circumference : 0;

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

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ResiCope_Cohort_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If candidate detail is opened
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6">
      {/* 1. COMPACT TOP HEADER (Optimized for iPhone 14 Pro Max & Desktop) */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-5 pb-2.5 border-b border-[#D6E2DA]/80">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A6B56]">
            <span className="w-2 h-2 rounded-full bg-[#4A6B56] shrink-0" />
            <span className="truncate">Selection Committee Portal</span>
            <span className="text-[#88998E] hidden sm:inline">• แพทย์ประจำบ้าน</span>
          </div>
          <h1 className="text-base sm:text-2xl font-extrabold text-[#1F2823] tracking-tight truncate">
            ผลประเมินจิตวิทยาผู้สมัคร
          </h1>
        </div>

        {/* Action Buttons with Standard Hitboxes (>= 44px) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            title="ส่งออก CSV"
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#F2F7F4] border border-[#D6E2DA] text-xs font-bold text-[#375241] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#D46B47]" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="ออกจากระบบ"
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[#F8ECE8] hover:bg-[#F2DFD9] border border-[#E9C5B9] text-xs font-bold text-[#A64525] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">ออก</span>
          </button>
        </div>
      </div>

      {/* 2. ADAPTIVE VIEW SWITCHER: Eliminates scroll fatigue on iPhone 14 Pro Max */}
      <div className="sticky top-2 z-30 bg-[#FAF7F2]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#D6E2DA] shadow-sm mb-3.5 flex items-center justify-between gap-2">
        <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ROSTER')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ROSTER'
                ? 'bg-[#1F2823] text-white shadow-sm'
                : 'bg-white text-[#58665E] hover:text-[#1F2823] hover:bg-[#FAFDFB]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>รายชื่อผู้สมัคร ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GRAPHICS')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'GRAPHICS'
                ? 'bg-[#4A6B56] text-white shadow-sm'
                : 'bg-white text-[#58665E] hover:text-[#1F2823] hover:bg-[#FAFDFB]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>กราฟและสถิติ Cohort</span>
          </button>
        </div>

        {/* Desktop Quick Summary Indicator */}
        <div className="hidden lg:flex items-center gap-3 text-xs pr-2 font-mono">
          <span className="text-[#2D5C39] font-bold">🟢 ปลอดภัย {lowRiskCount}</span>
          <span className="text-[#8A6715] font-bold">🟡 เฝ้าระวัง {modRiskCount}</span>
          <span className="text-[#B92A2A] font-bold">🔴 เสี่ยงสูง {highRiskCount}</span>
        </div>
      </div>

      {/* 3. VIEW 1: COHORT VISUAL GRAPHICS (High-Impact, Easily Understood Charts) */}
      {(activeTab === 'GRAPHICS' || window.innerWidth >= 1280) && (
        <div className={`space-y-4 mb-5 ${activeTab !== 'GRAPHICS' ? 'hidden xl:block' : 'block'}`}>
          {/* Top Visual Row: Donut Chart + 4 Coping Domains Visual Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Visual Graphic 1: Red Flag Risk Stratification Donut Gauge */}
            <div className="lg:col-span-5 rounded-2xl p-4 sm:p-5 bg-white border border-[#D6E2DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#1F2823] flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#4A6B56]" />
                    <span>การกระจายตัวความเสี่ยง (Risk Donut)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#718278] bg-[#F2F7F4] px-2 py-0.5 rounded-lg border border-[#D6E2DA]">
                    N = {totalCount}
                  </span>
                </div>
                <p className="text-xs text-[#58665E] leading-relaxed">
                  สัดส่วนผู้สมัครแยกตามระดับความเสี่ยง Red Flag Score (เต็ม 20)
                </p>
              </div>

              {/* Donut Graphic Visualizer */}
              <div className="my-3 py-2 flex items-center justify-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    {/* Background Ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#E5EDE8"
                      strokeWidth="20"
                      fill="none"
                    />
                    {totalCount > 0 ? (
                      <>
                        {/* Low Risk Arc (Emerald Green) */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          stroke="#10B981"
                          strokeWidth="20"
                          fill="none"
                          strokeDasharray={`${lowStroke} ${circumference}`}
                          strokeDashoffset={0}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                        {/* Moderate Risk Arc (Amber Yellow) */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          stroke="#F59E0B"
                          strokeWidth="20"
                          fill="none"
                          strokeDasharray={`${modStroke} ${circumference}`}
                          strokeDashoffset={-lowStroke}
                          className="transition-all duration-700 ease-out"
                        />
                        {/* High Risk Arc (Rose Red) */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          stroke="#EF4444"
                          strokeWidth="20"
                          fill="none"
                          strokeDasharray={`${highStroke} ${circumference}`}
                          strokeDashoffset={-(lowStroke + modStroke)}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </>
                    ) : (
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="#CBD5E1"
                        strokeWidth="20"
                        fill="none"
                      />
                    )}
                  </svg>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xs text-[#718278] font-medium">เฉลี่ย Red Flag</span>
                    <span className="text-2xl font-extrabold font-mono text-[#1F2823] tracking-tight">
                      {avgRedFlag}
                    </span>
                    <span className="text-[10px] text-[#88998E]">จาก 20 คะแนน</span>
                  </div>
                </div>
              </div>

              {/* Interactive Legend with Direct 1-Tap Filter */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EDF3EF] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setFilterRisk('LOW');
                    setActiveTab('ROSTER');
                  }}
                  className="p-2 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-[#166534] flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>ต่ำ (0-6)</span>
                  </div>
                  <div className="text-base font-bold font-mono text-[#166534] mt-0.5">
                    {lowRiskCount} <span className="text-[10px] font-normal">({lowPercent}%)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterRisk('MODERATE');
                    setActiveTab('ROSTER');
                  }}
                  className="p-2 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-[#92400E] flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>กลาง (7-12)</span>
                  </div>
                  <div className="text-base font-bold font-mono text-[#92400E] mt-0.5">
                    {modRiskCount} <span className="text-[10px] font-normal">({modPercent}%)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterRisk('HIGH');
                    setActiveTab('ROSTER');
                  }}
                  className="p-2 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-[#991B1B] flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    <span>สูง (13-20)</span>
                  </div>
                  <div className="text-base font-bold font-mono text-[#991B1B] mt-0.5">
                    {highRiskCount} <span className="text-[10px] font-normal">({highPercent}%)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Visual Graphic 2: 4 Coping Domains Visual Comparison Bars */}
            <div className="lg:col-span-7 rounded-2xl p-4 sm:p-5 bg-white border border-[#D6E2DA] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#1F2823] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#4A6B56]" />
                    <span>สัดส่วน 4 Coping Domains ของกลุ่มผู้สมัคร</span>
                  </h3>
                  <span className="text-[11px] text-[#4A6B56] bg-[#EBF2ED] px-2 py-0.5 rounded-lg border border-[#C6D8CC] font-bold">
                    เกณฑ์สมดุล
                  </span>
                </div>
                <p className="text-xs text-[#58665E]">
                  คำนวณจากเปอร์เซ็นต์เฉลี่ยของคะแนนสัมพัทธ์ในแต่ละมิติ (แนะนำ: D1+D2 &gt; 50% และ D4 &lt; 20%)
                </p>
              </div>

              {/* 4 Comparative Horizontal Visual Bars */}
              <div className="space-y-3.5 my-4">
                {/* Domain 1: Task-Focused */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-bold text-sky-950 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-sky-500" />
                      <span>Domain 1: Task-Focused (การแก้ปัญหาเชิงรุก/วางแผน)</span>
                    </div>
                    <span className="font-mono font-bold text-sky-900 text-sm">{avgD1}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-sky-100/70 overflow-hidden relative">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(avgD1)))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-sky-700/80 mt-0.5">
                    <span>เหมาะสมสำหรับงานผ่าตัดและการตัดสินใจฉุกเฉิน</span>
                    <span>เกณฑ์แนะนำ: ≥ 30%</span>
                  </div>
                </div>

                {/* Domain 2: Adaptive Emotion */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-bold text-purple-950 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-purple-500" />
                      <span>Domain 2: Adaptive Emotion (การปรับอารมณ์และขอคำปรึกษา)</span>
                    </div>
                    <span className="font-mono font-bold text-purple-900 text-sm">{avgD2}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-purple-100/70 overflow-hidden relative">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(avgD2)))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-purple-700/80 mt-0.5">
                    <span>สะท้อนความสามารถในการทำงานร่วมกับทีมและอาจารย์</span>
                    <span>เกณฑ์แนะนำ: ≥ 25%</span>
                  </div>
                </div>

                {/* Domain 3: Distraction */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-emerald-600" />
                      <span>Domain 3: Distraction (การผ่อนคลายและเบี่ยงเบนสมาธิ)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-900 text-sm">{avgD3}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-emerald-100/70 overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(avgD3)))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-700/80 mt-0.5">
                    <span>กลไกพักฟื้นสุขภาพจิตเพื่อป้องกันภาวะหมดไฟ</span>
                    <span>เกณฑ์ปกติ: 10% - 20%</span>
                  </div>
                </div>

                {/* Domain 4: Maladaptive */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-bold text-rose-950 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-rose-500" />
                      <span>Domain 4: Maladaptive 🚩 (กลไกเชิงลบ/เสี่ยงสูง)</span>
                    </div>
                    <span className="font-mono font-bold text-rose-900 text-sm">{avgD4}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-rose-100 overflow-hidden relative">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(avgD4)))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-rose-700 font-medium mt-0.5">
                    <span>การโทษตนเอง, สารเสพติด, ละทิ้งความพยายาม</span>
                    <span className="font-bold">ระดับปลอดภัย: &lt; 15%</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Guidance Note */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2ECE5] flex items-center gap-2 text-[11px] text-[#58665E]">
                <Info className="w-4 h-4 text-[#4A6B56] shrink-0" />
                <span>
                  หากผู้สมัครมี <strong>Domain 4 สูงเกิน 25%</strong> หรือ <strong>Red Flag &ge; 13</strong> คณะกรรมการควรใช้ชุดคำถามสัมภาษณ์เจาะลึกเพิ่มเติม
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW 2: CANDIDATE ROSTER (Zero-Scroll Ergonomics on iPhone 14 Pro Max) */}
      {(activeTab === 'ROSTER' || window.innerWidth >= 1280) && (
        <div>
          {/* Quick Filter & Search Bar: Compact and Thumb-Friendly */}
          <div className="space-y-2 mb-3">
            {/* Search + Sort Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8C9C92]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, รหัส, สังกัดเดิม..."
                  className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-[#D6E2DA] text-xs text-[#1F2823] placeholder:text-[#9AA8A0] focus:outline-none focus:border-[#4A6B56] shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-[#8C9C92] hover:text-[#1F2823] p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-2.5 rounded-xl bg-white border border-[#D6E2DA] text-xs font-semibold text-[#38453E] focus:outline-none focus:border-[#4A6B56] shadow-xs cursor-pointer"
                >
                  <option value="DATE_DESC">ล่าสุดก่อน</option>
                  <option value="RISK_DESC">Red Flag สูง-ต่ำ</option>
                  <option value="RISK_ASC">Red Flag ต่ำ-สูง</option>
                  <option value="NAME_ASC">ชื่อ (ก-ฮ)</option>
                </select>
              </div>
            </div>

            {/* Quick 1-Tap Interactive Risk Filter Strip (44px hitboxes for thumb reach) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterRisk('ALL')}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterRisk === 'ALL'
                    ? 'bg-[#1F2823] text-white shadow-xs'
                    : 'bg-white text-[#58665E] hover:text-[#1F2823] border border-[#D6E2DA]'
                }`}
              >
                ทั้งหมด ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterRisk('LOW')}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterRisk === 'LOW'
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7] border border-[#BBF7D0]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>ปลอดภัย ({lowRiskCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterRisk('MODERATE')}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterRisk === 'MODERATE'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7] border border-[#FDE68A]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>เฝ้าระวัง ({modRiskCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterRisk('HIGH')}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterRisk === 'HIGH'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2] border border-[#FECACA]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span>เสี่ยงสูง 🚩 ({highRiskCount})</span>
              </button>
            </div>
          </div>

          {/* CANDIDATES LIST: High Scannability, Compact Cards (< 110px height) */}
          <div className="space-y-2.5">
            {sortedCandidates.length === 0 ? (
              <div className="rounded-2xl p-8 bg-white border border-[#D6E2DA] text-center shadow-xs">
                <Users className="w-10 h-10 text-[#9AA8A0] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#1F2823]">ไม่พบผู้สมัครที่ตรงกับเงื่อนไข</h3>
                <p className="text-xs text-[#6E7E74] mt-1">ลองเปลี่ยนคำค้นหาหรือแตะตัวกรอง "ทั้งหมด"</p>
              </div>
            ) : (
              sortedCandidates.map((candidate) => {
                const isHighRisk = candidate.redFlagAnalysis.tier === 'HIGH';
                const isModRisk = candidate.redFlagAnalysis.tier === 'MODERATE';
                const score = candidate.redFlagAnalysis.score;

                return (
                  <div
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(candidate)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === 'Enter' || e.key === ' ') && handleSelectCandidate(candidate)
                    }
                    className={`group rounded-2xl p-3 sm:p-4 bg-white border transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99] ${
                      isHighRisk
                        ? 'border-rose-300 bg-rose-50/25 hover:border-rose-400'
                        : isModRisk
                        ? 'border-amber-200 hover:border-amber-300'
                        : 'border-[#D6E2DA] hover:border-[#4A6B56]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Circular Graphical Red Flag Score Badge */}
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold shrink-0 border transition-all ${
                          isHighRisk
                            ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200 shadow-xs'
                            : isModRisk
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-[#EBF2ED] border-[#C6D8CC] text-[#2D5C39]'
                        }`}
                      >
                        <span className="text-base leading-none">{score}</span>
                        <span className="text-[9px] text-[#7E8F84] mt-0.5">/ 20</span>
                      </div>

                      {/* Middle: Candidate Info & 4-Domain Mini Graphic */}
                      <div className="flex-1 min-w-0">
                        {/* Top Line: Name & Archetype & Rating */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-[#1F2823] group-hover:text-[#4A6B56] transition-colors truncate">
                              {candidate.candidateName}
                            </h3>
                            {candidate.rpgProfile?.archetype && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 shrink-0"
                                style={{
                                  backgroundColor: `${candidate.rpgProfile.archetype.color}15`,
                                  borderColor: `${candidate.rpgProfile.archetype.color}40`,
                                  color: candidate.rpgProfile.archetype.color
                                }}
                              >
                                <span>{candidate.rpgProfile.archetype.badge}</span>
                                <span className="hidden sm:inline">{candidate.rpgProfile.archetype.thaiTitle}</span>
                              </span>
                            )}
                          </div>

                          {candidate.interviewerRating && candidate.interviewerRating > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-600 text-[11px] font-bold shrink-0">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{candidate.interviewerRating}/5</span>
                            </span>
                          )}
                        </div>

                        {/* Subline: School/Specialty + ID */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#58665E] truncate mt-0.5">
                          <span className="truncate">{candidate.hospitalOrSchool || candidate.specialty}</span>
                          <span className="text-[#9AA8A0] shrink-0 font-mono text-[10px]">({candidate.id})</span>
                        </div>

                        {/* 4-Domain Mini Graphical Segmented Bar */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[#E5EDE8] flex overflow-hidden">
                            <div
                              style={{ width: `${candidate.domainResults[0]?.percentage || 0}%`, backgroundColor: '#0284C7' }}
                              title="D1: Task-Focused"
                            />
                            <div
                              style={{ width: `${candidate.domainResults[1]?.percentage || 0}%`, backgroundColor: '#8B5CF6' }}
                              title="D2: Adaptive Emotion"
                            />
                            <div
                              style={{ width: `${candidate.domainResults[2]?.percentage || 0}%`, backgroundColor: '#059669' }}
                              title="D3: Distraction"
                            />
                            <div
                              style={{ width: `${candidate.domainResults[3]?.percentage || 0}%`, backgroundColor: '#EF4444' }}
                              title="D4: Maladaptive"
                            />
                          </div>
                          <div className="text-[10px] font-mono text-[#6E7E74] shrink-0 flex items-center gap-1">
                            <span className="text-sky-700 font-bold">D1:{candidate.domainResults[0]?.percentage}%</span>
                            <span className={`${(candidate.domainResults[3]?.percentage || 0) >= 20 ? 'text-rose-700 font-bold' : 'text-[#7E8F84]'}`}>
                              D4:{candidate.domainResults[3]?.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Risk Badge + Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border hidden sm:inline-flex items-center gap-1 ${
                            isHighRisk
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : isModRisk
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-[#EBF2ED] border-[#C6D8CC] text-[#2C4A37]'
                          }`}
                        >
                          {isHighRisk && <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />}
                          <span>{candidate.redFlagAnalysis.thaiLabel}</span>
                        </span>

                        <div className="w-7 h-7 rounded-lg bg-[#F2F7F4] group-hover:bg-[#4A6B56] group-hover:text-white text-[#58665E] flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* DYNAMIC BACK TO TOP BUTTON (Mobile Thumb Ergonomics) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-5 z-40 p-2.5 rounded-full bg-[#4A6B56] text-white shadow-lg hover:bg-[#375241] transition-all flex items-center gap-1 text-xs font-bold cursor-pointer active:scale-90 animate-in fade-in duration-200"
          title="กลับขึ้นบนสุด"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="hidden sm:inline">บนสุด</span>
        </button>
      )}
    </div>
  );
};
