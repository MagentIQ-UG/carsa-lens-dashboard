/**
 * Review Step
 * Final review and editing step before creating the job
 */

'use client';

import { Edit3, Save, Calendar, MapPin, Building, DollarSign, Users, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select } from '@/components/ui/select';
import { DocumentReviewContainer } from '@/components/ui/document-review-container';
import { DocumentEditor } from '@/components/ui/document-editor';
import { DocumentViewer } from '@/components/ui/document-viewer';

import { useUpdateJob } from '@/hooks/jobs';
import { formatCurrency, formatJobType, formatJobMode, formatSeniorityLevel } from '@/lib/utils';

import { JobType, JobMode, SeniorityLevel } from '@/types/api';
import type { JobCreateRequest } from '@/types/api';
import type { WizardStepProps } from '../job-creation-wizard';

const JOB_TYPES = Object.values(JobType);
const JOB_MODES = Object.values(JobMode);
const SENIORITY_LEVELS = Object.values(SeniorityLevel);

export function ReviewStep({ 
  state, 
  onStateChange, 
  onNext, 
  onBack,
  canBack: _canBack
}: WizardStepProps) {
  const updateJobMutation = useUpdateJob();

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorContent, setEditorContent] = useState(state.jobDescription?.content || '');

  const [editedJobData, setEditedJobData] = useState<JobCreateRequest>({
    title: state.job?.title || '',
    description: state.job?.description || '',
    department: state.job?.department || '',
    location: state.job?.location || '',
    job_type: state.job?.job_type || JobType.FULL_TIME,
    job_mode: state.job?.job_mode || JobMode.ON_SITE,
    seniority_level: state.job?.seniority_level || SeniorityLevel.MID,
    salary_min: state.job?.salary_min,
    salary_max: state.job?.salary_max,
    salary_currency: state.job?.salary_currency || 'UGX',
  });

  const [editedJDContent, setEditedJDContent] = useState(state.jobDescription?.content || '');

  useEffect(() => {
    if (state.jobDescription) {
      setEditedJDContent(state.jobDescription.content);
      setEditorContent(state.jobDescription.content);
    }
  }, [state.jobDescription]);

  // Handle basic job info changes
  const handleJobDataChange = (field: keyof JobCreateRequest, value: any) => {
    setEditedJobData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Handle JD content changes (kept for potential future use)
  // const handleJDContentChange = (content: string) => {
  //   setEditedJDContent(content);
  //   setEditorContent(content);
  //   setHasUnsavedChanges(true);
  // };

  // Save basic job info changes
  const saveBasicChanges = async () => {
    if (!state.job) return;

    try {
      const updatedJob = await updateJobMutation.mutateAsync({
        jobId: state.job.id,
        data: editedJobData,
      });

      onStateChange({ job: updatedJob });
      setIsEditingBasic(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  // Save JD changes (would need a separate API call to update JD content)
  const saveJDChanges = () => {
    // For now, just update local state
    // In a real app, you'd call an API to update the job description content
    if (state.jobDescription) {
      onStateChange({
        jobDescription: {
          ...state.jobDescription,
          content: editedJDContent,
        }
      });
    }
    setIsEditingDescription(false);
    setHasUnsavedChanges(false);
  };

  // Cancel editing
  const cancelBasicEdit = () => {
    if (state.job) {
      setEditedJobData({
        title: state.job.title,
        description: state.job.description || '',
        department: state.job.department || '',
        location: state.job.location || '',
        job_type: state.job.job_type,
        job_mode: state.job.job_mode,
        seniority_level: state.job.seniority_level,
        salary_min: state.job.salary_min,
        salary_max: state.job.salary_max,
        salary_currency: state.job.salary_currency,
      });
    }
    setIsEditingBasic(false);
    setHasUnsavedChanges(false);
  };

  // const cancelJDEdit = () => {
  //   setEditedJDContent(state.jobDescription?.content || '');
  //   setIsEditingDescription(false);
  //   setHasUnsavedChanges(false);
  // };

  // Proceed to next step
  const handleContinue = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Do you want to save them before continuing?');
      if (confirmed) {
        if (isEditingBasic) {
          saveBasicChanges();
        }
        if (isEditingDescription) {
          saveJDChanges();
        }
      }
    }
    onNext();
  };

  // Save document content
  const handleSaveDocument = (content: string) => {
    setEditorContent(content);
    setEditedJDContent(content);
    if (state.jobDescription) {
      onStateChange({
        jobDescription: {
          ...state.jobDescription,
          content: content
        }
      });
    }
    setHasUnsavedChanges(false);
  };

  const documentHasChanges = editorContent !== (state.jobDescription?.content || '');

  return (
    <DocumentReviewContainer
      title="Review & Finalize"
      showProgress={true}
      currentStep={4}
      totalSteps={4}
      stepTitle="Review & Finalize"
      hasChanges={documentHasChanges || hasUnsavedChanges}
      isReadOnly={!isEditingDescription}
      isGeneratedContent={state.jobDescription?.source === 'generated'}
      onSave={() => {
        if (isEditingDescription) {
          handleSaveDocument(editorContent);
          setIsEditingDescription(false);
        } else {
          handleContinue();
        }
      }}
      onCancel={onBack}
      onEdit={() => setIsEditingDescription(!isEditingDescription)}
      metadata={{
        wordCount: editorContent ? editorContent.split(/\s+/).filter(Boolean).length : 0,
        characterCount: editorContent ? editorContent.length : 0,
        lastModified: state.jobDescription?.updated_at ? new Date(state.jobDescription.updated_at).toLocaleDateString() : undefined,
        version: state.jobDescription?.version
      }}
    >
      <div className="space-y-8">

      {/* Basic Job Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
              Basic Job Information
            </CardTitle>
            {!isEditingBasic ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingBasic(true)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelBasicEdit}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveBasicChanges}
                  disabled={updateJobMutation.isPending}
                >
                  {updateJobMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingBasic ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <Input
                    value={editedJobData.title}
                    onChange={(e) => handleJobDataChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <Input
                    value={editedJobData.department || ''}
                    onChange={(e) => handleJobDataChange('department', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    value={editedJobData.location || ''}
                    onChange={(e) => handleJobDataChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
                  <textarea
                    value={editedJobData.description || ''}
                    onChange={(e) => handleJobDataChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <Select
                      value={editedJobData.job_type}
                      onChange={(e) => handleJobDataChange('job_type', e.target.value as JobType)}
                      options={JOB_TYPES.map(type => ({ value: type, label: formatJobType(type) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                    <Select
                      value={editedJobData.job_mode}
                      onChange={(e) => handleJobDataChange('job_mode', e.target.value as JobMode)}
                      options={JOB_MODES.map(mode => ({ value: mode, label: formatJobMode(mode) }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                  <Select
                    value={editedJobData.seniority_level}
                    onChange={(e) => handleJobDataChange('seniority_level', e.target.value as SeniorityLevel)}
                    options={SENIORITY_LEVELS.map(level => ({ value: level, label: formatSeniorityLevel(level) }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                    <Input
                      type="number"
                      value={editedJobData.salary_min || ''}
                      onChange={(e) => handleJobDataChange('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                    <Input
                      type="number"
                      value={editedJobData.salary_max || ''}
                      onChange={(e) => handleJobDataChange('salary_max', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Job Title</div>
                  <div className="font-medium text-gray-900">{state.job?.title}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    Department
                  </div>
                  <div className="text-gray-900">{state.job?.department || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </div>
                  <div className="text-gray-900">{state.job?.location || 'Not specified'}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Job Type & Mode</div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">
                      {formatJobType(state.job?.job_type || JobType.FULL_TIME)}
                    </Badge>
                    <Badge outlined>
                      {formatJobMode(state.job?.job_mode || JobMode.ON_SITE)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Seniority Level
                  </div>
                  <div className="text-gray-900">
                    {formatSeniorityLevel(state.job?.seniority_level || SeniorityLevel.MID)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created
                  </div>
                  <div className="text-gray-900">
                    {state.job?.created_at ? new Date(state.job.created_at).toLocaleDateString() : 'Today'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {(state.job?.salary_min || state.job?.salary_max) && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Salary Range
                    </div>
                    <div className="text-gray-900">
                      {state.job?.salary_min && state.job?.salary_max
                        ? `${formatCurrency(state.job.salary_min, state.job.salary_currency)} - ${formatCurrency(state.job.salary_max, state.job.salary_currency)}`
                        : state.job?.salary_min
                        ? `From ${formatCurrency(state.job.salary_min, state.job.salary_currency)}`
                        : state.job?.salary_max
                        ? `Up to ${formatCurrency(state.job.salary_max, state.job.salary_currency)}`
                        : 'Not specified'
                      }
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <Badge variant="warning" outlined>
                    {state.job?.status || 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description */}
      {state.jobDescription ? (
        <div className="space-y-6">
          {/* JD Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Source</div>
              <div className="text-xs text-gray-500 capitalize">{state.jobDescription.source}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Version</div>
              <div className="text-xs text-gray-500">{state.jobDescription.version}</div>
            </div>
            {state.jobDescription.confidence_score && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Confidence</div>
                <div className="text-xs text-gray-500">
                  {Math.round(state.jobDescription.confidence_score * 100)}%
                </div>
              </div>
            )}
            {state.jobDescription.ai_provider && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">AI Provider</div>
                <div className="text-xs text-gray-500 capitalize">{state.jobDescription.ai_provider}</div>
              </div>
            )}
          </div>

          {/* Enhancement Info */}
          {state.enhancementResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-900">
                  {state.enhancementResult.analysis.clarity_score}/100
                </div>
                <div className="text-xs text-blue-700">Clarity Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-900">
                  {state.enhancementResult.analysis.bias_score}/100
                </div>
                <div className="text-xs text-blue-700">Bias Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-900">
                  {state.enhancementResult.analysis.overall_quality_score}/100
                </div>
                <div className="text-xs text-blue-700">Overall Quality</div>
              </div>
            </div>
          )}

          {/* Document Content */}
          <div className="bg-white rounded-lg border border-gray-200">
            {isEditingDescription ? (
              <DocumentEditor
                content={editorContent}
                onChange={setEditorContent}
                placeholder="Edit your job description..."
                autoFocus={true}
              />
            ) : (
              <DocumentViewer content={editorContent} />
            )}
          </div>
        </div>
      ) : state.skipJobDescription ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Description</h3>
              <p className="text-gray-600 mb-4">
                You chose to skip the job description step. You can add one later from the job management page.
              </p>
              <Badge variant="warning" outlined>
                Job Description Skipped
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Job Created</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Job Description</span>
              {state.jobDescription ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Badge outlined className="text-xs">Skipped</Badge>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">AI Enhancement</span>
              {state.enhancementResult ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Badge outlined className="text-xs">Not Applied</Badge>
              )}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Ready for Scorecard</span>
              {state.jobDescription ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning if no JD */}
      {!state.jobDescription && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Limited Functionality</h4>
              <p className="text-sm text-amber-700 mt-1">
                Without a job description, you won't be able to generate an evaluation scorecard or use AI-powered candidate matching features.
              </p>
            </div>
          </div>
        </div>
      )}

      </div>
    </DocumentReviewContainer>
  );
}

export default ReviewStep;