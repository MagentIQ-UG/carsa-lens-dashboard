/**
 * Scorecard Step
 * Final step for generating AI-powered evaluation scorecard
 */

'use client';

import { Target, Wand2, CheckCircle, Eye, Download, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { useGenerateScorecard } from '@/hooks/jobs';

import type { WizardStepProps } from '../job-creation-wizard';

export function ScorecardStep({ 
  state, 
  onStateChange, 
  onComplete,
  onBack,
  canBack
}: WizardStepProps) {
  const generateScorecardMutation = useGenerateScorecard();

  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Generate scorecard
  const handleGenerate = useCallback(async () => {
    if (!state.job || !state.jobDescription) return;

    try {
      setIsGenerating(true);
      setGenerationProgress(10);

      const result = await generateScorecardMutation.mutateAsync({
        jobId: state.job.id,
        jdId: state.jobDescription.id,
        customInstructions: customInstructions || undefined,
      });

      setGenerationProgress(100);
      onStateChange({ scorecard: result.scorecard });
    } catch (error) {
      console.error('Scorecard generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [state.job, state.jobDescription, customInstructions, generateScorecardMutation, onStateChange]);

  // Auto-start generation if we have a job description
  useEffect(() => {
    if (state.jobDescription && !state.scorecard && !isGenerating) {
      handleGenerate();
    }
  }, [state.jobDescription, state.scorecard, isGenerating, handleGenerate]);

  // Simulate progress for better UX
  useEffect(() => {
    if (isGenerating && generationProgress < 90) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + Math.random() * 10, 90));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating, generationProgress]);


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Evaluation Scorecard</h2>
        <p className="text-gray-600 mt-2">
          {state.scorecard 
            ? 'Your AI-powered evaluation scorecard has been generated successfully!'
            : 'Generating an AI-powered evaluation scorecard based on your job description...'
          }
        </p>
      </div>

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
              onClick={handleGenerate}
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
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleGenerate}>
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canBack || isGenerating}
        >
          Back
        </Button>

        <div className="flex space-x-3">
          {state.scorecard ? (
            <Button
              onClick={onComplete}
              size="lg"
              className="min-w-[160px]"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete & View Job
            </Button>
          ) : !isGenerating && state.jobDescription ? (
            <Button
              onClick={handleGenerate}
              disabled={generateScorecardMutation.isPending}
              className="min-w-[160px]"
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
    </div>
  );
}

export default ScorecardStep;