import React from 'react';
import { Stethoscope, ShieldCheck, UserCheck, RefreshCw, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: 'welcome' | 'candidate' | 'committee';
  candidateName?: string;
  onNavigateHome: () => void;
  onOpenCommittee: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  candidateName,
  onNavigateHome,
  onOpenCommittee,
  onResetData
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2ECE5] bg-[#FAF7F2]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo with Warm Sage Green Theme */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5A826B] to-[#3D5C4A] p-0.5 flex items-center justify-center shadow-md shadow-[#4A6B56]/20 group-hover:shadow-[#4A6B56]/35 group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#4A6B56] group-hover:rotate-6 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D46B47] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D46B47]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#1F2823] group-hover:text-[#4A6B56] transition-colors">
                ResiCope<span className="text-[#D46B47] font-extrabold">.ai</span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-[#EBF2ED] text-[#3D5C4A] border border-[#C6D8CC]">
                Resident Practice Survey
              </span>
            </div>
            <p className="text-[11px] text-[#607065] font-light hidden sm:block">
              ระบบสำรวจสถานการณ์การปฏิบัติงานและเวชปฏิบัติแพทย์ประจำบ้าน
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Badges */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {currentView === 'candidate' && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#EBF2ED] border border-[#C6D8CC] text-[#2C4A37] text-xs font-medium shadow-sm">
              <UserCheck className="w-4 h-4 text-[#4A6B56]" />
              <span className="font-semibold">{candidateName || 'กำลังทำแบบสำรวจ'}</span>
            </div>
          )}

          {currentView === 'committee' && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F8ECE8] border border-[#E9C5B9] text-[#A64525] text-xs font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#D46B47]" />
              <span>แดชบอร์ดคณะกรรมการ (Committee)</span>
            </div>
          )}

          {currentView !== 'welcome' ? (
            <button
              onClick={onNavigateHome}
              className="spring-bounce flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-[#3D5C4A] hover:text-[#1F2823] bg-white hover:bg-[#F2F7F4] border border-[#D6E2DA] shadow-sm transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>หน้าแรก</span>
            </button>
          ) : (
            <button
              onClick={onOpenCommittee}
              className="spring-bounce flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-[#4A6B56] hover:bg-[#3D5C4A] shadow-md shadow-[#4A6B56]/20 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบกรรมการ 🔒</span>
            </button>
          )}

          <button
            onClick={onResetData}
            title="รีเซ็ตข้อมูลตัวอย่าง (Reset mock data)"
            className="spring-bounce p-2 rounded-2xl text-[#607065] hover:text-[#1F2823] bg-white hover:bg-[#EBF2ED] border border-[#D6E2DA] shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
