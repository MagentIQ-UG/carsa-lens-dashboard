/**
 * Job Creation Wizard
 * Multi-step wizard for creating jobs with AI-powered job descriptions and scorecard generation
 */

'use client';

import { CheckCircle, Upload, Wand2, FileText, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { 
  JobResponse, 
  JobDescriptionResponse, 
  JDEnhancementResponse,
  JDUploadResponse,
  ScorecardGenerationResponse,
  JobCreateRequest,
} from '@/types/api';

// Step Components (will be imported)
import { BasicJobInfoStep } from './wizard-steps/basic-job-info-step';
import { EnhancementStep } from './wizard-steps/enhancement-step';
import { EnhancedJobDescriptionStep } from './wizard-steps/enhanced-job-description-step';
import { ReviewStep } from './wizard-steps/review-step';
import { ScorecardStep } from './wizard-steps/scorecard-step';

export type WizardStep = 'basic' | 'description' | 'enhancement' | 'review' | 'scorecard' | 'complete';

export interface JobCreationState {
  // Current state
  currentStep: WizardStep;
  
  // Data
  basicJobInfo?: JobCreateRequest;
  job?: JobResponse;
  jobDescription?: JobDescriptionResponse;
  enhancementAnalysis?: JDEnhancementResponse['analysis'];
  scorecard?: ScorecardGenerationResponse['scorecard'];
  
  // Flags
  skipJobDescription: boolean;
  isGeneratingScorecard: boolean;
  hasUnsavedChanges: boolean;
  
  // Processing results
  uploadResult?: JDUploadResponse;
  enhancementResult?: JDEnhancementResponse;
}

export interface WizardStepProps {
  state: JobCreationState;
  onStateChange: (updates: Partial<JobCreationState>) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  canNext: boolean;
  canBack: boolean;
  isLastStep: boolean;
}

const WIZARD_STEPS: Array<{
  key: WizardStep;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}> = [
  {
    key: 'basic',
    title: 'Basic Information',
    description: 'Job title, department, and basic details',
    icon: FileText,
    required: true,
  },
  {
    key: 'description',
    title: 'Job Description',
    description: 'Upload, generate, or skip job description',
    icon: Upload,
    required: false,
  },
  {
    key: 'enhancement',
    title: 'Enhancement',
    description: 'AI-powered improvements and bias detection',
    icon: Wand2,
    required: false,
  },
  {
    key: 'review',
    title: 'Review & Create',
    description: 'Review all details and finalize',
    icon: CheckCircle,
    required: true,
  },
  {
    key: 'scorecard',
    title: 'Scorecard',
    description: 'Generate evaluation criteria',
    icon: Target,
    required: true,
  },
];

interface JobCreationWizardProps {
  className?: string;
  onComplete?: (job: JobResponse, scorecard?: ScorecardGenerationResponse['scorecard']) => void;
  onCancel?: () => void;
}

export function JobCreationWizard({ 
  className, 
  onComplete, 
  onCancel 
}: JobCreationWizardProps) {
  const router = useRouter();
  
  const [state, setState] = useState<JobCreationState>({
    currentStep: 'basic',
    skipJobDescription: false,
    isGeneratingScorecard: false,
    hasUnsavedChanges: false,
  });

  // State management
  const updateState = useCallback((updates: Partial<JobCreationState>) => {
    setState(prev => ({ 
      ...prev, 
      ...updates,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Navigation
  const getCurrentStepIndex = () => {
    return WIZARD_STEPS.findIndex(step => step.key === state.currentStep);
  };

  const goToStep = (step: WizardStep) => {
    updateState({ currentStep: step });
  };

  const goNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentIndex + 1];
      
      // Skip enhancement step if no job description
      if (nextStep.key === 'enhancement' && (!state.jobDescription || state.skipJobDescription)) {
        const reviewIndex = WIZARD_STEPS.findIndex(s => s.key === 'review');
        goToStep(WIZARD_STEPS[reviewIndex].key);
      } else {
        goToStep(nextStep.key);
      }
    }
  };

  const goBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      const prevStep = WIZARD_STEPS[currentIndex - 1];
      
      // Skip enhancement step if no job description when going back
      if (state.currentStep === 'review' && (!state.jobDescription || state.skipJobDescription)) {
        const descIndex = WIZARD_STEPS.findIndex(s => s.key === 'description');
        goToStep(WIZARD_STEPS[descIndex].key);
      } else {
        goToStep(prevStep.key);
      }
    }
  };

  const handleComplete = () => {
    if (state.job) {
      onComplete?.(state.job, state.scorecard);
      router.push(`/dashboard/jobs/${state.job.id}`);
    }
  };

  const handleCancel = () => {
    if (state.hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    
    onCancel?.();
    router.push('/dashboard/jobs');
  };

  // Calculate progress
  const getProgress = () => {
    const currentIndex = getCurrentStepIndex();
    const totalSteps = WIZARD_STEPS.length;
    return ((currentIndex + 1) / totalSteps) * 100;
  };

  // Step validation
  const canProceed = () => {
    switch (state.currentStep) {
      case 'basic':
        return !!state.basicJobInfo?.title; // Only require basic job info, job will be created on continue
      case 'description':
        return true; // Optional step
      case 'enhancement':
        return true; // Optional step
      case 'review':
        return !!state.job;
      case 'scorecard':
        return !!state.scorecard;
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return getCurrentStepIndex() > 0;
  };

  const isLastStep = () => {
    return state.currentStep === 'scorecard';
  };

  // Render current step
  const renderCurrentStep = () => {
    const stepProps: WizardStepProps = {
      state,
      onStateChange: updateState,
      onNext: goNext,
      onBack: goBack,
      onComplete: handleComplete,
      canNext: canProceed(),
      canBack: canGoBack(),
      isLastStep: isLastStep(),
    };

    switch (state.currentStep) {
      case 'basic':
        return <BasicJobInfoStep {...stepProps} />;
      case 'description':
        return <EnhancedJobDescriptionStep {...stepProps} />;
      case 'enhancement':
        return <EnhancementStep {...stepProps} />;
      case 'review':
        return <ReviewStep {...stepProps} />;
      case 'scorecard':
        return <ScorecardStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-6xl mx-auto space-y-8', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600 mt-1">
            Follow the steps to create a comprehensive job posting with AI assistance
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Step {getCurrentStepIndex() + 1} of {WIZARD_STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(getProgress())}% Complete
          </span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const currentIndex = getCurrentStepIndex();
          const isActive = step.key === state.currentStep;
          const isCompleted = index < currentIndex;
          const isAccessible = index <= currentIndex;
          
          // Skip enhancement step in navigation if no JD
          if (step.key === 'enhancement' && (!state.jobDescription || state.skipJobDescription)) {
            return null;
          }

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => isAccessible ? goToStep(step.key) : undefined}
                disabled={!isAccessible}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg transition-colors',
                  isActive && 'bg-blue-50 border border-blue-200',
                  isCompleted && 'bg-green-50',
                  !isAccessible && 'opacity-50 cursor-not-allowed',
                  isAccessible && !isActive && 'hover:bg-gray-50'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  isActive && 'bg-blue-600 text-white',
                  isCompleted && 'bg-green-600 text-white',
                  !isActive && !isCompleted && 'bg-gray-200 text-gray-600'
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="text-left">
                  <div className={cn(
                    'text-sm font-medium',
                    isActive && 'text-blue-900',
                    isCompleted && 'text-green-900',
                    !isActive && !isCompleted && 'text-gray-700'
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
              </button>
              
              {index < WIZARD_STEPS.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Content */}
      <Card className="min-h-[600px]">
        <CardContent className="p-8">
          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  );
}

export default JobCreationWizard;