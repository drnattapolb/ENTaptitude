import React from 'react';
import {
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  Clock,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectCandidate: () => void;
  onSelectCommittee: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectCandidate,
  onSelectCommittee
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center">
      {/* Gentle Ambient Glows */}
      <div className="absolute top-1/6 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#4A6B56]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D46B47]/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Hero Header - Visual, Compact, and Impactful */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2ED] border border-[#C6D8CC] text-[#375241] text-xs font-bold mb-4 shadow-sm">
          <Stethoscope className="w-4 h-4 text-[#4A6B56]" />
          <span>Resident Clinical Survey</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1F2823] mb-3">
          แบบสำรวจการปฏิบัติงาน
          <span className="block mt-1 bg-gradient-to-r from-[#4A6B56] to-[#D46B47] bg-clip-text text-transparent">
            แพทย์ประจำบ้าน
          </span>
        </h1>
        <p className="text-[#58665E] text-sm sm:text-base font-normal max-w-lg mx-auto">
          สำรวจแนวทางการตัดสินใจและการบริหารงานในเวชปฏิบัติจริง
        </p>

        {/* Quick Visual Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D6E2DA] text-xs font-semibold text-[#4A6B56] shadow-sm">
            <Clock className="w-3.5 h-3.5" /> 5–8 นาที
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D6E2DA] text-xs font-semibold text-[#4A6B56] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> 7 ชุดคำถาม
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D6E2DA] text-xs font-semibold text-[#4A6B56] shadow-sm">
            <Smartphone className="w-3.5 h-3.5" /> แตะเลือกบนมือถือ
          </span>
        </div>
      </div>

      {/* 2 MAIN CARDS: Candidate & Committee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-10">
        {/* Candidate Portal */}
        <div
          onClick={onSelectCandidate}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectCandidate()}
          className="group relative cursor-pointer rounded-[28px] p-6 sm:p-7 bg-white border border-[#D6E2DA] hover:border-[#4A6B56] shadow-[0_8px_24px_rgba(74,107,86,0.06)] hover:shadow-[0_16px_36px_rgba(74,107,86,0.12)] transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-2xl bg-[#EBF2ED] border border-[#C6D8CC] flex items-center justify-center text-[#4A6B56] group-hover:scale-105 transition-transform shadow-sm">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF2ED] text-[#375241]">
                ผู้สมัคร
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#1F2823] group-hover:text-[#4A6B56] transition-colors mb-2">
              สำหรับผู้สมัคร
            </h2>
            <p className="text-xs text-[#58665E] mb-5">
              เลือก 2 ตัวเลือกในแต่ละข้อตามความเป็นจริง (ไม่มีข้อถูกหรือผิด)
            </p>

            {/* Visual Touch Rule Anchors */}
            <div className="space-y-2 mb-6 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span>1 ข้อ: <strong className="font-bold text-sky-700">เป็นตัวท่านมากที่สุด</strong></span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>1 ข้อ: <strong className="font-bold text-rose-700">เป็นตัวท่านน้อยที่สุด</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EDF3EF] flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A6B56]">เริ่มทำแบบสำรวจ</span>
            <div className="spring-bounce flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D46B47] text-white text-xs font-bold shadow-md shadow-[#D46B47]/20 group-hover:bg-[#BF5A37]">
              <span>เริ่มต้น</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Committee Portal */}
        <div
          onClick={onSelectCommittee}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectCommittee()}
          className="group relative cursor-pointer rounded-[28px] p-6 sm:p-7 bg-white border border-[#D6E2DA] hover:border-[#D46B47] shadow-[0_8px_24px_rgba(74,107,86,0.06)] hover:shadow-[0_16px_36px_rgba(212,107,71,0.12)] transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-2xl bg-[#F8ECE8] border border-[#E9C5B9] flex items-center justify-center text-[#D46B47] group-hover:scale-105 transition-transform shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F8ECE8] text-[#A64525]">
                กรรมการ
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#1F2823] group-hover:text-[#D46B47] transition-colors mb-2">
              สำหรับคณะกรรมการ
            </h2>
            <p className="text-xs text-[#58665E] mb-5">
              แดชบอร์ดสรุปผลรายบุคคลและภาพรวม (จำกัดสิทธิ์เฉพาะอาจารย์)
            </p>

            <div className="space-y-2 mb-6 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E2ECE5] text-[#38453E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B56] shrink-0" />
                <span>สรุปสัดส่วน 4 โดเมนหลัก & เกณฑ์ความเสี่ยง</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E2ECE5] text-[#38453E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B56] shrink-0" />
                <span>แนวทางคำถามสัมภาษณ์และบันทึกคะแนน</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EDF3EF] flex items-center justify-between">
            <span className="text-xs font-bold text-[#58665E]">เข้าสู่ระบบกรรมการ</span>
            <div className="spring-bounce flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A6B56] text-white text-xs font-bold shadow-md shadow-[#4A6B56]/20 group-hover:bg-[#375241]">
              <span>ใส่รหัสผ่าน</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
