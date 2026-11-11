import React, { useState } from 'react';
import {
  Stethoscope,
  ArrowRight,
  Lock,
  X,
  KeyRound,
  Heart
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Soft Emerald Ambient Glow (Single Center-Piece Glow) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* STEP 3: STEALTH HEADER WITH SUBTLE STETHOSCOPE ICON (ZERO ADMIN TEXT) */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400 tracking-wide">
            ENT Residency Mentorship Portal
          </span>
        </div>

        {/* Subtle, unlabelled Stethoscope icon for stealth faculty access */}
        <button
          onClick={handleOpenPasscodeModal}
          title="Staff Portal"
          aria-label="Staff Portal"
          className="p-2 rounded-xl text-slate-600 hover:text-emerald-400 hover:bg-slate-900/60 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
        >
          <Stethoscope className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
        </button>
      </header>

      {/* STEP 2: HERO FOCUS (SINGLE-CARD CENTER PIECE - ZERO NOISE) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-xl mx-auto">
          {/* Centered Floating Glassmorphism Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md p-6 sm:p-9 shadow-2xl space-y-6">
            
            {/* 1. Title */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium mb-1">
                <Heart className="w-3.5 h-3.5 fill-emerald-400/20 text-emerald-400" />
                <span>Mentorship Conversation Starter</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
                ENT Surgical Coping Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light">
                สำรวจสไตล์การรับมือความท้าทายเพื่อเตรียมความพร้อมในการฝึกอบรม
              </p>
            </div>

            {/* 2. Director's Safety Message Card */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-5 text-left space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>💬</span>
                  <span>ข้อความจากประธานหลักสูตรแพทย์ประจำบ้าน ENT</span>
                </h2>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-800/70">
                  Psychological Safety
                </span>
              </div>

              <blockquote className="text-xs sm:text-[13px] text-slate-200 font-light leading-relaxed italic bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
                &ldquo;ในห้องผ่าตัดจริง ไม่มีคำว่าเพอร์เฟกต์ แพทย์ที่ไม่เคยยอมรับความเปราะบางของตนเอง มักเป็นคนที่เสี่ยงที่สุดเมื่อเผชิญวิกฤติจริง ภาควิชาไม่ได้มองหาผู้สมัครที่ 'ไร้ความเครียด' แต่เรามองหาคนที่ 'ตระหนักรู้ในขีดจำกัดของตนเอง' ขอให้คุณตอบตามความเป็นจริงที่สุด เพื่อให้เราเข้าใจและพร้อมดูแลคุณ&rdquo;
              </blockquote>

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>ภาควิชาให้คุณค่ากับการรู้เท่าทันตนเอง (Self-Awareness) และพร้อมดูแลในฐานะ Mentor</span>
              </p>
            </div>

            {/* 3. Primary CTA Button + 4. Reassuring Subtext */}
            <div className="space-y-3 pt-1">
              <button
                onClick={onStartAssessment}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-base sm:text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>เริ่มสำรวจสไตล์การรับมือความเครียด</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs sm:text-sm text-slate-400 font-normal text-center">
                ไม่มีคะแนนถูก-ผิด • ผลลัพธ์ใช้ประกอบบทสนทนาในการสัมภาษณ์
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Minimal Reassuring Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-600">
        <p>Department of Otolaryngology • Residency Mentorship Portal</p>
      </footer>

      {/* STEALTH COMMITTEE PASSCODE MODAL (PIN: 9413) */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setIsPasscodeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3 shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Faculty Selection Committee Portal
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                กรุณาระบุรหัสผ่านเพื่อเข้าสู่ Mentorship Dashboard
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
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border text-center text-2xl tracking-[0.5em] font-mono font-bold text-emerald-400 focus:outline-none transition-all ${
                    passcodeError
                      ? 'border-rose-500 bg-rose-950/30 ring-1 ring-rose-500'
                      : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                  }`}
                />
                {passcodeError && (
                  <p className="text-xs font-medium text-rose-400 mt-2 text-center animate-in fade-in">
                    รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
                  </p>
                )}
              </div>

              {/* Number Keypad for fast tablet/mobile entry */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="py-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 active:bg-slate-700 text-slate-200 hover:text-white font-bold text-base transition-colors border border-slate-800 cursor-pointer"
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
                  className="py-3 rounded-xl bg-slate-950/50 hover:bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-800 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 active:bg-slate-700 text-slate-200 hover:text-white font-bold text-base transition-colors border border-slate-800 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasscode((prev) => prev.slice(0, -1));
                    setPasscodeError(false);
                  }}
                  className="py-3 rounded-xl bg-slate-950/50 hover:bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-800 cursor-pointer"
                >
                  Del
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-md transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer"
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
