/**
 * Scorecard Step
 * Final step for generating AI-powered evaluation scorecard
 */

'use client';

import { Target, Wand2, CheckCircle, Eye, Download, RefreshCw, X, ChevronDown, ThumbsUp } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Modal } from '@/components/ui/modal';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ModernDocumentContainer } from '@/components/ui/modern-document-container';
import { ProfessionalJobEditor } from '@/components/ui/professional-job-editor';
import { useGenerateScorecard, useApproveScorecard, useUpdateScorecard, useScorecard } from '@/hooks/jobs';

import type { WizardStepProps } from '../job-creation-wizard';

export function ScorecardStep({ 
  state, 
  onStateChange, 
  onComplete,
  onBack,
  canBack
}: WizardStepProps) {
  const generateScorecardMutation = useGenerateScorecard();
  const approveScorecardMutation = useApproveScorecard();
  const updateScorecardMutation = useUpdateScorecard();

  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [scorecardContent, setScorecardContent] = useState('');
  const [isEditingScorecard, setIsEditingScorecard] = useState(false);
  const hasAttemptedGeneration = useRef(false);

  // Fetch detailed scorecard data when available
  const { data: detailedScorecard, isLoading: isLoadingScorecard } = useScorecard(
    state.scorecard?.id || '',
    !!state.scorecard?.id
  );

  // Generate scorecard
  const handleGenerate = useCallback(async () => {
    if (!state.job || !state.jobDescription || hasAttemptedGeneration.current) return;

    try {
      hasAttemptedGeneration.current = true;
      setIsGenerating(true);
      setGenerationProgress(10);

      const result = await generateScorecardMutation.mutateAsync({
        jobId: state.job.id,
        jdId: state.jobDescription.id,
        customInstructions: customInstructions || undefined,
      });

      setGenerationProgress(100);
      onStateChange({ scorecard: result.scorecard });
      
      // Generate markdown content for the scorecard
      const markdownContent = generateScorecardMarkdown(result);
      setScorecardContent(markdownContent);
    } catch (error) {
      console.error('Scorecard generation failed:', error);
      hasAttemptedGeneration.current = false; // Reset on error to allow retry
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.job, state.jobDescription, customInstructions, generateScorecardMutation, onStateChange]);

  // Auto-start generation if we have a job description (only once)
  useEffect(() => {
    if (state.jobDescription && !state.scorecard && !isGenerating && !hasAttemptedGeneration.current) {
      // Add a small delay to prevent race conditions
      const timer = setTimeout(() => {
        handleGenerate();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.jobDescription, state.scorecard, isGenerating, handleGenerate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDownloadMenu(false);
    };

    if (showDownloadMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDownloadMenu]);

  // Simulate progress for better UX
  useEffect(() => {
    if (isGenerating && generationProgress < 90) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + Math.random() * 10, 90));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating, generationProgress]);

  // Generate scorecard markdown content
  const generateScorecardMarkdown = (result?: any) => {
    if (!state.job || !state.scorecard) return '';

    // Use detailed scorecard data if available, otherwise fall back to result
    const scorecard = detailedScorecard || state.scorecard;
    const criteria = detailedScorecard?.criteria || result?.criteria_summary || [];

    let markdown = `# ${scorecard.name}\n\n`;
    
    // Approval status
    if (scorecard.is_approved !== undefined) {
      markdown += `> **Status:** ${scorecard.is_approved ? '✅ Approved' : '⏳ Pending Approval'}\n\n`;
    }
    
    markdown += `## Job Information\n\n`;
    markdown += `**Position:** ${state.job.title}\n`;
    markdown += `**Department:** ${state.job.department}\n`;
    markdown += `**Location:** ${state.job.location}\n\n`;
    
    markdown += `## Scorecard Overview\n\n`;
    markdown += `- **Total Criteria:** ${scorecard.criteria_count || criteria.length}\n`;
    markdown += `- **Total Weight:** ${scorecard.total_weight}\n`;
    markdown += `- **Status:** ${scorecard.is_active ? 'Active' : 'Draft'}\n`;
    markdown += `- **AI Generated:** ${scorecard.ai_generated ? 'Yes' : 'No'}\n`;
    if (scorecard.ai_provider) {
      markdown += `- **AI Provider:** ${scorecard.ai_provider}\n`;
    }
    if (scorecard.passing_score) {
      markdown += `- **Passing Score:** ${scorecard.passing_score}\n`;
    }
    markdown += `- **Created:** ${new Date(scorecard.created_at).toLocaleDateString()}\n\n`;

    if (scorecard.description) {
      markdown += `## Description\n\n${scorecard.description}\n\n`;
    }

    if (criteria && criteria.length > 0) {
      markdown += `## Evaluation Criteria\n\n`;
      criteria.forEach((criterion: any, index: number) => {
        markdown += `### ${index + 1}. ${criterion.name || criterion.criterion}\n\n`;
        
        if (criterion.description) {
          markdown += `${criterion.description}\n\n`;
        }
        
        markdown += `**Details:**\n`;
        if (criterion.category) markdown += `- **Category:** ${criterion.category}\n`;
        if (criterion.importance) markdown += `- **Importance:** ${criterion.importance}\n`;
        if (criterion.weight !== undefined) markdown += `- **Weight:** ${criterion.weight}\n`;
        if (criterion.max_score !== undefined) markdown += `- **Max Score:** ${criterion.max_score}\n`;
        if (criterion.min_score !== undefined) markdown += `- **Min Score:** ${criterion.min_score}\n`;
        
        if (criterion.skills && criterion.skills.length > 0) {
          markdown += `- **Required Skills:** ${criterion.skills.join(', ')}\n`;
        }
        
        markdown += `\n`;
        
        if (criterion.evaluation_guide) {
          markdown += `**Evaluation Guide:**\n${criterion.evaluation_guide}\n\n`;
        }
      });
    }

    markdown += `## Instructions for Use\n\n`;
    markdown += `1. **Review each criterion** carefully to understand what is being evaluated\n`;
    markdown += `2. **Score candidates** according to the defined scale for each criterion\n`;
    markdown += `3. **Provide evidence** for each score to support your evaluation\n`;
    markdown += `4. **Consider the weight** of each criterion in the final decision\n`;
    markdown += `5. **Use the evaluation guide** to ensure consistent scoring\n\n`;
    
    if (scorecard.passing_score) {
      markdown += `**Note:** Candidates must achieve a minimum score of ${scorecard.passing_score} to be considered for this position.\n\n`;
    }
    
    markdown += `---\n`;
    markdown += `*Generated by CARSA Lens Dashboard*\n`;
    markdown += `*Last updated: ${new Date().toLocaleDateString()}*\n`;

    return markdown;
  };

  // Handle scorecard preview
  const handlePreview = () => {
    // Generate current markdown content if not already generated
    if (!scorecardContent && state.scorecard && generateScorecardMutation.data) {
      const markdownContent = generateScorecardMarkdown(generateScorecardMutation.data);
      setScorecardContent(markdownContent);
    }
    setShowPreviewModal(true);
  };

  // Handle scorecard approval
  const handleApprove = async () => {
    if (!state.scorecard) return;

    try {
      await approveScorecardMutation.mutateAsync({
        scorecardId: state.scorecard.id,
        action: 'approve',
        comment: 'Approved via dashboard'
      });
      alert('Scorecard approved successfully!');
    } catch (error) {
      console.error('Failed to approve scorecard:', error);
      console.error('Full approval error object:', error);
      console.error('Approval error details:', {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        config: (error as any)?.config
      });
      
      // Show user-friendly error message
      alert(`Failed to approve scorecard: ${(error as any)?.response?.data?.message || 'Unknown error'}`);
    }
  };

  // Handle scorecard content save
  const handleSaveContent = async (content: string) => {
    if (!state.scorecard || !detailedScorecard || !content.trim()) return;

    try {
      // Parse markdown content to extract any changes to name or description
      // For now, we'll extract the title (first H1) as potential name changes
      const lines = content.split('\n');
      const titleLine = lines.find(line => line.startsWith('# '));
      const extractedName = titleLine ? titleLine.replace('# ', '').trim() : state.scorecard.name;
      
      // Find description section (content between "## Description" and next "##")
      const descriptionStartIndex = lines.findIndex(line => line.trim() === '## Description');
      let extractedDescription = detailedScorecard.description || '';
      
      if (descriptionStartIndex !== -1) {
        const descriptionEndIndex = lines.findIndex((line, index) => 
          index > descriptionStartIndex && line.startsWith('##')
        );
        const descriptionLines = lines.slice(
          descriptionStartIndex + 1, 
          descriptionEndIndex === -1 ? undefined : descriptionEndIndex
        );
        extractedDescription = descriptionLines
          .filter(line => line.trim() !== '')
          .join('\n')
          .trim();
      }

      // Parse passing score from the content
      let extractedPassingScore = detailedScorecard.passing_score;
      
      // Look for passing score in overview section: "- **Passing Score:** 75"
      const passingScoreLine = lines.find(line => line.includes('**Passing Score:**'));
      if (passingScoreLine) {
        const scoreMatch = passingScoreLine.match(/\*\*Passing Score:\*\*\s*(\d+)/);
        if (scoreMatch) {
          const parsedScore = parseInt(scoreMatch[1], 10);
          // Validate passing score is within bounds (0-100)
          if (parsedScore >= 0 && parsedScore <= 100) {
            extractedPassingScore = parsedScore;
          }
        }
      }
      
      // Also check the note section: "Candidates must achieve a minimum score of 75"
      if (!passingScoreLine) {
        const noteLine = lines.find(line => line.includes('minimum score of') && line.includes('to be considered'));
        if (noteLine) {
          const scoreMatch = noteLine.match(/minimum score of (\d+)/);
          if (scoreMatch) {
            const parsedScore = parseInt(scoreMatch[1], 10);
            // Validate passing score is within bounds (0-100)
            if (parsedScore >= 0 && parsedScore <= 100) {
              extractedPassingScore = parsedScore;
            }
          }
        }
      }

      // Parse criteria section for any updates
      const criteriaStartIndex = lines.findIndex(line => line.trim() === '## Evaluation Criteria');
      const updatedCriteria = [...(detailedScorecard.criteria || [])];
      
      if (criteriaStartIndex !== -1) {
        const criteriaEndIndex = lines.findIndex((line, index) => 
          index > criteriaStartIndex && line.startsWith('## ') && !line.startsWith('### ')
        );
        const criteriaSection = lines.slice(
          criteriaStartIndex + 1, 
          criteriaEndIndex === -1 ? undefined : criteriaEndIndex
        );
        
        // Parse individual criteria (looking for ### headers)
        let currentCriterionIndex = -1;
        for (let i = 0; i < criteriaSection.length; i++) {
          const line = criteriaSection[i];
          
          // Match criterion headers like "### 1. Technical Skills"
          const criterionMatch = line.match(/^### \d+\.\s*(.+)$/);
          if (criterionMatch) {
            currentCriterionIndex++;
            const criterionName = criterionMatch[1].trim();
            
            // Update the corresponding criterion name if it exists
            if (updatedCriteria[currentCriterionIndex]) {
              updatedCriteria[currentCriterionIndex] = {
                ...updatedCriteria[currentCriterionIndex],
                name: criterionName,
                criterion_name: criterionName
              };
            }
          }
          
          // Look for description updates (content after criterion header, before next section)
          if (currentCriterionIndex >= 0 && currentCriterionIndex < updatedCriteria.length) {
            const criterion = updatedCriteria[currentCriterionIndex];
            
            // Check for description content (plain text after criterion header)
            if (!line.startsWith('###') && !line.startsWith('**') && line.trim() && 
                !line.includes('Category:') && !line.includes('Weight:') && 
                !line.includes('Importance:')) {
              
              // Update description if it's meaningful content
              if (line.length > 10 && !criterion.descriptionUpdated) {
                updatedCriteria[currentCriterionIndex] = {
                  ...criterion,
                  description: line.trim(),
                  descriptionUpdated: true
                };
              }
            }
          }
        }
      }

      // Transform criteria to match API specification using updated criteria
      const transformedCriteria = updatedCriteria.map((criterion: any) => ({
        criterion_id: criterion.id || criterion.criterion_id,
        criterion_name: criterion.name || criterion.criterion_name,
        category: criterion.category,
        description: criterion.description,
        importance: criterion.importance,
        weight: criterion.weight,
        scoring_method: criterion.scoring_method,
        user_can_edit_weight: criterion.user_can_edit_weight,
        user_can_edit_scoring: criterion.user_can_edit_scoring,
        user_can_remove: criterion.user_can_remove,
      }));

      // Calculate total weight and normalize if necessary
      const totalWeight = transformedCriteria.reduce((sum: number, criterion: any) => sum + (criterion.weight || 0), 0);
      
      // Normalize weights to ensure total doesn't exceed 100
      if (totalWeight > 100) {
        const scaleFactor = 100 / totalWeight;
        transformedCriteria.forEach((criterion: any) => {
          if (criterion.weight) {
            criterion.weight = Math.round(criterion.weight * scaleFactor);
          }
        });
      }

      // Prepare the update data according to the API specification
      const updateData = {
        name: extractedName,
        description: extractedDescription,
        criteria: transformedCriteria,
        passing_score: extractedPassingScore,
        status: detailedScorecard.status
      };

      // Debug log to verify parsing (removed to avoid console.error issues in Next.js)

      
      await updateScorecardMutation.mutateAsync({
        scorecardId: state.scorecard.id,
        data: updateData,
      });
      
      setScorecardContent(content);
      setShowPreviewModal(false);
      
      // Show success message
      alert('Scorecard updated successfully!');
    } catch (error) {
      console.error('Failed to save scorecard content:', error);
      
      // Extract meaningful error information
      const errorInfo = {
        message: (error as any)?.message || 'Unknown error',
        responseData: (error as any)?.response?.data || 'No response data',
        status: (error as any)?.response?.status || 'No status',
        statusText: (error as any)?.response?.statusText || 'No status text',
        url: (error as any)?.config?.url || 'No URL',
        method: (error as any)?.config?.method || 'No method',
        requestData: (error as any)?.config?.data || 'No request data'
      };
      
      console.error('Error details:', errorInfo);
      
      // Show user-friendly error message with more context
      const apiErrorMessage = (error as any)?.response?.data?.message || 
                             (error as any)?.response?.data?.detail || 
                             (error as any)?.message;
      
      alert(`Failed to save scorecard: ${apiErrorMessage || 'Please check the console for more details'}`);
    }
  };

  // Handle scorecard download
  const handleDownload = (format: 'txt' | 'json' = 'txt') => {
    if (!state.scorecard) return;

    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;
      
      if (format === 'json') {
        // Generate JSON format
        content = generateScorecardJSON();
        mimeType = 'application/json;charset=utf-8';
        fileExtension = 'json';
      } else {
        // Generate text format
        content = generateScorecardContent();
        mimeType = 'text/plain;charset=utf-8';
        fileExtension = 'txt';
      }
      
      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `scorecard-${state.scorecard.name.replace(/\s+/g, '-').toLowerCase()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download scorecard:', error);
    }
  };

  // Generate scorecard JSON for download
  const generateScorecardJSON = () => {
    if (!state.scorecard || !state.job) return '';

    const data = {
      scorecard: {
        id: state.scorecard.id,
        name: state.scorecard.name,
        job_id: state.job.id,
        job_title: state.job.title,
        job_department: state.job.department,
        criteria_count: state.scorecard.criteria_count,
        total_weight: state.scorecard.total_weight,
        is_active: state.scorecard.is_active,
        storage_path: state.scorecard.storage_path,
        created_at: state.scorecard.created_at,
      },
      criteria: generateScorecardMutation.data?.criteria_summary || [],
      generated_by: 'CARSA Lens Dashboard',
      exported_at: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  };

  // Generate scorecard content for download
  const generateScorecardContent = () => {
    if (!state.scorecard || !state.job) return '';

    let content = `EVALUATION SCORECARD\n`;
    content += `===================\n\n`;
    content += `Job: ${state.job.title}\n`;
    content += `Department: ${state.job.department}\n`;
    content += `Scorecard: ${state.scorecard.name}\n`;
    content += `Generated: ${new Date(state.scorecard.created_at).toLocaleString()}\n\n`;
    
    content += `SCORECARD DETAILS\n`;
    content += `-----------------\n`;
    content += `Total Criteria: ${state.scorecard.criteria_count}\n`;
    content += `Total Weight: ${state.scorecard.total_weight}\n`;
    content += `Status: ${state.scorecard.is_active ? 'Active' : 'Draft'}\n`;
    content += `Storage Path: ${state.scorecard.storage_path}\n\n`;
    
    if (generateScorecardMutation.data?.criteria_summary) {
      content += `EVALUATION CRITERIA\n`;
      content += `-------------------\n`;
      generateScorecardMutation.data.criteria_summary.forEach((criterion, index) => {
        content += `${index + 1}. ${criterion.name}\n`;
        content += `   Category: ${criterion.category}\n`;
        content += `   Importance: ${criterion.importance}\n`;
        content += `   Weight: ${criterion.weight}\n\n`;
      });
    }
    
    content += `\nGenerated by CARSA Lens Dashboard\n`;
    content += `${new Date().toISOString()}\n`;

    return content;
  };


  // Handle scorecard save
  const handleSaveScorecardContent = (content: string) => {
    setScorecardContent(content);
    handleSaveContent(content);
  };

  const scorecardHasChanges = scorecardContent !== generateScorecardMarkdown(generateScorecardMutation.data);

  // Check if we should show the document editor for the scorecard
  const showScorecardEditor = state.scorecard && !isGenerating;

  if (showScorecardEditor) {
    return (
      <ModernDocumentContainer
        title="Evaluation Scorecard"
        showProgress={true}
        currentStep={4}
        totalSteps={4}
        stepTitle="Scorecard Generation"
        hasChanges={scorecardHasChanges}
        isReadOnly={!isEditingScorecard}
        onSave={() => {
          if (isEditingScorecard) {
            handleSaveScorecardContent(scorecardContent);
            setIsEditingScorecard(false);
          } else {
            if (onComplete) onComplete();
          }
        }}
        onCancel={onBack}
        onEdit={() => setIsEditingScorecard(!isEditingScorecard)}
        metadata={{
          wordCount: scorecardContent ? scorecardContent.split(/\s+/).filter(Boolean).length : 0,
          characterCount: scorecardContent ? scorecardContent.length : 0,
          lastModified: state.scorecard?.created_at ? new Date(state.scorecard.created_at).toLocaleDateString() : undefined,
          version: 1
        }}
      >
        <div className="space-y-6">
          {/* Scorecard Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {state.scorecard?.criteria_count || 0}
              </div>
              <div className="text-sm text-gray-600">Evaluation Criteria</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {state.scorecard?.total_weight || 0}
              </div>
              <div className="text-sm text-gray-600">Total Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {state.scorecard?.is_active ? 'Active' : 'Draft'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                AI
              </div>
              <div className="text-sm text-gray-600">Generated</div>
            </div>
          </div>

          {/* Success Message */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900">Scorecard Generated Successfully!</h3>
                <p className="text-green-700 mt-1">
                  Your AI-powered evaluation scorecard is ready. Review and edit as needed.
                </p>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="bg-white rounded-lg border border-gray-200">
            <ProfessionalJobEditor
              content={scorecardContent || generateScorecardMarkdown(generateScorecardMutation.data)}
              onChange={setScorecardContent}
              placeholder="Edit your scorecard content..."
              readOnly={!isEditingScorecard}
              autoFocus={isEditingScorecard}
            />
          </div>

          {/* Scorecard Actions */}
          {!isEditingScorecard && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  hasAttemptedGeneration.current = false;
                  handleGenerate();
                }}
                className="flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload('txt')}
                className="flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveScorecardMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
              >
                {approveScorecardMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </ModernDocumentContainer>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="border-b border-gray-100">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">Evaluation Scorecard</CardTitle>
            <p className="text-gray-600 mt-2">
              {state.scorecard 
                ? 'Your AI-powered evaluation scorecard has been generated successfully!'
                : 'Generating an AI-powered evaluation scorecard based on your job description...'
              }
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0 mt-4">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-6 space-y-8 overflow-y-auto">

      {/* Generation Status */}
      {isGenerating && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 mx-auto">
                  <LoadingSpinner size="lg" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Scorecard...</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI is analyzing your job description to create evaluation criteria
                </p>
                <div className="max-w-xs mx-auto">
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {generationProgress < 30 ? 'Analyzing job requirements...' :
                     generationProgress < 60 ? 'Identifying key skills...' :
                     generationProgress < 90 ? 'Creating evaluation criteria...' :
                     'Finalizing scorecard...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Generation */}
      {!state.scorecard && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-blue-600" />
              Generate Evaluation Scorecard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Requirements Check */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Job Created</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Job Description Available</span>
                {state.jobDescription ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-xs text-red-600">Required</span>
                )}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Any specific evaluation criteria or requirements you'd like to emphasize..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., "Focus on leadership experience", "Prioritize technical certifications", etc.
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={() => {
                hasAttemptedGeneration.current = false; // Reset for manual generation
                handleGenerate();
              }}
              disabled={!state.jobDescription || generateScorecardMutation.isPending}
              className="w-full"
              size="lg"
            >
              {generateScorecardMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Scorecard
                </>
              )}
            </Button>

            {!state.jobDescription && (
              <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  A job description is required to generate an evaluation scorecard.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Scorecard */}
      {state.scorecard && (
        <div className="space-y-6">
          {/* Scorecard Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Evaluation Scorecard Generated
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <div className="relative">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDownloadMenu(!showDownloadMenu);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                    {showDownloadMenu && (
                      <div 
                        className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleDownload('txt');
                              setShowDownloadMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Text Format (.txt)
                          </button>
                          <button
                            onClick={() => {
                              handleDownload('json');
                              setShowDownloadMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            JSON Format (.json)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      hasAttemptedGeneration.current = false; // Reset for regeneration
                      handleGenerate();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {state.scorecard.criteria_count}
                  </div>
                  <div className="text-sm text-gray-600">Evaluation Criteria</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {state.scorecard.total_weight}
                  </div>
                  <div className="text-sm text-gray-600">Total Weight</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {state.scorecard.is_active ? 'Active' : 'Draft'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    AI
                  </div>
                  <div className="text-sm text-gray-600">Generated</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Scorecard Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{state.scorecard.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-gray-600">
                      {new Date(state.scorecard.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Path:</span>
                    <span className="text-xs text-gray-500 truncate max-w-48">
                      {state.scorecard.storage_path}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-green-900">Job Creation Complete!</h3>
                  <p className="text-green-700 mt-1">
                    Your job posting has been created successfully with an AI-powered evaluation scorecard. 
                    You can now start receiving and evaluating candidates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Publish Your Job</div>
                    <div className="text-sm text-gray-600">Activate the job posting to start receiving applications</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Review Evaluation Criteria</div>
                    <div className="text-sm text-gray-600">Fine-tune the generated scorecard if needed</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Start Evaluating Candidates</div>
                    <div className="text-sm text-gray-600">Use AI-powered evaluation to screen candidates efficiently</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

          </CardContent>
        </Card>
      </div>

      {/* Fixed Footer */}
      <Card className="flex-shrink-0 mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {state.scorecard ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Scorecard Ready</span>
                  </>
                ) : isGenerating ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Generating Scorecard...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Scorecard Needed</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={!canBack || isGenerating}
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Back
              </Button>
              
              {state.scorecard ? (
                <Button
                  onClick={onComplete}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm min-w-[160px]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete & View Job
                </Button>
              ) : !isGenerating && state.jobDescription ? (
                <Button
                  onClick={() => {
                    hasAttemptedGeneration.current = false;
                    handleGenerate();
                  }}
                  disabled={generateScorecardMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm min-w-[160px]"
                >
                  {generateScorecardMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Scorecard
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improved Scrollable Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        size="4xl"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Fixed Header */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Scorecard Editor</h2>
                <p className="text-sm text-gray-600 mt-1">Edit your scorecard content with our professional editor</p>
              </div>
              {state.scorecard && (
                <div className="flex items-center space-x-3">
                  <Badge variant={(detailedScorecard?.is_approved || state.scorecard.is_approved) ? 'success' : 'default'}>
                    {(detailedScorecard?.is_approved || state.scorecard.is_approved) ? 'Approved' : 'Draft'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreviewModal(false)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {state.scorecard && (
              <div className="p-6">
                {/* Loading State */}
                {isLoadingScorecard && (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-600">Loading detailed scorecard...</span>
                  </div>
                )}

                {/* Document Editor/Viewer */}
                {!isLoadingScorecard && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <ProfessionalJobEditor
                      content={scorecardContent || generateScorecardMarkdown(generateScorecardMutation.data)}
                      onChange={setScorecardContent}
                      placeholder="Edit your scorecard content..."
                      readOnly={detailedScorecard?.is_approved || state.scorecard.is_approved}
                      autoFocus={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600">
                  <div className="font-medium text-gray-900">Scorecard Status</div>
                  <div className="flex items-center space-x-3 mt-1 text-xs">
                    <span>Criteria: {state.scorecard?.criteria_count || 0}</span>
                    <span>•</span>
                    <span>Weight: {state.scorecard?.total_weight || 0}</span>
                    <span>•</span>
                    <span>{(detailedScorecard?.is_approved || state.scorecard?.is_approved) ? 'Approved' : 'Pending Approval'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Download Options */}
                <div className="relative">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDownloadMenu(!showDownloadMenu);
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                  {showDownloadMenu && (
                    <div 
                      className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleDownload('txt');
                            setShowDownloadMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Text Format (.txt)
                        </button>
                        <button
                          onClick={() => {
                            handleDownload('json');
                            setShowDownloadMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          JSON Format (.json)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Approval Button */}
                {!(detailedScorecard?.is_approved || state.scorecard?.is_approved) && (
                  <Button
                    onClick={handleApprove}
                    disabled={approveScorecardMutation.isPending || isLoadingScorecard}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    {approveScorecardMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve Scorecard
                      </>
                    )}
                  </Button>
                )}

                {(detailedScorecard?.is_approved || state.scorecard?.is_approved) && (
                  <Button 
                    onClick={() => setShowPreviewModal(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ScorecardStep;