import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { FileText, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router';

interface ReportsStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  highlightElement?: string;
  position?: 'center' | 'left' | 'right';
}

const STEPS: ReportsStep[] = [
  {
    id: 'welcome_reports',
    title: 'Financial Transcripts',
    description: "Generate crystal clear PDF snapshots of your financial history for your own records or for your accountant.",
    icon: <FileText className="h-12 w-12 text-emerald-500 mx-auto mb-4" />,
    position: 'center'
  },
  {
    id: 'time_travel',
    title: 'Time Travel',
    description: "Select any historical month from the dropdown to instantly physically rebuild your exact financial state and transactions from that exact point in time.",
    highlightElement: '[data-onboarding="export-month-select"]',
    position: 'right'
  },
  {
    id: 'reports_completion',
    title: "You're Ready",
    description: "Download beautiful, scalable vector summaries of your net financial flow.",
    icon: <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />,
    position: 'center'
  }
];

export function ReportsTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/reports') {
      setIsVisible(false);
      return;
    }

    const completed = localStorage.getItem('seen_reports_tutorial');
    if (completed) return;

    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Highlighting Engine
  useEffect(() => {
    if (!isVisible) return;
    
    const currentStep = STEPS[currentStepIndex];

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
          el.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.5)'; // Emerald Glow
          el.style.borderRadius = '8px';
          el.style.backgroundColor = '#18181b'; 
          el.style.pointerEvents = 'none';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isVisible]);

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
      localStorage.setItem('seen_reports_tutorial', 'true');
      setIsVisible(false);
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
    localStorage.setItem('seen_reports_tutorial', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
      <div className="absolute inset-0 bg-black/80 pointer-events-auto transition-opacity duration-300 backdrop-blur-sm" />
      
      <div className={`relative z-[100] w-full max-w-sm mx-auto p-4 flex-1 pointer-events-none flex flex-col justify-center ${
        currentStep.position === 'right' ? 'md:ml-auto md:mr-12' : ''
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
                <Progress value={progressValue} className="h-1 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                <span className="text-[10px] text-zinc-500 font-medium">Step {currentStepIndex + 1} of {STEPS.length}</span>
              </div>

              <Button 
                size="sm" 
                onClick={handleNext}
                className={isLastStep ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white text-black hover:bg-zinc-200 px-4'}
              >
                {isLastStep ? 'Generate Report' : 'Next →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
