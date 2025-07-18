/**
 * Evaluation Results Components
 * Components for displaying comprehensive evaluation results
 */

'use client';

import { useState } from 'react';
import { 
  TrophyIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { EvaluationResponse, CriterionScore, QualificationTier } from '@/types/api';

interface EvaluationResultsProps {
  evaluation: EvaluationResponse;
  candidateName?: string;
  jobTitle?: string;
  onCompare?: () => void;
  onReEvaluate?: () => void;
}

export function EvaluationResults({ 
  evaluation, 
  candidateName,
  jobTitle,
  onCompare,
  onReEvaluate
}: EvaluationResultsProps) {
  const [showEvidence, setShowEvidence] = useState<string | null>(null);

  const getTierColor = (tier?: QualificationTier) => {
    switch (tier) {
      case 'highly_qualified': return 'success';
      case 'qualified': return 'primary';
      case 'partially_qualified': return 'warning';
      case 'not_qualified': return 'error';
      default: return 'secondary';
    }
  };

  const getTierIcon = (tier?: QualificationTier) => {
    switch (tier) {
      case 'highly_qualified': return CheckCircleIcon;
      case 'qualified': return CheckCircleIcon;
      case 'partially_qualified': return ExclamationTriangleIcon;
      case 'not_qualified': return XMarkIcon;
      default: return ExclamationTriangleIcon;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatTierName = (tier?: QualificationTier) => {
    if (!tier) return 'Unknown';
    return tier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const TierIcon = getTierIcon(evaluation.qualification_tier);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Evaluation Results
            </h2>
            {candidateName && (
              <p className="text-lg text-gray-600">{candidateName}</p>
            )}
            {jobTitle && (
              <p className="text-sm text-gray-500">for {jobTitle}</p>
            )}
          </div>
          <div className="flex space-x-2">
            {onCompare && (
              <Button variant="outline" onClick={onCompare}>
                <ArrowsRightLeftIcon className="w-4 h-4 mr-2" />
                Compare
              </Button>
            )}
            {onReEvaluate && (
              <Button variant="outline" onClick={onReEvaluate}>
                Re-evaluate
              </Button>
            )}
          </div>
        </div>

        {/* Overall Score and Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
              <span className={`text-3xl font-bold ${getScoreColor(evaluation.overall_score || 0)}`}>
                {Math.round(evaluation.overall_score || 0)}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBarColor(evaluation.overall_score || 0)}`}
                  style={{ width: `${evaluation.overall_score || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
              <TierIcon className={`w-12 h-12 ${
                evaluation.qualification_tier === 'highly_qualified' || evaluation.qualification_tier === 'qualified' 
                  ? 'text-green-500' 
                  : evaluation.qualification_tier === 'partially_qualified'
                  ? 'text-orange-500'
                  : 'text-red-500'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Qualification Tier</h3>
            <Badge 
              variant={getTierColor(evaluation.qualification_tier)}
              className="mt-2"
            >
              {formatTierName(evaluation.qualification_tier)}
            </Badge>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Confidence Level</span>
            <span className="text-sm font-bold text-gray-900">
              {Math.round((evaluation.confidence_level || 0) * 100)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${(evaluation.confidence_level || 0) * 100}%` }}
            />
          </div>
          {evaluation.confidence_level && evaluation.confidence_level < 0.7 && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ Low confidence - consider manual review
            </p>
          )}
        </div>
      </Card>

      {/* Criterion Scores */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Scores
        </h3>
        <div className="space-y-4">
          {Object.entries(evaluation.scores || {}).map(([criterion, score]) => (
            <div key={criterion} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 capitalize">
                  {criterion.replace('_', ' ')}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${getScoreColor(score.percentage)}`}>
                    {score.percentage.toFixed(1)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEvidence(
                      showEvidence === criterion ? null : criterion
                    )}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBarColor(score.percentage)}`}
                  style={{ width: `${score.percentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{score.score}/{score.max_score} points</span>
                <span>Confidence: {Math.round(score.confidence * 100)}%</span>
              </div>

              {showEvidence === criterion && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Evidence & Justification</h5>
                  <p className="text-sm text-blue-800 mb-3">{score.justification}</p>
                  {score.evidence && score.evidence.length > 0 && (
                    <div>
                      <h6 className="font-medium text-blue-900 mb-1">Supporting Evidence:</h6>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {score.evidence.map((evidence, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths and Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Key Strengths</h3>
          </div>
          {evaluation.strengths && evaluation.strengths.length > 0 ? (
            <ul className="space-y-2">
              {evaluation.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific strengths identified</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Areas for Development</h3>
          </div>
          {evaluation.gaps && evaluation.gaps.length > 0 ? (
            <ul className="space-y-2">
              {evaluation.gaps.map((gap, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{gap}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No significant gaps identified</p>
          )}
        </Card>
      </div>

      {/* Interview Focus Areas */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <LightBulbIcon className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Interview Focus Areas</h3>
        </div>
        {evaluation.interview_focus_areas && evaluation.interview_focus_areas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluation.interview_focus_areas.map((area, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{area}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No specific interview focus areas suggested</p>
        )}
      </Card>

      {/* Recommendations */}
      {evaluation.recommendations && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800">{evaluation.recommendations}</p>
          </div>
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Evaluation ID</p>
            <p className="font-medium">{evaluation.id.slice(0, 8)}...</p>
          </div>
          <div>
            <p className="text-gray-600">AI Model</p>
            <p className="font-medium">{evaluation.ai_model}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium">
              {new Date(evaluation.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Job ID</p>
            <p className="font-medium">{evaluation.job_id.slice(0, 8)}...</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface EvaluationComparisonProps {
  evaluations: EvaluationResponse[];
  candidateNames?: Record<string, string>;
  onClose?: () => void;
}

export function EvaluationComparison({ 
  evaluations, 
  candidateNames = {},
  onClose 
}: EvaluationComparisonProps) {
  if (evaluations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No evaluations to compare
        </h3>
        <p className="text-gray-600">Select multiple candidates to compare their evaluations</p>
      </Card>
    );
  }

  const allCriteria = Array.from(new Set(
    evaluations.flatMap(e => Object.keys(e.scores || {}))
  ));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Comparison ({evaluations.length} candidates)
          </h2>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close Comparison
            </Button>
          )}
        </div>

        {/* Overall Score Comparison */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Scores</h3>
          <div className="space-y-3">
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="flex items-center space-x-4">
                <div className="w-32">
                  <p className="font-medium text-gray-900">
                    {candidateNames[evaluation.candidate_id] || `Candidate ${evaluation.candidate_id.slice(0, 8)}...`}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (evaluation.overall_score || 0) >= 80 ? 'bg-green-500' :
                        (evaluation.overall_score || 0) >= 60 ? 'bg-blue-500' :
                        (evaluation.overall_score || 0) >= 40 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${evaluation.overall_score || 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="font-bold text-gray-900">
                    {Math.round(evaluation.overall_score || 0)}%
                  </span>
                </div>
                <div className="w-24">
                  <Badge 
                    variant={
                      evaluation.qualification_tier === 'highly_qualified' ? 'success' :
                      evaluation.qualification_tier === 'qualified' ? 'primary' :
                      evaluation.qualification_tier === 'partially_qualified' ? 'warning' :
                      'secondary'
                    }
                    size="sm"
                  >
                    {evaluation.qualification_tier?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Criterion by Criterion Comparison */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Criterion</th>
                  {evaluations.map((evaluation) => (
                    <th key={evaluation.id} className="text-center p-3 font-medium text-gray-900">
                      {candidateNames[evaluation.candidate_id] || `Candidate ${evaluation.candidate_id.slice(0, 8)}...`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allCriteria.map((criterion) => (
                  <tr key={criterion} className="border-b">
                    <td className="p-3 font-medium text-gray-900 capitalize">
                      {criterion.replace('_', ' ')}
                    </td>
                    {evaluations.map((evaluation) => {
                      const score = evaluation.scores?.[criterion];
                      return (
                        <td key={evaluation.id} className="p-3 text-center">
                          {score ? (
                            <div>
                              <span className={`font-bold ${
                                score.percentage >= 80 ? 'text-green-600' :
                                score.percentage >= 60 ? 'text-blue-600' :
                                score.percentage >= 40 ? 'text-orange-600' :
                                'text-red-600'
                              }`}>
                                {score.percentage.toFixed(1)}%
                              </span>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className={`h-1 rounded-full ${
                                    score.percentage >= 80 ? 'bg-green-500' :
                                    score.percentage >= 60 ? 'bg-blue-500' :
                                    score.percentage >= 40 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${score.percentage}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Side-by-side Strengths and Gaps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths & Development Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluations.map((evaluation) => (
            <div key={evaluation.id} className="space-y-4">
              <h4 className="font-medium text-gray-900">
                {candidateNames[evaluation.candidate_id] || `Candidate ${evaluation.candidate_id.slice(0, 8)}...`}
              </h4>
              
              <div>
                <h5 className="text-sm font-medium text-green-700 mb-2">Strengths</h5>
                <ul className="text-sm space-y-1">
                  {evaluation.strengths?.slice(0, 3).map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {strength}
                    </li>
                  )) || <li className="text-gray-500">No strengths listed</li>}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium text-orange-700 mb-2">Development Areas</h5>
                <ul className="text-sm space-y-1">
                  {evaluation.gaps?.slice(0, 3).map((gap, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {gap}
                    </li>
                  )) || <li className="text-gray-500">No gaps identified</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
