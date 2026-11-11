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
    <header className="sticky top-0 z-40 w-full border-b border-[#E2ECE5] bg-[#FAF7F2]/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo with Warm Sage Green Theme */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#5A826B] to-[#3D5C4A] p-0.5 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-[#4A6B56]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D46B47] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D46B47]"></span>
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#1F2823] group-hover:text-[#4A6B56] transition-colors truncate">
              ResiCope
            </span>
          </div>
        </div>

        {/* Action Controls & Navigation Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {currentView === 'candidate' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EBF2ED] border border-[#C6D8CC] text-[#2C4A37] text-xs font-semibold shadow-xs max-w-[130px] sm:max-w-none truncate">
              <UserCheck className="w-3.5 h-3.5 text-[#4A6B56] shrink-0" />
              <span className="truncate">{candidateName || 'ผู้สมัคร'}</span>
            </div>
          )}

          {currentView === 'committee' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F8ECE8] border border-[#E9C5B9] text-[#A64525] text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D46B47]" />
              <span className="hidden sm:inline">แดชบอร์ดกรรมการ (Committee)</span>
              <span className="sm:hidden">กรรมการ</span>
            </div>
          )}

          {currentView !== 'welcome' && (
            <button
              onClick={onNavigateHome}
              className="spring-bounce flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-[#3D5C4A] hover:text-[#1F2823] bg-white hover:bg-[#F2F7F4] border border-[#D6E2DA] shadow-xs transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">หน้าแรก</span>
            </button>
          )}

          <button
            onClick={onResetData}
            title="รีเซ็ตข้อมูลตัวอย่าง"
            className="spring-bounce p-1.5 sm:p-2 rounded-xl text-[#607065] hover:text-[#1F2823] bg-white hover:bg-[#EBF2ED] border border-[#D6E2DA] shadow-xs transition-all hidden sm:flex cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
