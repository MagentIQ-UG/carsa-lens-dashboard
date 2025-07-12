/**
 * Enhancement Step
 * Third step for AI-powered job description enhancement and bias detection
 */

'use client';

import { Wand2, CheckCircle, AlertTriangle, Eye, Search, Users, ArrowRight, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';

import { useEnhanceJobDescription } from '@/hooks/jobs';
import { cn } from '@/lib/utils';

import type { JDEnhancementRequest } from '@/types/api';
import type { WizardStepProps } from '../job-creation-wizard';

const ENHANCEMENT_OPTIONS = [
  {
    key: 'clarity' as const,
    title: 'Clarity & Structure',
    description: 'Improve readability, formatting, and overall structure',
    icon: Eye,
    color: 'blue',
  },
  {
    key: 'bias_detection' as const,
    title: 'Bias Detection',
    description: 'Identify and fix potentially biased or exclusive language',
    icon: Users,
    color: 'purple',
  },
  {
    key: 'keywords' as const,
    title: 'Keyword Optimization',
    description: 'Enhance SEO and attract qualified candidates',
    icon: Search,
    color: 'green',
  },
];

export function EnhancementStep({ 
  state, 
  onStateChange, 
  onNext, 
  onBack,
  canBack
}: WizardStepProps) {
  const enhanceMutation = useEnhanceJobDescription();

  const [selectedTypes, setSelectedTypes] = useState<('clarity' | 'bias_detection' | 'keywords')[]>(['clarity', 'bias_detection']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showOriginal, setShowOriginal] = useState(false);

  // Toggle enhancement type
  const toggleType = (type: 'clarity' | 'bias_detection' | 'keywords') => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Run enhancement
  const handleEnhance = async () => {
    if (!state.job || !state.jobDescription || selectedTypes.length === 0) return;

    try {
      const enhancementRequest: JDEnhancementRequest = {
        enhancement_types: selectedTypes,
        custom_instructions: customInstructions || undefined,
        target_audience: 'general',
      };

      const result = await enhanceMutation.mutateAsync({
        jobId: state.job.id,
        jdId: state.jobDescription.id,
        data: enhancementRequest,
      });

      onStateChange({
        jobDescription: result.enhanced_description,
        enhancementAnalysis: result.analysis,
        enhancementResult: result,
      });
    } catch (error) {
      console.error('Enhancement failed:', error);
    }
  };

  // Reset to original
  const handleReset = () => {
    if (state.uploadResult) {
      onStateChange({
        jobDescription: state.uploadResult.job_description,
        enhancementAnalysis: undefined,
        enhancementResult: undefined,
      });
    }
  };

  // Skip enhancement
  const handleSkip = () => {
    onNext();
  };

  // Get bias severity color
  const getBiasSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const canEnhance = selectedTypes.length > 0 && !enhanceMutation.isPending;
  const hasEnhancement = !!state.enhancementResult;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">AI Enhancement & Analysis</h2>
        <p className="text-gray-600 mt-2">
          Improve your job description with AI-powered enhancements and bias detection
        </p>
      </div>

      {/* Enhancement Options */}
      {!hasEnhancement && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Enhancement Types</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {ENHANCEMENT_OPTIONS.map((option) => {
              const isSelected = selectedTypes.includes(option.key);
              const Icon = option.icon;
              
              return (
                <Card
                  key={option.key}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected 
                      ? `ring-2 ring-${option.color}-500 bg-${option.color}-50` 
                      : 'hover:shadow-md'
                  )}
                  onClick={() => toggleType(option.key)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        isSelected 
                          ? `bg-${option.color}-100 text-${option.color}-600`
                          : 'bg-gray-100 text-gray-400'
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{option.title}</CardTitle>
                      </div>
                      {isSelected && (
                        <CheckCircle className={`h-5 w-5 text-${option.color}-600`} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Instructions */}
      {!hasEnhancement && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Any specific enhancement requirements or guidelines..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      )}

      {/* Enhancement Results */}
      {hasEnhancement && state.enhancementResult && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-blue-600" />
                Enhancement Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clarity Score */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {state.enhancementResult.analysis.clarity_score}/100
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Clarity Score</div>
                  <Progress 
                    value={state.enhancementResult.analysis.clarity_score} 
                    className="h-2"
                  />
                </div>

                {/* Bias Score */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {state.enhancementResult.analysis.bias_score}/100
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Bias Score</div>
                  <Progress 
                    value={state.enhancementResult.analysis.bias_score} 
                    className="h-2"
                  />
                </div>

                {/* Overall Quality */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {state.enhancementResult.analysis.overall_quality_score}/100
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Overall Quality</div>
                  <Progress 
                    value={state.enhancementResult.analysis.overall_quality_score} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {state.enhancementResult.analysis.bias_flags_count}
                  </div>
                  <div className="text-xs text-gray-500">Bias Issues Fixed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {state.enhancementResult.analysis.enhancement_suggestions_count}
                  </div>
                  <div className="text-xs text-gray-500">Improvements Made</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {state.enhancementResult.analysis.keyword_suggestions.length}
                  </div>
                  <div className="text-xs text-gray-500">Keywords Added</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {state.jobDescription?.version || 1}
                  </div>
                  <div className="text-xs text-gray-500">Version</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bias Flags */}
          {state.jobDescription?.bias_flags && state.jobDescription.bias_flags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Bias Detection Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.jobDescription.bias_flags.map((flag: any, index: number) => (
                    <div
                      key={index}
                      className={cn(
                        'p-3 rounded-lg border',
                        getBiasSeverityColor(flag.severity)
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge outlined className="text-xs">
                              {flag.type} bias
                            </Badge>
                            <Badge 
                              variant={flag.severity === 'high' ? 'error' : 'secondary'}
                              className="text-xs"
                            >
                              {flag.severity}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Original:</span> "{flag.text}"
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium">Suggested:</span> "{flag.suggestion}"
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhancement Suggestions */}
          {state.jobDescription?.enhancement_suggestions && state.jobDescription.enhancement_suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Improvements Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.jobDescription.enhancement_suggestions.slice(0, 5).map((suggestion: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="success" outlined className="text-xs">
                              {suggestion.type}
                            </Badge>
                            <span className="text-xs text-green-600">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                          </div>
                          <div className="text-sm text-green-700">
                            {suggestion.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keyword Suggestions */}
          {state.enhancementResult.analysis.keyword_suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  Keywords Added
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {state.enhancementResult.analysis.keyword_suggestions.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Original vs Enhanced Toggle */}
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{showOriginal ? 'Show Enhanced' : 'Show Original'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Job Description Preview */}
      {state.jobDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {showOriginal ? 'Original' : 'Enhanced'} Job Description
              </span>
              {hasEnhancement && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEnhance}
                    disabled={!canEnhance}
                  >
                    Re-enhance
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WysiwygEditor
              content={showOriginal && state.uploadResult 
                ? state.uploadResult.job_description.content
                : state.jobDescription.content
              }
              onSave={(content) => {
                if (state.jobDescription) {
                  onStateChange({
                    jobDescription: {
                      ...state.jobDescription,
                      content: content
                    }
                  });
                }
              }}
              title={`${showOriginal ? 'Original' : 'Enhanced'} Job Description`}
              readOnly={false}
              height={300}
              placeholder="Job description content..."
            />
          </CardContent>
        </Card>
      )}

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
          {!hasEnhancement ? (
            <>
              <Button
                variant="outline"
                onClick={handleSkip}
              >
                Skip Enhancement
              </Button>
              <Button
                onClick={handleEnhance}
                disabled={!canEnhance}
                className="min-w-[120px]"
              >
                {enhanceMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Enhance
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={onNext}>
              Continue to Review
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnhancementStep;