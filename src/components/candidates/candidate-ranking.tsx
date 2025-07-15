/**
 * Candidate Ranking Component
 * Demonstrates usage of ranking endpoints for candidate evaluation
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Users,
  BarChart3,
  Star,
  Target,
  Eye,
  Plus,
  Filter,
  Download
} from 'lucide-react';

import {
  useJobRankings,
  useRankingAnalytics,
  useCreateShortlist,
  useDiversityReport
} from '@/hooks/rankings';

import {
  useEnhancedCandidates
} from '@/hooks/candidates-enhanced';

interface CandidateRankingProps {
  jobId: string;
}

export function CandidateRanking({ jobId }: CandidateRankingProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showShortlistDialog, setShowShortlistDialog] = useState(false);

  // Fetch rankings for this job
  const { data: rankings, isLoading: rankingsLoading } = useJobRankings(jobId, {
    limit: 50,
    sort_by: 'score',
    order: 'desc'
  });

  // Fetch candidates for additional info
  const { data: candidates } = useEnhancedCandidates();
  
  // Fetch shortlists - commented out for now
  // const { data: shortlists } = useShortlists({ job_id: jobId });

  // Mutations
  const createShortlist = useCreateShortlist();

  // Get first ranking ID for analytics
  const firstRankingId = rankings?.[0]?.id;
  const { data: analytics } = useRankingAnalytics(firstRankingId || '');
  const { data: diversityReport } = useDiversityReport(firstRankingId || '');

  const handleCreateShortlist = () => {
    if (selectedCandidates.length === 0) return;

    createShortlist.mutate({
      job_id: jobId,
      name: `Shortlist ${new Date().toLocaleDateString()}`,
      description: `Top ${selectedCandidates.length} candidates`,
      candidate_ids: selectedCandidates
    });

    setSelectedCandidates([]);
    setShowShortlistDialog(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-blue-500';
    if (confidence >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (rankingsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Candidate Rankings</h2>
          <p className="text-gray-600">
            {rankings?.length || 0} candidates ranked for this position
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShortlistDialog(true)}
            disabled={selectedCandidates.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Shortlist ({selectedCandidates.length})
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold">{analytics.total_candidates}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold">{Math.round(analytics.average_confidence * 100)}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Criteria</p>
                  <p className="text-sm font-semibold">{analytics.top_criteria?.[0] || 'N/A'}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Diversity Score</p>
                  <p className="text-2xl font-bold">{diversityReport?.diversity_score || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex space-x-2">
            {['rankings', 'analytics', 'shortlists'].map((tab) => (
              <Button
                key={tab}
                variant={tab === 'rankings' ? 'primary' : 'outline'}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {/* Rankings Content */}
          <div className="grid grid-cols-1 gap-4">
            {rankings?.map((ranking, index) => {
              const candidate = candidates?.find(c => c.id === ranking.candidate_id);
              const isSelected = selectedCandidates.includes(ranking.candidate_id);
              
              return (
                <Card
                  key={ranking.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCandidates(prev => prev.filter(id => id !== ranking.candidate_id));
                    } else {
                      setSelectedCandidates(prev => [...prev, ranking.candidate_id]);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            #{ranking.rank}
                          </Badge>
                          {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        </div>
                        
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {candidate?.first_name?.[0]}{candidate?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {candidate?.first_name} {candidate?.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{candidate?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {candidate?.location}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Experience
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className={`text-xl font-bold ${getScoreColor(ranking.score)}`}>
                              {ranking.score}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">Confidence:</span>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getConfidenceColor(ranking.confidence)}`} />
                              <span className="text-xs">{Math.round(ranking.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Criteria Scores */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(ranking.criteria_scores || {}).map(([criteria, score]) => (
                          <div key={criteria} className="text-center">
                            <p className="text-xs text-gray-500 mb-1 capitalize">{criteria}</p>
                            <Progress value={score} className="h-2" />
                            <p className="text-xs font-medium mt-1">{score}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        {/* Analytics and Shortlists sections can be added later */}
      </div>

      {/* Create Shortlist Dialog */}
      {showShortlistDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Shortlist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Create a shortlist with {selectedCandidates.length} selected candidates?
              </p>
              <div className="flex gap-2">
                <Button onClick={handleCreateShortlist} className="flex-1">
                  Create Shortlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowShortlistDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}