import React from 'react';
import { CheckCircle2, Heart, Home } from 'lucide-react';

interface CompletionProps {
  onReturnHome: () => void;
}

export const CandidateCompletionScreen: React.FC<CompletionProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl text-center space-y-6 z-10">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-100">
            บันทึกข้อมูลเรียบร้อยแล้ว
          </h1>
          <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-emerald-400/20" />
            ขอบคุณสำหรับการเปิดใจตอบแบบสำรวจตามความเป็นจริง
          </p>
        </div>

        {/* Message Box */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-slate-300 text-xs sm:text-sm leading-relaxed text-left space-y-2">
          <p>
            ข้อมูลของคุณถูกบันทึกเข้าระบบเรียบร้อยแล้ว ผลประเมินนี้จะถูกนำไปใช้เป็น <strong>&ldquo;หัวข้อชวนคุยในการสัมภาษณ์&rdquo;</strong> เพื่อให้อาจารย์เข้าใจสไตล์การทำงาน และเตรียมแผนซัพพอร์ตการเรียนของคุณในภาควิชา
          </p>
        </div>

        {/* Reassuring De-escalation Note */}
        <p className="text-xs text-slate-400 italic">
          💡 ขอให้คุณผ่อนคลาย พักสายตา และเตรียมความพร้อมสำหรับเข้าสัมภาษณ์
        </p>

        {/* CTA Button */}
        <button
          onClick={onReturnHome}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 hover:text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
        >
          <Home className="w-4 h-4" />
          <span>กลับสู่หน้าหลัก</span>
        </button>

      </div>
    </div>
  );
};
