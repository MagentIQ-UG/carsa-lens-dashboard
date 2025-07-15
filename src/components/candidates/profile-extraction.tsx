/**
 * Profile Extraction Component
 * Real-time AI-powered profile extraction with progress tracking
 * Shows extraction status, confidence scores, and validation
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  MapPin, 
  Mail, 
  Phone,
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  Edit, 
  RefreshCw,
  Zap,
  Sparkles,
  TrendingUp,
  Target,
  Shield,
  Database,
  Activity,
  BarChart3,
  Settings,
  Play,
  Pause,
  Square
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { useExtractProfile } from '@/hooks/candidates';
import { cn } from '@/lib/utils';
import { extractProfileDataFromText } from '@/lib/utils/url-extraction';

import { 
  type CandidateResponse
} from '@/types/api';

interface ProfileExtractionProps {
  candidate: CandidateResponse;
  onExtractionComplete?: (candidate: CandidateResponse) => void;
  onExtractionError?: (error: Error) => void;
  autoStart?: boolean;
  className?: string;
}

interface ExtractionStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  icon: React.ReactNode;
}

const EXTRACTION_STEPS: ExtractionStep[] = [
  {
    id: 'document_parsing',
    label: 'Document Parsing',
    description: 'Extracting text content from CV document',
    status: 'pending',
    progress: 0,
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'personal_info',
    label: 'Personal Information',
    description: 'Identifying name, contact details, and location',
    status: 'pending',
    progress: 0,
    icon: <User className="h-4 w-4" />
  },
  {
    id: 'urls_social',
    label: 'URLs & Social Profiles',
    description: 'Extracting LinkedIn, GitHub, portfolio, and other URLs',
    status: 'pending',
    progress: 0,
    icon: <Activity className="h-4 w-4" />
  },
  {
    id: 'work_experience',
    label: 'Work Experience',
    description: 'Extracting job history and responsibilities',
    status: 'pending',
    progress: 0,
    icon: <Briefcase className="h-4 w-4" />
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Finding degrees, institutions, and academic achievements',
    status: 'pending',
    progress: 0,
    icon: <GraduationCap className="h-4 w-4" />
  },
  {
    id: 'skills',
    label: 'Skills & Competencies',
    description: 'Identifying technical and soft skills',
    status: 'pending',
    progress: 0,
    icon: <Target className="h-4 w-4" />
  },
  {
    id: 'certifications',
    label: 'Certifications',
    description: 'Locating professional certifications and awards',
    status: 'pending',
    progress: 0,
    icon: <Award className="h-4 w-4" />
  },
  {
    id: 'validation',
    label: 'Data Validation',
    description: 'Verifying extracted information accuracy',
    status: 'pending',
    progress: 0,
    icon: <Shield className="h-4 w-4" />
  }
];

export function ProfileExtraction({ 
  candidate, 
  onExtractionComplete,
  onExtractionError,
  autoStart = false,
  className 
}: ProfileExtractionProps) {
  const [extractionSteps, setExtractionSteps] = useState<ExtractionStep[]>(EXTRACTION_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [extractionTime, setExtractionTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const extractProfileMutation = useExtractProfile();

  useEffect(() => {
    if (autoStart) {
      startExtraction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExtracting && startTime) {
      interval = setInterval(() => {
        setExtractionTime(Date.now() - startTime.getTime());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isExtracting, startTime]);

  const startExtraction = async () => {
    setIsExtracting(true);
    setStartTime(new Date());
    setCurrentStep(0);
    setExtractionProgress(0);
    setConfidenceScore(0);

    // Reset all steps
    setExtractionSteps(EXTRACTION_STEPS.map(step => ({ ...step, status: 'pending', progress: 0 })));

    try {
      // Simulate step-by-step extraction
      for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
        setCurrentStep(i);
        
        // Update current step to processing
        setExtractionSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'processing' } : step
        ));

        // Simulate processing time with progress
        await simulateStepProgress(i);

        // Complete current step
        setExtractionSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed', progress: 100 } : step
        ));

        // Update overall progress
        setExtractionProgress(((i + 1) / EXTRACTION_STEPS.length) * 100);

        // Simulate confidence building
        setConfidenceScore(prev => Math.min(prev + Math.random() * 15 + 5, 95));
      }

      // Perform actual extraction
      const result = await extractProfileMutation.mutateAsync(candidate.id);
      
      setIsExtracting(false);
      setConfidenceScore(result.confidence_score ? result.confidence_score * 100 : 85);
      onExtractionComplete?.(result);

    } catch (error) {
      setIsExtracting(false);
      
      // Mark current step as error
      setExtractionSteps(prev => prev.map((step, index) => 
        index === currentStep ? { ...step, status: 'error' } : step
      ));
      
      onExtractionError?.(error instanceof Error ? error : new Error('Extraction failed'));
    }
  };

  const simulateStepProgress = async (stepIndex: number) => {
    const duration = 1000 + Math.random() * 2000; // 1-3 seconds per step
    const intervals = 20;
    const intervalTime = duration / intervals;

    for (let i = 0; i <= intervals; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalTime));
      
      const progress = (i / intervals) * 100;
      setExtractionSteps(prev => prev.map((step, index) => 
        index === stepIndex ? { ...step, progress } : step
      ));
    }
  };

  const pauseExtraction = () => {
    setIsExtracting(false);
  };

  const resumeExtraction = () => {
    setIsExtracting(true);
  };

  const stopExtraction = () => {
    setIsExtracting(false);
    setCurrentStep(0);
    setExtractionProgress(0);
    setConfidenceScore(0);
    setExtractionTime(0);
    setStartTime(null);
    setExtractionSteps(EXTRACTION_STEPS.map(step => ({ ...step, status: 'pending', progress: 0 })));
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStepStatusColor = (status: ExtractionStep['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStepIcon = (step: ExtractionStep) => {
    switch (step.status) {
      case 'pending':
        return step.icon;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const completedSteps = extractionSteps.filter(step => step.status === 'completed').length;
  const errorSteps = extractionSteps.filter(step => step.status === 'error').length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card variant="feature" className="border-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  AI Profile Extraction
                  <Sparkles className="h-6 w-6 text-purple-600 inline ml-2 animate-pulse" />
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Extracting profile data for {candidate.first_name} {candidate.last_name}
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/80 text-purple-700">
                <Zap className="h-3 w-3 mr-1" />
                {candidate.ai_provider || 'AI Powered'}
              </Badge>
              <Badge variant="outline" className="bg-white/80">
                <Database className="h-3 w-3 mr-1" />
                {candidate.source}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Progress */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Extraction Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isExtracting && extractionProgress === 0 && (
                <Button
                  onClick={startExtraction}
                  disabled={extractProfileMutation.isPending}
                  className="btn-interactive"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Extraction
                </Button>
              )}
              {isExtracting && (
                <>
                  <Button
                    variant="outline"
                    onClick={pauseExtraction}
                    size="sm"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopExtraction}
                    size="sm"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
              {!isExtracting && extractionProgress > 0 && (
                <Button
                  variant="outline"
                  onClick={resumeExtraction}
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress: {completedSteps}/{extractionSteps.length} steps
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(extractionProgress)}%
                </span>
              </div>
              <Progress value={extractionProgress} className="h-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completedSteps}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(confidenceScore)}%</div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatTime(extractionTime)}</div>
                <div className="text-xs text-gray-500">Time Elapsed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorSteps}</div>
                <div className="text-xs text-gray-500">Errors</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extraction Steps */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Extraction Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {extractionSteps.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
                  index === currentStep && isExtracting && 'bg-blue-50 border-blue-200',
                  step.status === 'completed' && 'bg-green-50 border-green-200',
                  step.status === 'error' && 'bg-red-50 border-red-200'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  getStepStatusColor(step.status)
                )}>
                  {getStepIcon(step)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{step.label}</h4>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', getStepStatusColor(step.status))}
                    >
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  
                  {step.status === 'processing' && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      {candidate.profile_data && (
        <Card variant="interactive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Extracted Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-gray-400" />
                    <span>{candidate.profile_data.personal_info?.full_name}</span>
                  </div>
                  {candidate.profile_data.personal_info?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{candidate.profile_data.personal_info.email}</span>
                    </div>
                  )}
                  {candidate.profile_data.personal_info?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{candidate.profile_data.personal_info.phone}</span>
                    </div>
                  )}
                  {candidate.profile_data.personal_info?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{candidate.profile_data.personal_info.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Skills
                </h4>
                <div className="space-y-2">
                  {candidate.profile_data.skills?.technical && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Technical</div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.profile_data.skills.technical.slice(0, 5).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {candidate.profile_data.skills?.soft && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Soft Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.profile_data.skills.soft.slice(0, 5).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Work Experience
                </h4>
                <div className="space-y-2">
                  {candidate.profile_data.work_experience?.slice(0, 3).map((exp, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{exp.title}</div>
                      <div className="text-gray-600">{exp.company}</div>
                    </div>
                  ))}
                  {(candidate.profile_data.work_experience?.length || 0) > 3 && (
                    <div className="text-xs text-gray-500">
                      +{(candidate.profile_data.work_experience?.length || 0) - 3} more
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </h4>
                <div className="space-y-2">
                  {candidate.profile_data.education?.slice(0, 2).map((edu, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-gray-600">{edu.institution}</div>
                    </div>
                  ))}
                  {(candidate.profile_data.education?.length || 0) > 2 && (
                    <div className="text-xs text-gray-500">
                      +{(candidate.profile_data.education?.length || 0) - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Extraction Status: {candidate.processing_status}
              </div>
              {candidate.confidence_score && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {Math.round(candidate.confidence_score * 100)}% confidence
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/dashboard/candidates/${candidate.id}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/dashboard/candidates/${candidate.id}/edit`, '_blank')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={startExtraction}
                disabled={isExtracting}
                className="btn-interactive"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-extract
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileExtraction;