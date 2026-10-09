import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Lock, ArrowRight, X, AlertCircle } from 'lucide-react';

interface SecretAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  validCode?: string;
}

export const SecretAccessModal: React.FC<SecretAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  validCode = 'tanvir88',
}) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputCode('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim() === 'tanvir88') {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setInputCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle Decorative Aura */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              গোপন সিকিউরিটি অ্যাক্সেস
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              এডমিন প্যানেলে প্রবেশ করতে সিক্রেট কোড প্রদান করুন
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2 justify-center font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>ভুল সিক্রেট কোড! পুনরায় চেষ্টা করুন।</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="password"
              autoComplete="off"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="সিক্রেট কোড লিখুন..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-center tracking-widest font-mono text-base font-bold transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span>প্যানেল আনলক করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
