import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CandidateAssessment } from './components/CandidateAssessment';
import { CommitteeDashboard } from './components/CommitteeDashboard';
import { CommitteeAuthModal } from './components/CommitteeAuthModal';
import { CandidateAssessmentResult } from './types/assessment';
import {
  getStoredCandidates,
  resetCandidatesToDefault,
  updateCandidateInStorage
} from './data/mockCandidates';

export default function App() {
  const [currentView, setCurrentView] = useState<'welcome' | 'candidate' | 'committee'>('welcome');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<CandidateAssessmentResult[]>([]);
  const [candidateNameHeader, setCandidateNameHeader] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getStoredCandidates();
    setCandidates(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectCandidate = () => {
    setCurrentView('candidate');
  };

  const handleSelectCommittee = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setCandidates(getStoredCandidates());
    setCurrentView('committee');
  };

  const handleCandidateFinished = () => {
    setCandidates(getStoredCandidates());
    setCurrentView('welcome');
    setCandidateNameHeader('');
  };

  const handleExitToHome = () => {
    setCandidates(getStoredCandidates());
    setCurrentView('welcome');
    setCandidateNameHeader('');
  };

  const handleUpdateCandidate = (updated: CandidateAssessmentResult) => {
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    updateCandidateInStorage(updated);
  };

  const handleResetData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลผู้สมัครกลับเป็นค่าเริ่มต้น (3 คนตัวอย่าง) หรือไม่?')) {
      const reset = resetCandidatesToDefault();
      setCandidates(reset);
      showToast('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2823] flex flex-col selection:bg-[#4A6B56] selection:text-white font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#375241] text-white text-xs font-bold shadow-xl shadow-[#375241]/25 border border-[#4A6B56] backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          {toastMessage}
        </div>
      )}

      {/* Navigation Header (Shown during Candidate & Committee sessions) */}
      {currentView !== 'welcome' && (
        <Navbar
          currentView={currentView}
          candidateName={candidateNameHeader}
          onNavigateHome={handleExitToHome}
          onOpenCommittee={handleSelectCommittee}
          onResetData={handleResetData}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'welcome' && (
          <LandingPage
            onStartAssessment={handleSelectCandidate}
            onAdminLoginSuccess={handleAuthSuccess}
          />
        )}

        {currentView === 'candidate' && (
          <CandidateAssessment
            onComplete={handleCandidateFinished}
            onExit={handleExitToHome}
            setCandidateNameHeader={setCandidateNameHeader}
          />
        )}

        {currentView === 'committee' && (
          <CommitteeDashboard
            candidates={candidates}
            onUpdateCandidate={handleUpdateCandidate}
            onResetData={handleResetData}
            onLogout={handleExitToHome}
          />
        )}
      </main>

      {/* Committee PIN Auth Modal */}
      <CommitteeAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Global Minimal Warm Footer (Shown when outside welcome screen) */}
      {currentView !== 'welcome' && (
        <footer className="border-t border-[#E2ECE5] py-5 px-6 text-center text-xs text-[#68776F] font-normal no-print bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>ResiCope — ระบบสำรวจสถานการณ์และการปฏิบัติงานของแพทย์ประจำบ้าน</span>
            <span className="text-[#84948B] font-mono text-[11px]">สงวนลิขสิทธิ์เฉพาะคณะกรรมการคัดเลือกแพทย์ประจำบ้าน</span>
          </div>
        </footer>
      )}
    </div>
  );
}
