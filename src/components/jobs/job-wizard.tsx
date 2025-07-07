/**
 * JobWizard Component
 * Multi-step job creation wizard with validation and progress tracking
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Briefcase,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useCreateJob } from '@/hooks/jobs';
import { cn } from '@/lib/utils';
import {
  JobCreateRequest,
  JobResponse,
  JobType,
  JobMode,
  SeniorityLevel,
} from '@/types/api';

// Validation schema
const jobWizardSchema = z.object({
  // Step 1: Basic Information
  title: z.string().min(3, 'Job title must be at least 3 characters').max(100, 'Job title is too long'),
  department: z.string().min(2, 'Department is required').max(50, 'Department name is too long'),
  location: z.string().min(2, 'Location is required').max(100, 'Location is too long'),
  job_type: z.nativeEnum(JobType),
  job_mode: z.nativeEnum(JobMode),
  seniority_level: z.nativeEnum(SeniorityLevel),
  
  // Step 2: Compensation
  salary_min: z.number().min(0, 'Minimum salary must be positive').optional(),
  salary_max: z.number().min(0, 'Maximum salary must be positive').optional(),
  salary_currency: z.string().default('USD'),
  
  // Step 3: Requirements & Responsibilities (will be included in description)
  requirements: z.array(z.string().min(1, 'Requirement cannot be empty')).min(1, 'At least one requirement is needed'),
  responsibilities: z.array(z.string().min(1, 'Responsibility cannot be empty')).min(1, 'At least one responsibility is needed'),
  benefits: z.array(z.string().min(1, 'Benefit cannot be empty')).optional(),
  
  // Step 4: Description
  description: z.string().min(50, 'Description must be at least 50 characters').optional(),
}).refine((data) => {
  if (data.salary_min && data.salary_max) {
    return data.salary_max >= data.salary_min;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_max'],
});

type JobWizardFormData = z.infer<typeof jobWizardSchema>;

interface JobWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (job: JobResponse) => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Job title, department, and work details',
    icon: Briefcase,
  },
  {
    id: 2,
    title: 'Compensation',
    description: 'Salary range and currency',
    icon: DollarSign,
  },
  {
    id: 3,
    title: 'Requirements',
    description: 'Skills, responsibilities, and benefits',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Review & Create',
    description: 'Final review and job creation',
    icon: CheckCircle,
  },
];

const JOB_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: 'Full-time' },
  { value: JobType.PART_TIME, label: 'Part-time' },
  { value: JobType.CONTRACT, label: 'Contract' },
  { value: JobType.TEMPORARY, label: 'Temporary' },
  { value: JobType.INTERNSHIP, label: 'Internship' },
  { value: JobType.FREELANCE, label: 'Freelance' },
];

const JOB_MODE_OPTIONS = [
  { value: JobMode.ON_SITE, label: 'On-site' },
  { value: JobMode.REMOTE, label: 'Remote' },
  { value: JobMode.HYBRID, label: 'Hybrid' },
];

const SENIORITY_OPTIONS = [
  { value: SeniorityLevel.ENTRY, label: 'Entry Level' },
  { value: SeniorityLevel.JUNIOR, label: 'Junior' },
  { value: SeniorityLevel.MID, label: 'Mid-level' },
  { value: SeniorityLevel.SENIOR, label: 'Senior' },
  { value: SeniorityLevel.LEAD, label: 'Lead' },
  { value: SeniorityLevel.PRINCIPAL, label: 'Principal' },
  { value: SeniorityLevel.EXECUTIVE, label: 'Executive' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

export function JobWizard({ isOpen, onClose, onSuccess }: JobWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const createJobMutation = useCreateJob();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    trigger,
    reset,
  } = useForm<JobWizardFormData>({
    resolver: zodResolver(jobWizardSchema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      job_type: JobType.FULL_TIME,
      job_mode: JobMode.ON_SITE,
      seniority_level: SeniorityLevel.MID,
      salary_currency: 'USD',
      requirements: [''],
      responsibilities: [''],
      benefits: [''],
      description: '',
    },
    mode: 'onChange',
  });

  const watchedRequirements = watch('requirements');
  const watchedResponsibilities = watch('responsibilities');
  const watchedBenefits = watch('benefits');

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    onClose();
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof JobWizardFormData)[] => {
    switch (step) {
      case 1:
        return ['title', 'department', 'location', 'job_type', 'job_mode', 'seniority_level'];
      case 2:
        // Only validate salary_currency as it's required, salary_min and salary_max are optional
        return ['salary_currency'];
      case 3:
        return ['requirements', 'responsibilities'];
      case 4:
        // Description is optional, no validation needed
        return [];
      default:
        return [];
    }
  };

  const addListItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    const currentValues = getValues(field) || [];
    setValue(field, [...currentValues, '']);
  };

  const removeListItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    const currentValues = getValues(field) || [];
    setValue(field, currentValues.filter((_, i) => i !== index));
  };

  const updateListItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    const currentValues = getValues(field) || [];
    const newValues = [...currentValues];
    newValues[index] = value;
    setValue(field, newValues);
  };

  const onSubmit = async (data: JobWizardFormData) => {
    try {
      // Generate a comprehensive job description from the form data
      const cleanRequirements = data.requirements.filter(req => req.trim() !== '');
      const cleanResponsibilities = data.responsibilities.filter(resp => resp.trim() !== '');
      const cleanBenefits = data.benefits?.filter(benefit => benefit.trim() !== '') || [];

      // Create a structured job description if none was provided
      let jobDescription = data.description || '';
      if (!jobDescription && (cleanRequirements.length > 0 || cleanResponsibilities.length > 0)) {
        jobDescription = `## Job Summary\n\n${data.title} position in ${data.department} at ${data.location}.`;
        
        if (cleanResponsibilities.length > 0) {
          jobDescription += `\n\n## Key Responsibilities\n\n${cleanResponsibilities.map(resp => `• ${resp}`).join('\n')}`;
        }
        
        if (cleanRequirements.length > 0) {
          jobDescription += `\n\n## Requirements\n\n${cleanRequirements.map(req => `• ${req}`).join('\n')}`;
        }
        
        if (cleanBenefits.length > 0) {
          jobDescription += `\n\n## Benefits\n\n${cleanBenefits.map(benefit => `• ${benefit}`).join('\n')}`;
        }
      }

      // Prepare the request data according to backend API schema
      const requestData: JobCreateRequest = {
        title: data.title,
        department: data.department,
        location: data.location,
        job_type: data.job_type,
        job_mode: data.job_mode,
        seniority_level: data.seniority_level,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        salary_currency: data.salary_currency,
        description: jobDescription,
      };

      const result = await createJobMutation.mutateAsync(requestData);
      onSuccess?.(result);
      handleClose();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. Senior Frontend Developer"
                      error={errors.title?.message}
                    />
                  )}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. Engineering"
                      error={errors.department?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g. San Francisco, CA or Remote"
                    error={errors.location?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <Controller
                  name="job_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={errors.job_type?.message}
                      options={JOB_TYPE_OPTIONS}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Mode *
                </label>
                <Controller
                  name="job_mode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={errors.job_mode?.message}
                      options={JOB_MODE_OPTIONS}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seniority Level *
                </label>
                <Controller
                  name="seniority_level"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={errors.seniority_level?.message}
                      options={SENIORITY_OPTIONS}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <DollarSign className="h-4 w-4" />
              <span>Salary information is optional but recommended for better candidate attraction</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Controller
                  name="salary_currency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      options={CURRENCY_OPTIONS}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <Controller
                  name="salary_min"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g. 80000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      error={errors.salary_min?.message}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <Controller
                  name="salary_max"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g. 120000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      error={errors.salary_max?.message}
                    />
                  )}
                />
              </div>
            </div>

            {errors.salary_max && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.salary_max.message}</span>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements *
              </label>
              <div className="space-y-2">
                {watchedRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={requirement}
                      onChange={(e) => updateListItem('requirements', index, e.target.value)}
                      placeholder="e.g. 5+ years of React experience"
                      className="flex-1"
                    />
                    {watchedRequirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem('requirements', index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem('requirements')}
                >
                  Add Requirement
                </Button>
              </div>
              {errors.requirements && (
                <p className="text-sm text-red-600 mt-1">{errors.requirements.message}</p>
              )}
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities *
              </label>
              <div className="space-y-2">
                {watchedResponsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={responsibility}
                      onChange={(e) => updateListItem('responsibilities', index, e.target.value)}
                      placeholder="e.g. Lead frontend development initiatives"
                      className="flex-1"
                    />
                    {watchedResponsibilities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem('responsibilities', index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem('responsibilities')}
                >
                  Add Responsibility
                </Button>
              </div>
              {errors.responsibilities && (
                <p className="text-sm text-red-600 mt-1">{errors.responsibilities.message}</p>
              )}
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits (Optional)
              </label>
              <div className="space-y-2">
                {(watchedBenefits || []).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateListItem('benefits', index, e.target.value)}
                      placeholder="e.g. Health insurance, flexible hours"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem('benefits', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem('benefits')}
                >
                  Add Benefit
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        const formData = getValues();
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (Optional)
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a detailed job description or leave empty to generate one later using AI..."
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Review Summary */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Review Job Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Title:</span>
                    <p className="text-gray-900">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Department:</span>
                    <p className="text-gray-900">{formData.department}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <p className="text-gray-900">{formData.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <p className="text-gray-900">
                      {JOB_TYPE_OPTIONS.find(opt => opt.value === formData.job_type)?.label} • {' '}
                      {JOB_MODE_OPTIONS.find(opt => opt.value === formData.job_mode)?.label} • {' '}
                      {SENIORITY_OPTIONS.find(opt => opt.value === formData.seniority_level)?.label}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(formData.salary_min || formData.salary_max) && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Salary:</span>
                      <p className="text-gray-900">
                        {formData.salary_currency} {formData.salary_min?.toLocaleString()} - {formData.salary_max?.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Requirements:</span>
                    <p className="text-gray-900">{formData.requirements.filter(r => r.trim()).length} items</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Responsibilities:</span>
                    <p className="text-gray-900">{formData.responsibilities.filter(r => r.trim()).length} items</p>
                  </div>
                  {formData.benefits && formData.benefits.filter(b => b.trim()).length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Benefits:</span>
                      <p className="text-gray-900">{formData.benefits.filter(b => b.trim()).length} items</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      showCloseButton={true}
    >
      <div className="px-6 py-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Job</h2>
          <p className="text-gray-600">Follow the steps to create a comprehensive job posting</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-blue-600' : 'text-gray-500'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 max-w-24">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    'w-16 h-0.5 mx-4 transition-colors',
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="min-h-96">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Step {currentStep}: {STEPS[currentStep - 1].title}
              </h3>
              <p className="text-sm text-gray-600">
                {STEPS[currentStep - 1].description}
              </p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
              >
                Cancel
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={createJobMutation.isPending}
                  disabled={!isValid}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default JobWizard;