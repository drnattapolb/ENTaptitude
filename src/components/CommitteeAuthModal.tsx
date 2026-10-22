import React, { useState } from 'react';
import { Lock, X, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { COMMITTEE_PASSWORD } from '../data/assessmentData';

interface CommitteeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CommitteeAuthModal: React.FC<CommitteeAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.trim() === COMMITTEE_PASSWORD) {
      setError(false);
      onSuccess();
      setPin('');
    } else {
      setError(true);
      setErrorMessage('รหัสผ่านความปลอดภัยไม่ถูกต้อง กรุณาตรวจสอบกับทางหลักสูตร');
    }
  };

  const handleQuickKey = (num: string) => {
    if (pin.length < 10) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin === COMMITTEE_PASSWORD) {
        setTimeout(() => {
          onSuccess();
          setPin('');
        }, 120);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-[32px] organic-card p-7 sm:p-9 bg-white border border-[#D6E2DA] shadow-[0_20px_50px_rgba(74,107,86,0.15)]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="spring-bounce absolute top-5 right-5 p-2 rounded-2xl text-[#7E8F84] hover:text-[#1F2823] hover:bg-[#FAF7F2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-[22px] bg-[#EBF2ED] border border-[#C6D8CC] flex items-center justify-center text-[#4A6B56] mb-3 shadow-md shadow-[#4A6B56]/15">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2823] tracking-tight">
            ยืนยันสิทธิ์คณะกรรมการคัดเลือก
          </h3>
          <p className="text-xs text-[#58665E] mt-1">
            Faculty Selection Committee & Evaluator Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#38453E] mb-2 text-center">
              กรุณากรอกรหัสผ่านความปลอดภัย (Security PIN)
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="••••"
                className={`w-full px-4 py-3.5 rounded-2xl bg-[#FBF9F5] border text-center text-2xl tracking-[0.5em] font-mono font-bold text-[#375241] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-[#9AA8A0] focus:outline-none transition-all ${
                  error
                    ? 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-500'
                    : 'border-[#D6E2DA] focus:border-[#4A6B56] focus:ring-4 focus:ring-[#4A6B56]/10'
                }`}
                autoFocus
              />
              <KeyRound className="absolute left-4 top-4 w-5 h-5 text-[#88998F]" />
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-2xl animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Touch-Friendly Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickKey(String(num))}
                className="spring-bounce py-3.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#EBF2ED] active:scale-95 border border-[#D6E2DA] hover:border-[#4A6B56]/40 text-[#1F2823] font-mono font-bold text-lg transition-all shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="spring-bounce py-3.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF7F2] active:scale-95 border border-[#D6E2DA] text-[#6E7E74] text-xs font-bold transition-all"
            >
              ล้าง
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="spring-bounce py-3.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#EBF2ED] active:scale-95 border border-[#D6E2DA] hover:border-[#4A6B56]/40 text-[#1F2823] font-mono font-bold text-lg transition-all shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="spring-bounce py-3.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF7F2] active:scale-95 border border-[#D6E2DA] text-[#6E7E74] text-xs font-bold transition-all"
            >
              ลบ (Del)
            </button>
          </div>

          <button
            type="submit"
            className="spring-bounce w-full mt-4 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-[#4A6B56] hover:bg-[#375241] text-white font-bold text-sm shadow-md shadow-[#4A6B56]/20 transition-all active:scale-[0.98]"
          >
            <span>ยืนยันเข้าสู่ระบบ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
