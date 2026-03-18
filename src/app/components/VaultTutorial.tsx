import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Receipt, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router';

interface VaultStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const STEPS: VaultStep[] = [
  {
    id: 'welcome_vault',
    title: 'Welcome to The Vault',
    description: "This is where every transaction is securely logged. Think of it as the unchangeable history of your financial choices.",
    icon: <Receipt className="h-12 w-12 text-blue-500 mx-auto mb-4" />
  },
  {
    id: 'transaction_types',
    title: 'Income vs Expenses',
    description: "Logging Income expands your Monthly Pool (and thus your Daily Spendable). Logging Expenses shrinks it. Everything is mathematically linked to the Dashboard."
  },
  {
    id: 'vault_completion',
    title: "You're Ready",
    description: "Click to clear this tutorial and start logging your real transactions. You won't see this pop-up again.",
    icon: <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
  }
];

export function VaultTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/transactions') {
      setIsVisible(false);
      return;
    }

    const completed = localStorage.getItem('seen_vault_tutorial');
    if (completed) return;

    // Small delay to ensure the page has painted before popping the modal
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isVisible) return null;

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const progressValue = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('seen_vault_tutorial', 'true');
      setIsVisible(false);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('seen_vault_tutorial', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
      <div className="absolute inset-0 bg-black/60 pointer-events-auto transition-opacity duration-300 backdrop-blur-sm" />
      
      <div className="relative z-[100] w-full max-w-sm mx-auto p-4 flex-1 pointer-events-none flex flex-col justify-center">
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
                <Progress value={progressValue} className="h-1 bg-zinc-800" indicatorClassName="bg-blue-500" />
                <span className="text-[10px] text-zinc-500 font-medium">Step {currentStepIndex + 1} of {STEPS.length}</span>
              </div>

              <Button 
                size="sm" 
                onClick={handleNext}
                className={isLastStep ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white text-black hover:bg-zinc-200 px-4'}
              >
                {isLastStep ? 'Enter Vault' : 'Next →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
