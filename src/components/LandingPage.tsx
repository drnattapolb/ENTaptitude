import React, { useState } from 'react';
import {
  Stethoscope,
  ArrowRight,
  ShieldAlert,
  Lock,
  X,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { COMMITTEE_PASSWORD } from '../data/assessmentData';

interface LandingPageProps {
  onStartAssessment: () => void;
  onAdminLoginSuccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAssessment,
  onAdminLoginSuccess
}) => {
  // Hidden Committee Passcode Modal state
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const handleOpenPasscodeModal = () => {
    setPasscode('');
    setPasscodeError(false);
    setIsPasscodeModalOpen(true);
  };

  const handlePasscodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() === COMMITTEE_PASSWORD || passcode.trim() === '9413') {
      setIsPasscodeModalOpen(false);
      setPasscode('');
      setPasscodeError(false);
      onAdminLoginSuccess();
    } else {
      setPasscodeError(true);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (passcode.length < 6) {
      const nextCode = passcode + digit;
      setPasscode(nextCode);
      setPasscodeError(false);
      if (nextCode === COMMITTEE_PASSWORD || nextCode === '9413') {
        setTimeout(() => {
          setIsPasscodeModalOpen(false);
          setPasscode('');
          onAdminLoginSuccess();
        }, 120);
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-between bg-[#FAF7F2] overflow-hidden">
      {/* Ambient Decorative Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-[#4A6B56]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-12 right-12 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* 2. TOP HEADER WITH SUBTLE STETHOSCOPE ICON (HIDDEN COMMITTEE ACCESS) */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EBF2ED] border border-[#C6D8CC] flex items-center justify-center text-[#3D5C4A] shadow-sm">
            <span className="text-sm font-extrabold tracking-tighter">ENT</span>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A6B56]">
              Department of Otolaryngology
            </span>
            <span className="block text-[11px] text-[#718277]">
              Residency Training Program • Mentorship Portal
            </span>
          </div>
        </div>

        {/* Subtle, unlabelled Stethoscope icon for hidden interviewer login */}
        <button
          onClick={handleOpenPasscodeModal}
          title="Medical Staff Portal"
          aria-label="Staff Login"
          className="p-2.5 rounded-full text-[#8A9B90] hover:text-[#2C4A37] hover:bg-[#EBF2ED] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4A6B56]/30"
        >
          <Stethoscope className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
        </button>
      </header>

      {/* 1. HERO CLEAN-UP (SINGLE-CARD ZEN STRUCTURE) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-2xl mx-auto">
          {/* Main Card */}
          <div className="relative rounded-[32px] bg-white border border-[#D8E4DC] p-6 sm:p-10 shadow-[0_16px_45px_rgba(44,74,55,0.08)] backdrop-blur-sm">
            
            {/* Header Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2ED] border border-[#C6D8CC] text-[#2C4A37] text-xs font-semibold mb-3">
                <HeartHandshake className="w-3.5 h-3.5 text-[#4A6B56]" />
                <span>Mentorship Conversation Starter</span>
              </div>

              {/* 1. Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1F2823]">
                ENT Surgical Coping Profile
              </h1>
              <p className="text-xs sm:text-sm text-[#5C6E63] mt-2">
                เครื่องมือสำรวจสไตล์การรับมือความเครียดเพื่อการเรียนรู้และพัฒนาตนเอง
              </p>
            </div>

            {/* 2. Card: Psychological Safety Message from the Program Director */}
            <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 text-slate-100 border border-slate-800 shadow-md mb-8 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  💬
                </div>
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-xs sm:text-sm font-bold text-emerald-300 tracking-wide">
                      ข้อความจากประธานหลักสูตรแพทย์ประจำบ้าน ENT
                    </h2>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                      Psychological Safety
                    </span>
                  </div>

                  <blockquote className="text-xs sm:text-[13px] text-slate-200 font-light leading-relaxed italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    &ldquo;ในห้องผ่าตัดจริง ไม่มีคำว่าเพอร์เฟกต์ แพทย์ที่ไม่เคยยอมรับความเปราะบางของตนเอง มักเป็นคนที่เสี่ยงที่สุดเมื่อเผชิญวิกฤติจริง ภาควิชาไม่ได้มองหาผู้สมัครที่ 'ไร้ความเครียด' แต่เรามองหาคนที่ 'ตระหนักรู้ในขีดจำกัดของตนเอง' ขอให้คุณตอบตามความเป็นจริงที่สุด เพื่อให้เราเข้าใจและพร้อมดูแลคุณ&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ภาควิชาให้ความสำคัญกับ Self-Awareness และพร้อมร่วมมือดูแลในฐานะ Mentor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Primary Button: High-contrast Emerald/Cyan gradient */}
            <div className="flex flex-col items-center">
              <button
                onClick={onStartAssessment}
                className="w-full sm:w-auto min-w-[320px] sm:min-w-[360px] py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-base sm:text-lg shadow-lg shadow-emerald-700/25 hover:shadow-emerald-700/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <span>เริ่มสำรวจสไตล์การรับมือความเครียด</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 4. Reassuring Subtext (Directly under button) */}
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-3.5 text-center">
                ไม่มีคะแนนถูก-ผิด • ผลลัพธ์ใช้ประกอบบทสนทนาในการสัมภาษณ์
              </p>
            </div>

            {/* Quick Reassuring Feature Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-8 pt-6 border-t border-[#E8EFEA] text-center">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E4ECE7]">
                <Clock className="w-4 h-4 mx-auto text-[#4A6B56] mb-1" />
                <span className="block text-[11px] font-bold text-[#2C4A37]">5–8 นาที</span>
                <span className="block text-[10px] text-[#718277]">กระชับ คล่องตัว</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E4ECE7]">
                <Sparkles className="w-4 h-4 mx-auto text-[#4A6B56] mb-1" />
                <span className="block text-[11px] font-bold text-[#2C4A37]">7 สถานการณ์</span>
                <span className="block text-[10px] text-[#718277]">เคสผ่าตัดจริง</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E4ECE7]">
                <CheckCircle2 className="w-4 h-4 mx-auto text-[#4A6B56] mb-1" />
                <span className="block text-[11px] font-bold text-[#2C4A37]">ปลอดภัย 100%</span>
                <span className="block text-[10px] text-[#718277]">ไม่ตัดสินแพ้ชนะ</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Minimal Reassuring Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-[#718277]">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-[11px]">
          <span>Department of Otolaryngology Mentorship Initiative</span>
          <span>Resilience & Surgical Well-being</span>
        </div>
      </footer>

      {/* HIDDEN COMMITTEE ACCESS: Passcode Modal (PIN: 9413) */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-[28px] bg-white border border-[#D6E2DA] p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsPasscodeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2823]">
                Interviewer & Committee Portal
              </h3>
              <p className="text-xs text-[#5C6E63] mt-1">
                กรุณาระบุรหัสผ่านเพื่อเข้าสู่แดชบอร์ดกรรมการ
              </p>
            </div>

            {/* Passcode Form */}
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError(false);
                  }}
                  placeholder="••••"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-[#FBF9F5] border text-center text-2xl tracking-[0.5em] font-mono font-bold text-[#2C4A37] focus:outline-none transition-all ${
                    passcodeError
                      ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-200'
                      : 'border-[#C6D8CC] focus:border-[#4A6B56] focus:ring-2 focus:ring-[#4A6B56]/20'
                  }`}
                />
                {passcodeError && (
                  <p className="text-xs font-semibold text-rose-600 mt-2 text-center animate-in fade-in">
                    รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
                  </p>
                )}
              </div>

              {/* Number Keypad for quick mobile/tablet entry */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="py-3 rounded-xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 text-slate-800 hover:text-emerald-800 font-bold text-base transition-colors border border-slate-200"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPasscode('');
                    setPasscodeError(false);
                  }}
                  className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-xs border border-slate-200"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-3 rounded-xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 text-slate-800 hover:text-emerald-800 font-bold text-base transition-colors border border-slate-200"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasscode((prev) => prev.slice(0, -1));
                    setPasscodeError(false);
                  }}
                  className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-xs border border-slate-200"
                >
                  Del
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#2C4A37] hover:bg-[#1E3326] text-white font-bold text-sm shadow-md transition-all mt-3 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>ยืนยันรหัสผ่าน</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
