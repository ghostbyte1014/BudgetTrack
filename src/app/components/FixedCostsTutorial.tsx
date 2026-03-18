import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Lock, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router';

interface FixedCostStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  highlightElement?: string;
}

const STEPS: FixedCostStep[] = [
  {
    id: 'welcome_fixed_costs',
    title: 'Reserved Allocation',
    description: "Fixed Costs are automatically deducted from your Monthly Pool on day 1. This locks the money away so your Daily Spendable target isn't artificially inflated.",
    icon: <Lock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
  },
  {
    id: 'paying_a_bill',
    title: 'Satisfying a Bill',
    description: "When the real bill hits your bank account, log it in The Vault and toggle 'Is this a pre-allocated Fixed Cost?'. This marks the bill as paid without double-deducting from your pool!",
    highlightElement: '[data-onboarding="fixed-costs-allocation"]'
  },
  {
    id: 'fixed_costs_completion',
    title: "You're Ready",
    description: "Add your rent, subscriptions, and recurring bills to instantly lock them into your financial plan.",
    icon: <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
  }
];

export function FixedCostsTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Only trigger if we are actively on the Fixed Costs view
    if (location.pathname !== '/fixed-costs') {
      setIsVisible(false);
      return;
    }

    const completed = localStorage.getItem('seen_fixed_costs_tutorial');
    if (completed) return;

    // Small delay to ensure the page has painted before popping the modal
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Highlighting Engine
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
      const timer = setTimeout(() => {
        const el = document.querySelector(currentStep.highlightElement!) as HTMLElement;
        if (el) {
          el.style.position = 'relative';
          el.style.zIndex = '60';
          el.style.boxShadow = '0 0 0 4px rgba(249, 115, 22, 0.5)'; // Orange ring
          el.style.borderRadius = '8px';
          el.style.backgroundColor = '#18181b'; 
          el.style.pointerEvents = 'none';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isVisible]);

  // Cleanup all highlights on unmount
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
      localStorage.setItem('seen_fixed_costs_tutorial', 'true');
      setIsVisible(false);
      // Clean up the DOM glow manually just in case
      document.querySelectorAll('[data-onboarding]').forEach(el => {
        const element = el as HTMLElement;
        element.style.position = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
        element.style.backgroundColor = '';
      });
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('seen_fixed_costs_tutorial', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
      <div className="absolute inset-0 bg-black/80 pointer-events-auto transition-opacity duration-300 backdrop-blur-sm" />
      
      <div className={`relative z-[100] w-full max-w-sm mx-auto p-4 flex-1 pointer-events-none flex flex-col ${
        currentStep.highlightElement ? 'justify-end mb-24' : 'justify-center'
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
                <Progress value={progressValue} className="h-1 bg-zinc-800" indicatorClassName="bg-orange-500" />
                <span className="text-[10px] text-zinc-500 font-medium">Step {currentStepIndex + 1} of {STEPS.length}</span>
              </div>

              <Button 
                size="sm" 
                onClick={handleNext}
                className={isLastStep ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white text-black hover:bg-zinc-200 px-4'}
              >
                {isLastStep ? 'Manage Fixed Costs' : 'Next →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
