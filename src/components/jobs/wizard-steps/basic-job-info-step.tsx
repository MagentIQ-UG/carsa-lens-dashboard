/**
 * Basic Job Information Step
 * First step of the job creation wizard for collecting basic job details
 */

'use client';

import { Building, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select } from '@/components/ui/select';
import { useCreateJob } from '@/hooks/jobs';
import { formatCurrency, formatJobType, formatJobMode, formatSeniorityLevel } from '@/lib/utils';

import { JobType, JobMode, SeniorityLevel } from '@/types/api';
import type { JobCreateRequest } from '@/types/api';
import type { WizardStepProps } from '../job-creation-wizard';

const JOB_TYPES = Object.values(JobType);
const JOB_MODES = Object.values(JobMode);
const SENIORITY_LEVELS = Object.values(SeniorityLevel);

const CURRENCIES = [
  { value: 'UGX', label: 'UGX (Ugandan Shilling)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'GBP', label: 'GBP (British Pound)' },
  { value: 'KES', label: 'KES (Kenyan Shilling)' },
  { value: 'TZS', label: 'TZS (Tanzanian Shilling)' },
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'Human Resources',
  'Legal',
  'Data Science',
  'DevOps',
  'Quality Assurance',
  'Business Development',
  'Research & Development',
];

export function BasicJobInfoStep({ 
  state, 
  onStateChange, 
  onNext, 
  canNext 
}: WizardStepProps) {
  const createJobMutation = useCreateJob();

  const [formData, setFormData] = useState<JobCreateRequest>({
    title: '',
    description: '',
    department: '',
    location: '',
    job_type: JobType.FULL_TIME,
    job_mode: JobMode.ON_SITE,
    seniority_level: SeniorityLevel.MID,
    salary_min: undefined,
    salary_max: undefined,
    salary_currency: 'UGX',
    ...state.basicJobInfo,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const previousFormDataRef = useRef<JobCreateRequest | null>(null);

  // Update form data when state changes
  useEffect(() => {
    if (state.basicJobInfo) {
      setFormData(prev => ({ ...prev, ...state.basicJobInfo }));
    }
  }, [state.basicJobInfo]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (formData.salary_min && formData.salary_max && formData.salary_min >= formData.salary_max) {
      newErrors.salary_max = 'Maximum salary must be greater than minimum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Save to state first
      onStateChange({ basicJobInfo: formData });

      // Create job if not already created
      if (!state.job) {
        const job = await createJobMutation.mutateAsync(formData);
        onStateChange({ job });
      }

      onNext();
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof JobCreateRequest, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Clear related errors
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      
      return updated;
    });
  };

  // Update parent state when formData changes
  useEffect(() => {
    // Only update if formData has actually changed from previous values
    if (JSON.stringify(formData) !== JSON.stringify(previousFormDataRef.current)) {
      previousFormDataRef.current = formData;
      onStateChange({ basicJobInfo: formData });
    }
  }, [formData]); // Remove onStateChange from dependencies to prevent infinite loop

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Basic Job Information</h2>
        <p className="text-gray-600 mt-2">
          Let's start with the essential details about this position
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              error={errors.title}
              className="w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 inline mr-1" />
              Department
            </label>
            <Select
              value={formData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="Select department"
              options={DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </label>
            <Input
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. Kampala, Uganda or Remote"
              className="w-full"
            />
          </div>

          {/* Job Type & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Job Type
              </label>
              <Select
                value={formData.job_type}
                onChange={(e) => handleChange('job_type', e.target.value as JobType)}
                options={JOB_TYPES.map(type => ({ value: type, label: formatJobType(type) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Mode
              </label>
              <Select
                value={formData.job_mode}
                onChange={(e) => handleChange('job_mode', e.target.value as JobMode)}
                options={JOB_MODES.map(mode => ({ value: mode, label: formatJobMode(mode) }))}
              />
            </div>
          </div>

          {/* Basic Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brief Description (Optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="A brief summary of the role (you can add a detailed job description in the next step)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Seniority Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Seniority Level
            </label>
            <Select
              value={formData.seniority_level}
              onChange={(e) => handleChange('seniority_level', e.target.value as SeniorityLevel)}
              options={SENIORITY_LEVELS.map(level => ({ value: level, label: formatSeniorityLevel(level) }))}
            />
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Salary Range (Optional)
            </label>
            
            {/* Currency */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Currency</label>
              <Select
                value={formData.salary_currency}
                onChange={(e) => handleChange('salary_currency', e.target.value)}
                options={CURRENCIES}
              />
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <Input
                  type="number"
                  value={formData.salary_min || ''}
                  onChange={(e) => handleChange('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <Input
                  type="number"
                  value={formData.salary_max || ''}
                  onChange={(e) => handleChange('salary_max', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full"
                  error={errors.salary_max}
                />
                {errors.salary_max && (
                  <p className="text-sm text-red-600 mt-1">{errors.salary_max}</p>
                )}
              </div>
            </div>

            {/* Salary Preview */}
            {formData.salary_min && formData.salary_max && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Salary Range:</strong> {formatCurrency(formData.salary_min, formData.salary_currency)} - {formatCurrency(formData.salary_max, formData.salary_currency)}
                </p>
              </div>
            )}
          </div>

          {/* Job Preview Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Job Preview</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-blue-800">Title:</span>{' '}
                <span className="text-blue-700">{formData.title || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Department:</span>{' '}
                <span className="text-blue-700">{formData.department || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Location:</span>{' '}
                <span className="text-blue-700">{formData.location || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Type:</span>{' '}
                <span className="text-blue-700">{formatJobType(formData.job_type)} • {formatJobMode(formData.job_mode)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Level:</span>{' '}
                <span className="text-blue-700">{formatSeniorityLevel(formData.seniority_level)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-gray-500">
          * Required fields
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!canNext || createJobMutation.isPending}
          className="min-w-[120px]"
        >
          {createJobMutation.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}

export default BasicJobInfoStep;