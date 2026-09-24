import React, { useState } from 'react';
import { ArrowRight, Check, Shield, Clock, Target, Sparkles } from 'lucide-react';
import { PixelMascot } from '../mascot/PixelMascot';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Focus Buddy',
      subtitle: 'A cozy pixel-art companion that quietly helps you become disciplined.',
      icon: <PixelMascot id="calico_cat" state="celebrating" size={64} />,
      content: 'No corporate SaaS clutter, no noisy feeds. Just a warm study desk, peaceful ambient sounds, and an adorable companion cheering you on.',
    },
    {
      title: 'Conquer Hesitation',
      subtitle: 'Anti-procrastination tracking built right in.',
      icon: <Clock className="w-12 h-12 text-[#df793b]" />,
      content: 'Focus Buddy measures the gap between when you planned to start and when you actually sit down. If you delay, gentle non-judgmental nudges help break the friction.',
    },
    {
      title: 'Hard Distraction Blocking',
      subtitle: 'Locks social media & games during deep work.',
      icon: <Shield className="w-12 h-12 text-[#488053]" />,
      content: 'Once your session starts, your blocklist is hard-locked. No sneaking onto YouTube halfway through. Emergency unlock is there if needed, but accountability is real.',
    },
    {
      title: 'Earn Honest Rewards',
      subtitle: 'Decorate your dream study sanctuary.',
      icon: <Sparkles className="w-12 h-12 text-[#ffd152]" />,
      content: 'Every focused minute awards XP and coins. Visit the bazaar to unlock cozy room themes, retro timer skins, and ambient soundscapes.',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white border-3 border-[#2c221e] rounded-2xl p-6 md:p-8 shadow-pixel max-w-lg w-full text-center flex flex-col justify-between min-h-[420px]">
        {/* Top Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                step === idx ? 'w-8 bg-[#488053]' : 'w-2 bg-[#ded3c5]'
              }`}
            />
          ))}
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center my-auto">
          <div className="w-20 h-20 bg-[#faeedf] border-2 border-[#2c221e] rounded-2xl flex items-center justify-center shadow-xs mb-4">
            {currentStep.icon}
          </div>

          <h2 className="font-pixel text-base md:text-lg text-[#2c221e] mb-2">
            {currentStep.title}
          </h2>
          <h3 className="font-bold text-xs md:text-sm text-[#df793b] mb-3">
            {currentStep.subtitle}
          </h3>
          <p className="text-xs md:text-sm text-[#5c4a3f] leading-relaxed max-w-sm">
            {currentStep.content}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[#f0e6dc] mt-6">
          <button
            onClick={onComplete}
            className="text-xs font-bold text-[#847367] hover:text-[#2c221e]"
          >
            Skip Setup
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 pixel-btn-primary rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <span>{step === steps.length - 1 ? 'Enter Study Room' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
