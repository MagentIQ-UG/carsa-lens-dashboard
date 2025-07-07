/**
 * Job Description Step
 * Second step of the job creation wizard for handling job descriptions
 */

'use client';

import { Upload, Wand2, ArrowRight, FileText, Plus, Minus, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { useUploadJobDescription, useGenerateJobDescription } from '@/hooks/jobs';
import { formatFileSize, formatJobType, formatJobMode } from '@/lib/utils';

import { JobType, JobMode, SeniorityLevel } from '@/types/api';
import type { JDGenerationRequest } from '@/types/api';
import type { WizardStepProps } from '../job-creation-wizard';

type JDOption = 'upload' | 'generate' | 'skip';

export function JobDescriptionStep({ 
  state, 
  onStateChange, 
  onNext, 
  onBack,
  canBack
}: WizardStepProps) {
  const uploadMutation = useUploadJobDescription();
  const generateMutation = useGenerateJobDescription();

  const [selectedOption, setSelectedOption] = useState<JDOption>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Generation form state
  const [generationForm, setGenerationForm] = useState<JDGenerationRequest>({
    title: state.job?.title || '',
    department: state.job?.department || undefined,
    seniority_level: state.job?.seniority_level || SeniorityLevel.MID,
    job_type: state.job?.job_type || JobType.FULL_TIME,
    job_mode: state.job?.job_mode || JobMode.ON_SITE,
    location: state.job?.location || undefined,
    company_name: '',
    company_description: '',
    key_responsibilities: [''],
    required_skills: [''],
    preferred_skills: [''],
    benefits: [''],
    salary_range: state.job?.salary_min && state.job?.salary_max 
      ? `${state.job.salary_min} - ${state.job.salary_max} ${state.job.salary_currency}`
      : undefined,
    custom_instructions: '',
  });

  // File upload handling
  const handleFileUpload = useCallback(async (file: File) => {
    if (!state.job) return;

    try {
      const result = await uploadMutation.mutateAsync({
        jobId: state.job.id,
        file,
        onProgress: setUploadProgress,
      });

      onStateChange({
        jobDescription: result.job_description,
        uploadResult: result,
      });

      // Auto-proceed to next step after successful upload
      setTimeout(() => onNext(), 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
    }
  }, [state.job, uploadMutation, onStateChange, onNext]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // File input handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Generation form handlers
  const updateGenerationForm = (field: keyof JDGenerationRequest, value: any) => {
    setGenerationForm(prev => ({ ...prev, [field]: value }));
  };

  const updateListField = (field: 'key_responsibilities' | 'required_skills' | 'preferred_skills' | 'benefits', index: number, value: string) => {
    setGenerationForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addListItem = (field: 'key_responsibilities' | 'required_skills' | 'preferred_skills' | 'benefits') => {
    setGenerationForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (field: 'key_responsibilities' | 'required_skills' | 'preferred_skills' | 'benefits', index: number) => {
    setGenerationForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Generate job description
  const handleGenerate = async () => {
    if (!state.job) return;

    try {
      const jobDescription = await generateMutation.mutateAsync({
        jobId: state.job.id,
        data: generationForm,
      });

      onStateChange({ jobDescription });
      onNext();
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  // Skip job description
  const handleSkip = () => {
    onStateChange({ 
      skipJobDescription: true,
      jobDescription: undefined 
    });
    onNext();
  };

  // Validate generation form
  const canGenerate = () => {
    return generationForm.key_responsibilities.some(r => r.trim()) ||
           generationForm.required_skills.some(s => s.trim());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Job Description</h2>
        <p className="text-gray-600 mt-2">
          Choose how you'd like to create your job description. This step is optional but recommended for better candidate matching.
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Option */}
        <Card className={`cursor-pointer transition-all ${selectedOption === 'upload' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedOption('upload')}>
          <CardHeader className="text-center">
            <Upload className={`h-8 w-8 mx-auto mb-2 ${selectedOption === 'upload' ? 'text-blue-600' : 'text-gray-400'}`} />
            <CardTitle className="text-lg">Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Upload an existing job description document (PDF, DOCX, TXT)
            </p>
          </CardContent>
        </Card>

        {/* Generate Option */}
        <Card className={`cursor-pointer transition-all ${selectedOption === 'generate' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedOption('generate')}>
          <CardHeader className="text-center">
            <Wand2 className={`h-8 w-8 mx-auto mb-2 ${selectedOption === 'generate' ? 'text-blue-600' : 'text-gray-400'}`} />
            <CardTitle className="text-lg">Generate with AI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Create a comprehensive job description using AI based on your requirements
            </p>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <Card className={`cursor-pointer transition-all ${selectedOption === 'skip' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedOption('skip')}>
          <CardHeader className="text-center">
            <ArrowRight className={`h-8 w-8 mx-auto mb-2 ${selectedOption === 'skip' ? 'text-blue-600' : 'text-gray-400'}`} />
            <CardTitle className="text-lg">Skip for Now</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Proceed without a detailed job description (you can add one later)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Selected Option Content */}
      <div className="min-h-[400px]">
        {selectedOption === 'upload' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadMutation.isPending ? (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Uploading and processing...</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Progress: {uploadProgress}%
                    </p>
                  </div>
                </div>
              ) : state.uploadResult ? (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-green-700">Upload Successful!</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {state.uploadResult.job_description.original_filename} ({formatFileSize(state.uploadResult.storage_info.file_size)})
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Processing method: {state.uploadResult.processing_info.processing_method}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop your job description here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Supports PDF, DOCX, TXT files up to 10MB
                  </div>
                </div>
              )}

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadMutation.isPending}
              />
            </div>

            {/* Upload Info */}
            {state.uploadResult && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Processing Results</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Confidence Score:</span>
                    <span className="font-medium">
                      {state.uploadResult.processing_info.confidence_score 
                        ? `${Math.round(state.uploadResult.processing_info.confidence_score * 100)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  {state.uploadResult.processing_info.extraction_errors?.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center text-amber-600 mb-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Extraction Warnings:</span>
                      </div>
                      <ul className="text-xs text-amber-700 ml-5 space-y-1">
                        {state.uploadResult.processing_info.extraction_errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedOption === 'generate' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Company Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <Input
                        value={generationForm.company_name}
                        onChange={(e) => updateGenerationForm('company_name', e.target.value)}
                        placeholder="e.g. TechCorp Uganda"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Description
                      </label>
                      <textarea
                        value={generationForm.company_description}
                        onChange={(e) => updateGenerationForm('company_description', e.target.value)}
                        placeholder="Brief description of your company..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Key Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Responsibilities *
                  </label>
                  <div className="space-y-2">
                    {generationForm.key_responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={responsibility}
                          onChange={(e) => updateListField('key_responsibilities', index, e.target.value)}
                          placeholder={`Responsibility ${index + 1}`}
                          className="flex-1"
                        />
                        {generationForm.key_responsibilities.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeListItem('key_responsibilities', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addListItem('key_responsibilities')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Responsibility
                    </Button>
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills *
                  </label>
                  <div className="space-y-2">
                    {generationForm.required_skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={skill}
                          onChange={(e) => updateListField('required_skills', index, e.target.value)}
                          placeholder={`Required skill ${index + 1}`}
                          className="flex-1"
                        />
                        {generationForm.required_skills.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeListItem('required_skills', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addListItem('required_skills')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Required Skill
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Job Context (Read-only) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Job Context
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div><strong>Title:</strong> {generationForm.title}</div>
                    <div><strong>Department:</strong> {generationForm.department || 'Not specified'}</div>
                    <div><strong>Location:</strong> {generationForm.location || 'Not specified'}</div>
                    <div><strong>Type:</strong> {formatJobType(generationForm.job_type)} • {formatJobMode(generationForm.job_mode)}</div>
                    <div><strong>Level:</strong> {generationForm.seniority_level}</div>
                    {generationForm.salary_range && (
                      <div><strong>Salary:</strong> {generationForm.salary_range}</div>
                    )}
                  </div>
                </div>

                {/* Preferred Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Skills (Optional)
                  </label>
                  <div className="space-y-2">
                    {generationForm.preferred_skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={skill}
                          onChange={(e) => updateListField('preferred_skills', index, e.target.value)}
                          placeholder={`Preferred skill ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeListItem('preferred_skills', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addListItem('preferred_skills')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Preferred Skill
                    </Button>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits (Optional)
                  </label>
                  <div className="space-y-2">
                    {generationForm.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={benefit}
                          onChange={(e) => updateListField('benefits', index, e.target.value)}
                          placeholder={`Benefit ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeListItem('benefits', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addListItem('benefits')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Benefit
                    </Button>
                  </div>
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Instructions (Optional)
                  </label>
                  <textarea
                    value={generationForm.custom_instructions}
                    onChange={(e) => updateGenerationForm('custom_instructions', e.target.value)}
                    placeholder="Any specific requirements or instructions for the AI..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedOption === 'skip' && (
          <div className="text-center py-16">
            <ArrowRight className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Skip Job Description</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You can proceed without a detailed job description. You can always add one later from the job management page.
            </p>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> Without a job description, you won't be able to generate an evaluation scorecard or get AI-powered candidate matching.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canBack}
        >
          Back
        </Button>

        <div className="flex space-x-3">
          {selectedOption === 'upload' && state.uploadResult && (
            <Button onClick={onNext}>
              Continue with Uploaded JD
            </Button>
          )}
          
          {selectedOption === 'generate' && (
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate() || generateMutation.isPending}
              className="min-w-[120px]"
            >
              {generateMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Generate & Continue'
              )}
            </Button>
          )}
          
          {selectedOption === 'skip' && (
            <Button onClick={handleSkip} variant="outline">
              Skip & Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDescriptionStep;