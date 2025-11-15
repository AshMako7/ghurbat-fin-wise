import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const onboardingSteps = [
  {
    title: 'Note Down Expenses',
    description: 'Daily note your expenses to help manage money',
    image: '💰'
  },
  {
    title: 'Simple Money Management',
    description: 'Get your notifications or alert when you do the over expenses',
    image: '📊'
  },
  {
    title: 'Easy to Track and Analyze',
    description: 'Tracking your expense help make sure you don\'t overspend',
    image: '📈'
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/auth');
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-12">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 mt-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-primary/20 rounded" />
        </div>
        <span className="text-2xl font-bold">monex</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <span className="text-8xl">{step.image}</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-3">{step.title}</h1>
        <p className="text-muted-foreground text-center mb-8">{step.description}</p>

        <div className="flex gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <Button onClick={handleNext} className="w-full max-w-sm h-14 text-base font-semibold">
        LET'S GO
      </Button>
    </div>
  );
}
