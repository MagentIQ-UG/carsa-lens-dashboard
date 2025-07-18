/**
 * Ranking Components
 * Components for advanced candidate ranking and decision making
 */

'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  UserGroupIcon,
  TrophyIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { 
  AdvancedRankingCriteria, 
  RankingResult, 
  CandidateRankingDetail,
} from '@/types/api';

interface AdvancedRankingFormProps {
  jobId: string;
  onSubmit: (criteria: AdvancedRankingCriteria) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AdvancedRankingForm({ 
  jobId, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: AdvancedRankingFormProps) {
  const [criteria, setCriteria] = useState<AdvancedRankingCriteria>({
    job_id: jobId,
    criteria_weights: {
      technical_skills: 30,
      experience: 25,
      education: 15,
      cultural_fit: 20,
      communication: 10,
    },
    include_diversity_factors: false,
    ranking_method: 'weighted_average',
    tie_breaking_factors: [],
    notes: '',
  });

  const handleWeightChange = (criterion: keyof typeof criteria.criteria_weights, value: number[]) => {
    setCriteria((prev: AdvancedRankingCriteria) => ({
      ...prev,
      criteria_weights: {
        ...prev.criteria_weights,
        [criterion]: value[0],
      },
    }));
  };

  const handleTieBreakingChange = (factor: string, checked: boolean) => {
    setCriteria((prev: AdvancedRankingCriteria) => ({
      ...prev,
      tie_breaking_factors: checked 
        ? [...prev.tie_breaking_factors, factor]
        : prev.tie_breaking_factors.filter((f: string) => f !== factor),
    }));
  };

  const totalWeight = Object.values(criteria.criteria_weights).reduce((sum: number, weight: number) => sum + weight, 0);
  const isValidWeight = totalWeight === 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Ranking</h2>
          <p className="text-gray-600">Configure criteria and weights for candidate ranking</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSubmit(criteria)}
            disabled={!isValidWeight || isLoading}
          >
            {isLoading ? 'Generating Ranking...' : 'Generate Ranking'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Criteria Weights */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evaluation Criteria Weights
          </h3>
          <div className="space-y-4">
            {Object.entries(criteria.criteria_weights).map(([criterion, weight]) => (
              <div key={criterion} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium capitalize">
                    {criterion.replace('_', ' ')}
                  </Label>
                  <span className="text-sm font-medium text-gray-900">
                    {weight}%
                  </span>
                </div>
                <Slider
                  value={[weight]}
                  onValueChange={(value: number[]) => handleWeightChange(criterion as keyof typeof criteria.criteria_weights, value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Weight</span>
              <span className={`text-sm font-bold ${
                isValidWeight ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalWeight}%
              </span>
            </div>
            {!isValidWeight && (
              <p className="text-sm text-red-600 mt-1">
                Total weight must equal 100%
              </p>
            )}
          </div>
        </div>

        {/* Ranking Method */}
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-2 block">
            Ranking Method
          </Label>
          <Select
            value={criteria.ranking_method}
            onChange={(e) => setCriteria((prev: AdvancedRankingCriteria) => ({ 
              ...prev, 
              ranking_method: e.target.value as 'weighted_average' | 'top_score_priority' | 'balanced_scorecard'
            }))}
            options={[
              { value: 'weighted_average', label: 'Weighted Average' },
              { value: 'top_score_priority', label: 'Top Score Priority' },
              { value: 'balanced_scorecard', label: 'Balanced Scorecard' }
            ]}
          />
          <p className="text-sm text-gray-600 mt-1">
            {criteria.ranking_method === 'weighted_average' && 'Calculate overall score using weighted averages'}
            {criteria.ranking_method === 'top_score_priority' && 'Prioritize candidates with highest individual scores'}
            {criteria.ranking_method === 'balanced_scorecard' && 'Balance scores across all criteria'}
          </p>
        </div>

        {/* Tie Breaking Factors */}
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-3 block">
            Tie Breaking Factors
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'years_experience', label: 'Years of Experience' },
              { id: 'education_level', label: 'Education Level' },
              { id: 'certification_count', label: 'Number of Certifications' },
              { id: 'portfolio_quality', label: 'Portfolio Quality' },
              { id: 'interview_performance', label: 'Interview Performance' },
              { id: 'reference_strength', label: 'Reference Strength' },
            ].map(factor => (
              <div key={factor.id} className="flex items-center space-x-2">
                <Checkbox
                  id={factor.id}
                  checked={criteria.tie_breaking_factors.includes(factor.id)}
                  onCheckedChange={(checked: boolean) => handleTieBreakingChange(factor.id, checked)}
                />
                <Label htmlFor={factor.id} className="text-sm">
                  {factor.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Diversity Considerations */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="diversity"
              checked={criteria.include_diversity_factors}
              onCheckedChange={(checked: boolean) => setCriteria((prev: AdvancedRankingCriteria) => ({ 
                ...prev, 
                include_diversity_factors: checked 
              }))}
            />
            <Label htmlFor="diversity" className="text-sm font-medium">
              Include Diversity Factors
            </Label>
          </div>
          <p className="text-sm text-gray-600">
            Consider diversity and inclusion factors in the ranking process
          </p>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-sm font-medium text-gray-900 mb-2 block">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            value={criteria.notes}
            onChange={(e) => setCriteria((prev: AdvancedRankingCriteria) => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any specific considerations or requirements for this ranking..."
            rows={3}
          />
        </div>
      </div>
    </Card>
  );
}

interface RankingResultsProps {
  results: RankingResult;
  candidates: { id: string; first_name: string; last_name: string; [key: string]: any }[];
  onViewDetails: (candidateId: string) => void;
  onExport?: () => void;
}

export function RankingResults({ 
  results, 
  candidates, 
  onViewDetails,
  onExport 
}: RankingResultsProps) {
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name'>('rank');
  const [showJustification, setShowJustification] = useState<string | null>(null);

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate ? `${candidate.first_name} ${candidate.last_name}` : `Candidate ${candidateId.slice(0, 8)}...`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <TrophyIcon className="w-5 h-5 text-yellow-500" />;
      case 2: return <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>;
      case 3: return <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>;
      default: return <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">{rank}</div>;
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

  const sortedCandidates = [...(results.ranked_candidates || [])].sort((a, b) => {
    switch (sortBy) {
      case 'rank': return a.rank - b.rank;
      case 'score': return b.final_score - a.final_score;
      case 'name': 
        const nameA = getCandidateName(a.candidate_id);
        const nameB = getCandidateName(b.candidate_id);
        return nameA.localeCompare(nameB);
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ranking Results</h2>
            <p className="text-gray-600">
              {results.ranked_candidates?.length || 0} candidates ranked
            </p>
          </div>
          <div className="flex space-x-2">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rank' | 'score' | 'name')}
              options={[
                { value: 'rank', label: 'Sort by Rank' },
                { value: 'score', label: 'Sort by Score' },
                { value: 'name', label: 'Sort by Name' }
              ]}
              className="w-40"
            />
            {onExport && (
              <Button variant="outline" onClick={onExport}>
                Export Results
              </Button>
            )}
          </div>
        </div>

        {/* Ranking Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <UserGroupIcon className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-900">Total Candidates</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {results.ranked_candidates?.length || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-900">Highly Qualified</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {results.ranked_candidates?.filter(c => c.final_score >= 80).length || 0}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-orange-900">Average Score</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {results.ranked_candidates?.length 
                ? Math.round(results.ranked_candidates.reduce((sum, c) => sum + c.final_score, 0) / results.ranked_candidates.length)
                : 0}%
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-purple-900">Confidence</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {Math.round((results.confidence_level || 0) * 100)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Candidates List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranked Candidates</h3>
        <div className="space-y-4">
          {sortedCandidates.map((candidate) => (
            <div key={candidate.candidate_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  {getRankIcon(candidate.rank)}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getCandidateName(candidate.candidate_id)}
                    </h4>
                    <p className="text-sm text-gray-600">Rank #{candidate.rank}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getScoreColor(candidate.final_score)}`}>
                      {candidate.final_score.toFixed(1)}%
                    </p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${getScoreBarColor(candidate.final_score)}`}
                        style={{ width: `${candidate.final_score}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowJustification(
                        showJustification === candidate.candidate_id ? null : candidate.candidate_id
                      )}
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(candidate.candidate_id)}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                {Object.entries(candidate.score_breakdown || {}).map(([criterion, score]) => (
                  <div key={criterion} className="text-center">
                    <p className="text-xs text-gray-600 capitalize">
                      {criterion.replace('_', ' ')}
                    </p>
                    <p className={`font-semibold ${getScoreColor(score)}`}>
                      {score.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>

              {/* Justification */}
              {showJustification === candidate.candidate_id && candidate.justification && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Ranking Justification</h5>
                  <p className="text-sm text-blue-800">{candidate.justification}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Methodology */}
      {results.methodology && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking Methodology</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-800">{results.methodology}</p>
          </div>
          {results.criteria_weights && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Criteria Weights Used</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(results.criteria_weights).map(([criterion, weight]) => (
                  <div key={criterion} className="text-center">
                    <p className="text-sm text-gray-600 capitalize">
                      {criterion.replace('_', ' ')}
                    </p>
                    <p className="font-semibold text-gray-900">{weight}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

interface CandidateComparisonProps {
  candidates: CandidateRankingDetail[];
  candidateProfiles: { id: string; first_name: string; last_name: string; [key: string]: any }[];
  onClose?: () => void;
}

export function CandidateComparison({ 
  candidates, 
  candidateProfiles, 
  onClose 
}: CandidateComparisonProps) {
  const getCandidateName = (candidateId: string) => {
    const profile = candidateProfiles.find(p => p.id === candidateId);
    return profile ? `${profile.first_name} ${profile.last_name}` : `Candidate ${candidateId.slice(0, 8)}...`;
  };

  const allCriteria = Array.from(new Set(
    candidates.flatMap(c => Object.keys(c.score_breakdown || {}))
  ));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Comparison ({candidates.length} candidates)
          </h2>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close Comparison
            </Button>
          )}
        </div>

        {/* Overall Ranking Comparison */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rankings</h3>
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.candidate_id} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-900">#{candidate.rank}</span>
                </div>
                <div className="w-32">
                  <p className="font-medium text-gray-900">
                    {getCandidateName(candidate.candidate_id)}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        candidate.final_score >= 80 ? 'bg-green-500' :
                        candidate.final_score >= 60 ? 'bg-blue-500' :
                        candidate.final_score >= 40 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${candidate.final_score}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="font-bold text-gray-900">
                    {candidate.final_score.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Score Comparison */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Criterion</th>
                  {candidates.map((candidate) => (
                    <th key={candidate.candidate_id} className="text-center p-3 font-medium text-gray-900">
                      <div>
                        <p>{getCandidateName(candidate.candidate_id)}</p>
                        <p className="text-sm font-normal text-gray-500">Rank #{candidate.rank}</p>
                      </div>
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
                    {candidates.map((candidate) => {
                      const score = candidate.score_breakdown?.[criterion];
                      return (
                        <td key={candidate.candidate_id} className="p-3 text-center">
                          {score !== undefined ? (
                            <div>
                              <span className={`font-bold ${
                                score >= 80 ? 'text-green-600' :
                                score >= 60 ? 'text-blue-600' :
                                score >= 40 ? 'text-orange-600' :
                                'text-red-600'
                              }`}>
                                {score.toFixed(1)}%
                              </span>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className={`h-1 rounded-full ${
                                    score >= 80 ? 'bg-green-500' :
                                    score >= 60 ? 'bg-blue-500' :
                                    score >= 40 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
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

      {/* Justifications Side by Side */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking Justifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.candidate_id} className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-900">#{candidate.rank}</span>
                </div>
                <h4 className="font-medium text-gray-900">
                  {getCandidateName(candidate.candidate_id)}
                </h4>
              </div>
              {candidate.justification ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800">{candidate.justification}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No justification provided</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
