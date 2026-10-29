import React from 'react';
import {
  Shield,
  Zap,
  Sparkles,
  Heart,
  Brain,
  Coffee,
  CheckCircle2,
  Printer,
  Home,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { CandidateAssessmentResult } from '../types/assessment';
import { RadarChartComponent } from './RadarChartComponent';
import { ensureCandidateData } from '../utils/scoring';

interface ResultDashboardProps {
  candidate: CandidateAssessmentResult;
  onExit?: () => void;
  isCommitteeView?: boolean;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  candidate: rawCandidate,
  onExit,
  isCommitteeView = false
}) => {
  const candidate = ensureCandidateData(rawCandidate);
  const rpg = candidate.rpgProfile;

  if (!rpg) return null;

  const { archetype, stats, activeBuffs, energyDrains, microHabits, overallResilienceIndex } = rpg;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* TOP STATUS BAR: Ragnarok Character Status Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-5 sm:p-7 shadow-2xl">
          {/* Subtle Ambient Background Grids */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left: Class & Candidate Name */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                  CLASS: ENT SURGICAL RESIDENT
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
                  ID: {candidate.id}
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  • สำรวจเมื่อ {new Date(candidate.submittedAt).toLocaleDateString('th-TH')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span>{candidate.candidateName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {candidate.hospitalOrSchool || candidate.specialty || 'แพทย์ประจำบ้าน โสต ศอ นาสิกวิทยา'}
              </p>
            </div>

            {/* Right: Archetype Badge & Resilience Gauge */}
            <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/80 p-3 sm:p-4 rounded-2xl shrink-0">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border"
                style={{
                  backgroundColor: `${archetype.color}15`,
                  borderColor: `${archetype.color}40`,
                  boxShadow: `0 0 20px ${archetype.glowColor}`
                }}
              >
                {archetype.badge}
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  COPING ARCHETYPE
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white">
                  {archetype.title}
                </div>
                <div className="text-xs font-bold" style={{ color: archetype.color }}>
                  {archetype.thaiTitle}
                </div>
              </div>

              <div className="pl-3 border-l border-slate-700/60 text-right">
                <div className="text-[10px] text-slate-400 font-medium">RESILIENCE</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-400">
                  {overallResilienceIndex}
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Archetype Affirmation Subtext (Psychological Safety & De-stigmatization) */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-start gap-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="text-cyan-400 text-base shrink-0">💡</span>
            <div>
              <strong className="text-white font-semibold">{archetype.description}</strong>{' '}
              <span className="text-slate-400">{archetype.subtext}</span>
            </div>
          </div>
        </div>

        {/* Candidate's Context Note (Mentorship Conversation Starter) */}
        {candidate.candidateContextNote && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 shadow-lg flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📝</span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center flex-wrap gap-2 mb-1">
                <span>บันทึกบริบทส่วนตัวที่คุณส่งถึงอาจารย์ (Candidate's Context Note)</span>
                <span className="text-[10px] text-emerald-300/80 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                  Mentorship Starter
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed italic bg-black/20 p-3 rounded-xl border border-emerald-900/30 font-medium">
                "{candidate.candidateContextNote}"
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 ข้อมูลนี้จะช่วยให้อาจารย์ผู้สัมภาษณ์เข้าใจสไตล์การทำงานและบริบทเฉพาะตัวของคุณได้อย่างสร้างสรรค์
              </p>
            </div>
          </div>
        )}

        {/* 2-COLUMN MAIN INFOGRAPHIC: Radar Chart (Left) + 5 Stats Breakdown (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Ragnarok Polygon Radar Chart Card */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Coping Polygon Radar (5 Stat Axes)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded-full">
                RAGNAROK STAT SCREEN
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              แผนผัง 5 มิติ: แกนสีฟ้า/เขียวสะท้อนกลไกแก้ปัญหาเชิงรุก เส้นประสีแดงสะท้อนดัชนีภาระความเครียดสะสม (แตะที่จุดเพื่อดูรายละเอียด)
            </p>

            {/* The Polygon Radar Canvas */}
            <div className="my-auto py-2">
              <RadarChartComponent stats={stats} size={340} interactive={true} />
            </div>

            {/* Dual Layer Legend */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-5 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <span className="w-3 h-3 rounded-sm bg-cyan-500/60 border border-cyan-400" />
                <span>Adaptive Coping (STR • INT • VIT • DEX)</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300 font-medium">
                <span className="w-3 h-3 rounded-sm border border-rose-500 border-dashed bg-rose-500/20" />
                <span>DRAIN 🚩 (Stress Indicator)</span>
              </div>
            </div>
          </div>

          {/* Right: 5 Stat Bars (STR, INT, VIT, DEX, DRAIN) */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Stat Breakdown</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Total: 28 pts</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                คะแนนสัมพัทธ์ในแต่ละเสาหลักของการปรับตัวในการฝึกอบรมศัลยกรรม
              </p>
            </div>

            {/* 5 Stat Rows */}
            <div className="space-y-3.5 my-2">
              {/* STR */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <span>⚔️ STR: Task Execution</span>
                  </span>
                  <span className="text-white font-bold">{stats.STR.score}/{stats.STR.maxScore} ({stats.STR.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.STR.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">การแก้ปัญหาเชิงรุก & วางแผนล่วงหน้า</div>
              </div>

              {/* INT */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-blue-300 flex items-center gap-1">
                    <span>🔮 INT: Team Network</span>
                  </span>
                  <span className="text-white font-bold">{stats.INT.score}/{stats.INT.maxScore} ({stats.INT.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.INT.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">การปรึกษาอาจารย์ & ความร่วมมือในทีม</div>
              </div>

              {/* VIT */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <span>🛡️ VIT: Emotional Shield</span>
                  </span>
                  <span className="text-white font-bold">{stats.VIT.score}/{stats.VIT.maxScore} ({stats.VIT.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.VIT.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">การปรับมุมมองบวก & การยอมรับความจริง</div>
              </div>

              {/* DEX */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <span>⚡ DEX: Rest & Morale</span>
                  </span>
                  <span className="text-white font-bold">{stats.DEX.score}/{stats.DEX.maxScore} ({stats.DEX.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.DEX.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">การพักผ่อนสมองสั้นๆ & อารมณ์ขัน</div>
              </div>

              {/* DRAIN 🚩 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <span>🚩 DRAIN: Stress Load</span>
                  </span>
                  <span className="text-rose-300 font-bold">{stats.DRAIN.score}/{stats.DRAIN.maxScore} ({stats.DRAIN.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${stats.DRAIN.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-rose-300/80 mt-0.5">ดัชนีภาระความเครียดสะสม (เกณฑ์ปลอดภัย: &lt; 35%)</div>
              </div>
            </div>

            {/* Quick Status Note */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <span className="text-cyan-400 font-bold">สรุปภาพรวม:</span> สัดส่วนความยืดหยุ่นทางจิตวิทยาอยู่ในเกณฑ์ที่ดี สามารถต่อยอดทักษะการผ่าตัดได้อย่างมั่นใจ
            </div>
          </div>
        </div>

        {/* 3. ACTIVE BUFFS VS. ENERGY DRAINS (Ragnarok Status Effects) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Buffs (Top Strengths) */}
          <div className="rounded-3xl bg-slate-900/90 border border-emerald-900/40 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>🟢 Active Buffs (จุดแข็งประจำตัว)</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400/80 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                {activeBuffs.length} ทักษะเด่น
              </span>
            </div>

            <div className="space-y-3">
              {activeBuffs.map((buff) => (
                <div
                  key={buff.id}
                  className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="text-lg">{buff.icon}</span>
                      <span>{buff.name}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-mono text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {buff.level}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {buff.effectDescription}
                  </p>
                  <div className="mt-1.5 text-[11px] text-emerald-400/80 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>ประโยชน์ในงาน OR: {buff.clinicalBenefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Drains (Debuffs / Red Flags Reframed with Empathy) */}
          <div className="rounded-3xl bg-slate-900/90 border border-rose-900/40 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-400" />
                <span>🔴 Energy Drains (จุดที่สูบพลังงาน)</span>
              </h3>
              <span className="text-xs font-mono text-rose-400/80 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800">
                {energyDrains.length > 0 ? `${energyDrains.length} สัญญาณเตือน` : 'ไม่มีสัญญาณเตือน'}
              </span>
            </div>

            {energyDrains.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">ยอดเยี่ยม! พึ่งพาตนเองได้ดีและมีความสมดุลสูง</h4>
                <p className="text-xs text-slate-400 mt-1">
                  กลไกการรับมือกับความเครียดอยู่ในเกณฑ์สมดุลและมีความพร้อมต่อการเทรนนิ่ง
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {energyDrains.map((drain) => (
                  <div
                    key={drain.id}
                    className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                        <span className="text-base">{drain.icon}</span>
                        <span>{drain.name}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        drain.severity === 'HIGH'
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {drain.severity === 'HIGH' ? 'Support Needed 🤝' : 'Self-Care Focus'}
                      </span>
                    </div>

                    <p className="text-xs text-rose-200/90 leading-relaxed font-medium">
                      {drain.reframedTitle}
                    </p>

                    <div className="mt-2 p-2 rounded-xl bg-slate-950/60 border border-rose-900/30 text-[11px] text-slate-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{drain.reframedAdvice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. MICRO-HABIT QUESTS (Digital Psychiatry Clinical Care) */}
        <div className="rounded-3xl bg-slate-900/90 border border-cyan-900/40 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <span>ภารกิจฝึกสติประจำวัน (Actionable Micro-Habit Quests)</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
              3 Daily Quests
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            เทคนิคการดูแลสุขภาพจิตขนาดเล็ก (Micro-Habits) ที่แพทย์ประจำบ้านสามารถทำได้จริงใน 1-3 นาทีระหว่างปฏิบัติงาน
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {microHabits.map((quest) => (
              <div
                key={quest.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded">
                      {quest.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{quest.timeEstimate}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">
                    {quest.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {quest.instruction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. BOTTOM ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-8">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>พิมพ์หรือบันทึก Infographic (PDF)</span>
          </button>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>เสร็จสิ้นและกลับหน้าหลัก</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
