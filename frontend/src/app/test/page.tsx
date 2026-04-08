'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitAssessment, checkTestStatus, TestSubmission } from '@/services/testService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

// Define the questions exactly as provided
const questions = [
  {
    key: 'sleep_schedule',
    title: 'How long do you stay up?',
    options: [
      "Very early (before 10h)",
      "Some-what early (10–11h)",
      "Average (11–12h)",
      "Midnight (12–1am)",
      "Very late (Sleep after 1am)"
    ]
  },
  {
    key: 'cleanliness',
    title: 'How tidy are you?',
    options: [
      "I stay very clean and hygienic. Cannot stand dirtiness",
      "Somewhat clean",
      "Normal",
      "A bit messy",
      "Very messy as long as there’s a place to rest"
    ]
  },
  {
    key: 'noise_tolerance',
    title: 'Suppose your partner is concentrating in their work, you would:',
    options: [
      "Immediately stay silent",
      "Willing to lower your volume if pointed out",
      "Genuinely do not give a damn",
      "Hard to adapt"
    ]
  },
  {
    key: 'guest_frequency',
    title: 'Your opinion regarding inviting friends over a shared apartment:',
    options: [
      "Open-minded",
      "Only when notified in advance",
      "Hardly",
      "Hate it"
    ]
  },
  {
    key: 'budget',
    title: 'Your preferrable apartment renting expense (per person):',
    options: [
      "Under 1.5mil VND",
      "1.5-2mil VND",
      "2-3mil VND",
      "Over 3mil VND"
    ]
  },
  {
    key: 'priority',
    title: 'What do you prioritize?',
    options: [
      "Near school/workplace",
      "Cheap",
      "Peaceful",
      "Convenience",
      "Security"
    ]
  }
];

const districts = [
  "District 1", "District 3", "District 4", 
  "Binh Thanh", "District 5", "District 7", "Thu Duc"
];

export default function PersonalityTest() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Initialize State
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const init = async () => {
      try {
        const status = await checkTestStatus();
        if (status.completed) router.push('/matches'); 
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleOptionSelect = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleNext = async () => {
    if (currentStepIndex < questions.length) {
      // Move to next question
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Submit
      setSubmitting(true);
      try {
        // Ensure all fields are present (defaulting if skipped, though UI prevents skipping)
        await submitAssessment(formData as TestSubmission);
        router.push('/matches');
      } catch (error) {
        alert("Submission failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Determine if we are on the final "District" step
  const isDistrictStep = currentStepIndex === questions.length;
  const currentQuestion = questions[currentStepIndex];

  // Progress percentage
  const progress = ((currentStepIndex + 1) / (questions.length + 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="px-6 py-4 bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Logo />
          <span className="text-sm text-muted-foreground">
            {isDistrictStep ? 'Final Step' : `Question ${currentStepIndex + 1}/${questions.length}`}
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-xl overflow-hidden">
          <div className="h-1.5 bg-secondary w-full">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="p-8 md:p-12 space-y-8">
            
            {/* RENDER STANDARD QUESTIONS */}
            {!isDistrictStep && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300" key={currentStepIndex}>
                <h2 className="text-2xl font-bold">{currentQuestion.title}</h2>
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div 
                      key={option}
                      onClick={() => handleOptionSelect(currentQuestion.key, option)}
                      className={`
                        cursor-pointer p-4 rounded-xl border-2 transition-all hover:bg-secondary/50 flex items-center justify-between
                        ${formData[currentQuestion.key] === option ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50'}
                      `}
                    >
                      <span className="text-foreground">{option}</span>
                      {formData[currentQuestion.key] === option && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RENDER FINAL DISTRICT STEP */}
            {isDistrictStep && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold">Which district do you prefer?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {districts.map((d) => (
                    <div 
                      key={d}
                      onClick={() => handleOptionSelect('district', d)}
                      className={`
                        cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between
                        ${formData.district === d ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50'}
                      `}
                    >
                      <span>{d}</span>
                      {formData.district === d && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} disabled={currentStepIndex === 0} className="rounded-full px-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                onClick={handleNext} 
                className="flex-1 rounded-full text-lg"
                disabled={!isDistrictStep ? !formData[currentQuestion.key] : !formData.district || submitting}
              >
                {isDistrictStep 
                  ? (submitting ? 'Analyzing...' : 'Finish') 
                  : 'Next Question'
                }
                {!isDistrictStep && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>

          </div>
        </Card>
      </main>
    </div>
  );
}