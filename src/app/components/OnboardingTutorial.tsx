import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle, Zap } from 'lucide-react';
import { useLocation } from 'react-router';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  highlightElement?: string;
  position?: 'center' | 'top' | 'bottom';
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BudgetTrack!',
    description: "We're a Financial Discipline Coach, not just a tracker. Let's show you the two numbers you'll check every day.",
    position: 'center'
  },
  {
    id: 'daily_spendable',
    title: 'Your Daily Spending Limit',
    description: "This is your spending limit for TODAY. Notice it doesn't change as you spend—that's intentional. It gives you a consistent target to hit.",
    highlightElement: '[data-onboarding="daily-spendable"]',
    position: 'bottom'
  },
  {
    id: 'demo_transaction',
    title: 'Try Adding an Expense',
    description: "Let's add a fake $20 coffee purchase. Watch what happens to your metrics.",
    position: 'center',
    action: {
      label: 'Add $20 Coffee',
      onClick: () => {
        const event = new CustomEvent('demo-transaction', {
          detail: { amount: 20, title: 'Demo Coffee', type: 'expense' }
        });
        window.dispatchEvent(event);
      }
    }
  },
  {
    id: 'explain_difference',
    title: 'See the Difference?',
    description: "Daily Spendable didn't change—but Real-Time Safe Spend did. One gives you a static target, the other tracks real-time reality.",
    highlightElement: '[data-onboarding="safe-spend"]',
    position: 'bottom'
  },
  {
    id: 'completion',
    title: "You're All Set!",
    description: "Info icons (ℹ️) are everywhere if you need help. Ready to add your first real transaction?",
    icon: <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />,
    position: 'center'
  }
];

export function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [demoAdded, setDemoAdded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only run onboarding logic if we are explicitly on the dashboard
    if (location.pathname !== '/dashboard') {
      setIsVisible(false);
      return;
    }

    const completed = localStorage.getItem('completed_onboarding');
    const skipped = localStorage.getItem('skipped_onboarding');
    const signupTimestampStr = localStorage.getItem('signup_timestamp');
    
    // Safety check: Make sure we aren't showing it to users who have finished it
    if (completed || skipped) return;

    if (signupTimestampStr) {
      const signupTime = parseInt(signupTimestampStr, 10);
      const fiveMinutes = 5 * 60 * 1000;
      // If signup was less than 5 minutes ago, auto-trigger
      if (Date.now() - signupTime < fiveMinutes) {
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname]);

  // DOM Highlighting Engine
  useEffect(() => {
    if (!isVisible) return;

    const currentStep = STEPS[currentStepIndex];

    // Cleanup previous highlights
    document.querySelectorAll('[data-onboarding]').forEach(el => {
      const element = el as HTMLElement;
      element.style.position = '';
      element.style.zIndex = '';
      element.style.boxShadow = '';
      element.style.borderRadius = '';
      element.style.backgroundColor = '';
      element.style.pointerEvents = '';
    });

    if (currentStep.highlightElement) {
      // Small delay to ensure React DOM has rendered the elements on the dashboard
      const timer = setTimeout(() => {
        const el = document.querySelector(currentStep.highlightElement!) as HTMLElement;
        if (el) {
          el.style.position = 'relative';
          el.style.zIndex = '60';
          el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
          el.style.borderRadius = '8px';
          el.style.backgroundColor = '#18181b'; 
          el.style.pointerEvents = 'none'; // Prevent clicking the card behind the overlay
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isVisible]);

  // Clean up all highlights when unmounting
  useEffect(() => {
    return () => {
      document.querySelectorAll('[data-onboarding]').forEach(el => {
        const element = el as HTMLElement;
        element.style.position = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
        element.style.borderRadius = '';
        element.style.backgroundColor = '';
        element.style.pointerEvents = '';
      });
    };
  }, []);

  if (!isVisible) return null;

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const progressValue = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('completed_onboarding', 'true');
      setIsVisible(false);
      // Remove demo badge globally if it still exists
      document.body.classList.remove('has-demo-transaction');
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('skipped_onboarding', 'true');
    setIsVisible(false);
  };

  const executeAction = () => {
    if (currentStep.action) {
        currentStep.action.onClick();
        setDemoAdded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
      {/* Dark Backdrop (Dim the whole screen except the highlighted relative z-60 elements) */}
      <div className="absolute inset-0 bg-black/80 pointer-events-auto transition-opacity duration-300" />
      
      {/* Modal Positioner */}
      <div className={`relative z-[100] w-full max-w-sm mx-auto p-4 flex-1 pointer-events-none flex flex-col ${
        currentStep.position === 'center' ? 'justify-center' :
        currentStep.position === 'top' ? 'justify-start mt-24' :
        'justify-end mb-24'
      }`}>
        
        <Card className="bg-[#18181b] border-zinc-700 shadow-2xl pointer-events-auto w-full animate-in zoom-in-95 fade-in duration-200">
          <CardHeader className="text-center pb-2">
            {currentStep.icon}
            <CardTitle className="text-white text-xl">{currentStep.title}</CardTitle>
            <CardDescription className="text-zinc-400 text-sm mt-2">
              {currentStep.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            
            {currentStep.action && (
              <div className="flex justify-center">
                <Button 
                  onClick={executeAction}
                  disabled={demoAdded}
                  className={`bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center gap-2 ${demoAdded ? 'opacity-50' : ''}`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {demoAdded ? 'Coffee Added!' : currentStep.action.label}
                </Button>
              </div>
            )}

            {currentStep.id === 'explain_difference' && (
              <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-400 text-center gap-2">
                <div className="flex-1">
                  <p className="font-bold text-white">Daily Spendable</p>
                  <p className="text-emerald-500 font-bold mt-1">NO CHANGE</p>
                </div>
                <div className="w-px h-8 bg-zinc-700" />
                <div className="flex-1">
                  <p className="font-bold text-white">Safe Spend</p>
                  <p className="text-rose-500 font-bold mt-1">DROPS -$20</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="text-zinc-500 hover:text-white px-2"
                style={{ visibility: isLastStep || currentStepIndex === 0 ? 'hidden' : 'visible' }}
              >
                Skip
              </Button>
              
              <div className="flex flex-col items-center gap-1.5 flex-1 mx-4">
                <Progress value={progressValue} className="h-1 bg-zinc-800" indicatorClassName="bg-blue-500" />
                <span className="text-[10px] text-zinc-500 font-medium">Step {currentStepIndex + 1} of {STEPS.length}</span>
              </div>

              <Button 
                size="sm" 
                onClick={handleNext}
                disabled={currentStep.id === 'demo_transaction' && !demoAdded}
                className={isLastStep ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white text-black hover:bg-zinc-200 px-4'}
              >
                {isLastStep ? 'Start Budgeting' : 'Next →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
