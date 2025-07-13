/**
 * Enhanced Job Description Step
 * Redesigned step with modern WYSIWYG editor and improved UX flow
 */

'use client';

import { Upload, Wand2, ArrowRight, FileText, CheckCircle, AlertCircle, Eye, Sparkles } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernDocumentContainer } from '@/components/ui/modern-document-container';
import { ProfessionalJobEditor } from '@/components/ui/professional-job-editor';

import { useUploadJobDescription, useGenerateJobDescription, useEnhanceJobDescription } from '@/hooks/jobs';
import { formatFileSize, formatJobType, formatJobMode } from '@/lib/utils';

import { JobType, JobMode, SeniorityLevel } from '@/types/api';
import type { JDGenerationRequest, JDEnhancementRequest } from '@/types/api';
import type { WizardStepProps } from '../job-creation-wizard';

type JDOption = 'upload' | 'generate' | 'manual' | 'skip';

export function EnhancedJobDescriptionStep({ 
  state, 
  onStateChange, 
  onNext, 
  onBack,
  canBack
}: WizardStepProps) {
  const uploadMutation = useUploadJobDescription();
  const generateMutation = useGenerateJobDescription();
  const enhanceMutation = useEnhanceJobDescription();

  const [selectedOption, setSelectedOption] = useState<JDOption>('generate');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState('');

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

  // Initialize editor content if job description exists
  useEffect(() => {
    if (state.jobDescription?.content) {
      setEditorContent(state.jobDescription.content);
      setShowEditor(true);
    }
  }, [state.jobDescription]);

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

      setEditorContent(result.job_description.content);
      setShowEditor(true);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
    }
  }, [state.job, uploadMutation, onStateChange]);

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
      setEditorContent(jobDescription.content);
      setShowEditor(true);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  // Enhance job description
  const handleEnhance = async () => {
    if (!state.job || !state.jobDescription) return;

    try {
      const enhancementData: JDEnhancementRequest = {
        enhancement_types: ['clarity', 'bias_detection', 'keywords'],
        custom_instructions: 'Improve clarity, detect bias, and optimize keywords for better candidate matching.',
        target_audience: 'professionals'
      };

      const result = await enhanceMutation.mutateAsync({
        jobId: state.job.id,
        jdId: state.jobDescription.id,
        data: enhancementData,
      });

      onStateChange({ 
        jobDescription: result.enhanced_description,
        enhancementResult: result
      });
      setEditorContent(result.enhanced_description.content);
    } catch (error) {
      console.error('Enhancement failed:', error);
    }
  };

  // Manual creation
  const handleManualCreation = () => {
    setEditorContent(`# ${state.job?.title || 'Job Title'}

## Job Summary
[Provide a brief overview of the role and its importance to the organization]

## Key Responsibilities
- [List primary responsibilities]
- [Add additional responsibilities as needed]

## Requirements
### Essential
- [List required qualifications]
- [Add skills and experience requirements]

### Preferred
- [List nice-to-have qualifications]
- [Add preferred skills and experience]

## What We Offer
- [List benefits and perks]
- [Add growth opportunities]
- [Include company culture highlights]

## Application Process
[Describe how candidates should apply and what to expect in the process]
`);
    setShowEditor(true);
  };

  // Save editor content
  const handleSaveContent = (content: string) => {
    setEditorContent(content);
    if (state.jobDescription) {
      onStateChange({
        jobDescription: {
          ...state.jobDescription,
          content: content
        }
      });
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

  // Continue with current content
  const handleContinue = () => {
    if (editorContent && state.job) {
      if (!state.jobDescription) {
        // Create a temporary job description object
        onStateChange({
          jobDescription: {
            id: 'temp-' + Date.now(),
            content: editorContent,
            title: state.job.title,
            source: 'manual' as const,
            version: 1,
            is_current: true,
            enhancement_applied: false,
            bias_checked: false,
            structured_data: {},
            enhancement_suggestions: [],
            bias_flags: [],
            keyword_suggestions: [],
            job_id: state.job.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        });
      }
    }
    onNext();
  };

  // Validate generation form
  const canGenerate = () => {
    return generationForm.key_responsibilities.some(r => r.trim()) ||
           generationForm.required_skills.some(s => s.trim());
  };

  if (showEditor) {
    return (
      <ModernDocumentContainer
        title="Job Description"
        showProgress={true}
        currentStep={2}
        totalSteps={4}
        stepTitle="Job Description Creation"
        hasChanges={editorContent !== (state.jobDescription?.content || '')}
        isReadOnly={!isEditing}
        isGeneratedContent={state.jobDescription?.source === 'generated'}
        onSave={() => {
          if (isEditing) {
            handleSaveContent(editorContent);
            setIsEditing(false);
          } else {
            handleContinue();
          }
        }}
        onCancel={() => setShowEditor(false)}
        onEdit={() => setIsEditing(!isEditing)}
        onEnhance={state.jobDescription ? handleEnhance : undefined}
        enhanceLoading={enhanceMutation.isPending}
        metadata={{
          wordCount: editorContent ? editorContent.split(/\s+/).filter(Boolean).length : 0,
          characterCount: editorContent ? editorContent.length : 0,
          lastModified: state.jobDescription?.updated_at ? new Date(state.jobDescription.updated_at).toLocaleDateString() : undefined,
          version: state.jobDescription?.version,
          qualityScore: state.enhancementResult?.analysis?.overall_quality_score
        }}
      >
        <ProfessionalJobEditor
          content={editorContent}
          onChange={setEditorContent}
          onSave={() => {
            handleSaveContent(editorContent);
            if (isEditing) setIsEditing(false);
          }}
          onCancel={() => setShowEditor(false)}
          onEnhance={state.jobDescription ? handleEnhance : undefined}
          title="Job Description"
          placeholder="Write a comprehensive job description..."
          readOnly={!isEditing}
          enhanceLoading={enhanceMutation.isPending}
          isGeneratedContent={state.jobDescription?.source === 'generated'}
          hasChanges={editorContent !== (state.jobDescription?.content || '')}
          autoFocus={isEditing}
        />
        
        {/* Enhancement Results Banner */}
        {state.enhancementResult && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-2">Enhancement Applied!</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Clarity Score:</span>
                    <div className="text-green-800">{Math.round(state.enhancementResult.analysis.clarity_score)}%</div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Bias Score:</span>
                    <div className="text-green-800">{Math.round(state.enhancementResult.analysis.bias_score)}%</div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Quality Score:</span>
                    <div className="text-green-800">{Math.round(state.enhancementResult.analysis.overall_quality_score)}%</div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Improvements:</span>
                    <div className="text-green-800">{state.enhancementResult.analysis.enhancement_suggestions_count}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModernDocumentContainer>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Job Description</h2>
        <p className="text-gray-600 mt-2">
          Choose how you'd like to create your job description. You can always edit and enhance it later with AI assistance.
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* AI Generation Option */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedOption === 'generate' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedOption('generate')}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${selectedOption === 'generate' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Wand2 className={`h-6 w-6 ${selectedOption === 'generate' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <CardTitle className="text-lg">AI Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center mb-3">
              Let our AI create a comprehensive job description based on your requirements
            </p>
            <div className="text-xs text-blue-600 text-center font-medium">
              ✨ Recommended for best results
            </div>
          </CardContent>
        </Card>

        {/* Upload Option */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedOption === 'upload' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedOption('upload')}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${selectedOption === 'upload' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload className={`h-6 w-6 ${selectedOption === 'upload' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <CardTitle className="text-lg">Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Upload an existing job description (PDF, DOCX, TXT)
            </p>
          </CardContent>
        </Card>

        {/* Manual Creation Option */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedOption === 'manual' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedOption('manual')}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${selectedOption === 'manual' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <FileText className={`h-6 w-6 ${selectedOption === 'manual' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <CardTitle className="text-lg">Write Manually</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Start with a template and write your own job description
            </p>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedOption === 'skip' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedOption('skip')}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${selectedOption === 'skip' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <ArrowRight className={`h-6 w-6 ${selectedOption === 'skip' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <CardTitle className="text-lg">Skip for Now</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Proceed without a detailed job description
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Selected Option Content */}
      <div className="min-h-[400px]">
        {selectedOption === 'generate' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-blue-600" />
                AI Job Description Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input Fields */}
                <div className="space-y-6">
                  {/* Company Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
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
                          placeholder="Brief description of your company and culture..."
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
                              Remove
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
                        Add Responsibility
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Job Context & Skills */}
                <div className="space-y-6">
                  {/* Job Context */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Job Context</h3>
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
                              Remove
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
                        Add Required Skill
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate() || generateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  size="lg"
                >
                  {generateMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Job Description
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedOption === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Upload Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
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
                      <p className="text-lg font-medium text-gray-700">Processing your document...</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Progress: {uploadProgress}%
                      </p>
                    </div>
                  </div>
                ) : state.uploadResult ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                    <div>
                      <p className="text-xl font-medium text-green-700">Upload Successful!</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {state.uploadResult.job_description.original_filename} ({formatFileSize(state.uploadResult.storage_info.file_size)})
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => {
                          setEditorContent(state.uploadResult!.job_description.content);
                          setShowEditor(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review & Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-xl font-medium text-gray-700">
                        Drop your job description here
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        or click to browse files
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
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
            </CardContent>
          </Card>
        )}

        {selectedOption === 'manual' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Manual Creation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start with a Template</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                We'll provide you with a structured template to help you write a comprehensive job description.
              </p>
              <Button onClick={handleManualCreation} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Start Writing
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedOption === 'skip' && (
          <Card>
            <CardContent className="text-center py-12">
              <ArrowRight className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Skip Job Description</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                You can proceed without a detailed job description. You can always add one later from the job management page.
              </p>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    <strong>Note:</strong> Without a job description, you won't be able to generate an evaluation scorecard or get AI-powered candidate matching.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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

export default EnhancedJobDescriptionStep;