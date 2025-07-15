/**
 * Candidate List Component
 * Modern candidate management with advanced search, filtering, and AI-powered insights
 * Features grid/list view, real-time updates, and batch operations
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  Grid3x3, 
  List, 
  Plus,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  Zap,
  MapPin,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  SortAsc,
  SortDesc
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  useCandidates, 
  useCandidateStats, 
  useDeleteCandidate,
  formatProcessingStatus,
  formatCandidateSource,
  getStatusColor,
  getSourceColor
} from '@/hooks/candidates';
import { cn } from '@/lib/utils';

import { 
  ProcessingStatus, 
  CandidateSource, 
  type CandidateResponse 
} from '@/types/api';

interface CandidateListProps {
  jobId?: string;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'updated_at' | 'score';
type SortDirection = 'asc' | 'desc';

export function CandidateList({ 
  jobId,
  className 
}: CandidateListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<CandidateSource | ''>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const { 
    data: candidatesData, 
    isLoading, 
    error, 
    refetch 
  } = useCandidates({
    search: searchTerm || undefined,
    status_filter: statusFilter || undefined,
    source_filter: sourceFilter || undefined,
    job_id: jobId || undefined,
    sort_by: sortField,
    sort_order: sortDirection,
    limit: 50
  });

  const { data: stats } = useCandidateStats();
  const deleteCandidateMutation = useDeleteCandidate();

  const totalCount = candidatesData?.total || 0;

  // Filter and sort candidates locally as backup
  const filteredCandidates = useMemo(() => {
    const candidatesList = candidatesData?.items || [];
    return candidatesList.filter((candidate: CandidateResponse) => {
      const matchesSearch = !searchTerm || 
        `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || candidate.processing_status === statusFilter;
      const matchesSource = !sourceFilter || candidate.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [candidatesData?.items, searchTerm, statusFilter, sourceFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map((c: CandidateResponse) => c.id));
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      try {
        await deleteCandidateMutation.mutateAsync(candidateId);
        setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case ProcessingStatus.PROCESSING:
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case ProcessingStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case ProcessingStatus.FAILED:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return past.toLocaleDateString();
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  if (error) {
    return (
      <Card variant="alert" className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Candidates</h3>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : 'Failed to load candidates'}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card variant="feature" className="border-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  Candidate Pipeline
                  <Zap className="h-6 w-6 text-secondary inline ml-2 animate-pulse" />
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {totalCount} candidates • AI-powered profile management
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export functionality
                  window.open('/api/candidates/export', '_blank');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => window.open('/dashboard/candidates/upload', '_blank')}
                className="btn-interactive"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload CVs
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" className="backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.processing || 0}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed || 0}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.this_week || 0}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search candidates by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProcessingStatus | '')}
                options={[
                  { value: '', label: 'All Status' },
                  { value: ProcessingStatus.PENDING, label: 'Pending' },
                  { value: ProcessingStatus.PROCESSING, label: 'Processing' },
                  { value: ProcessingStatus.COMPLETED, label: 'Completed' },
                  { value: ProcessingStatus.FAILED, label: 'Failed' },
                ]}
                className="w-32"
              />
              <Select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as CandidateSource | '')}
                options={[
                  { value: '', label: 'All Sources' },
                  { value: CandidateSource.UPLOADED, label: 'Uploaded' },
                  { value: CandidateSource.MANUAL, label: 'Manual' },
                  { value: CandidateSource.IMPORTED, label: 'Imported' },
                ]}
                className="w-32"
              />
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('name')}
              className="flex items-center gap-1"
            >
              Name {getSortIcon('name')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('created_at')}
              className="flex items-center gap-1"
            >
              Date Added {getSortIcon('created_at')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('updated_at')}
              className="flex items-center gap-1"
            >
              Last Updated {getSortIcon('updated_at')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedCandidates.length > 0 && (
        <Card variant="interactive" className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCandidates.length === filteredCandidates.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">
                  {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates List */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || sourceFilter 
                  ? 'Try adjusting your filters or search term.'
                  : 'Get started by uploading some CVs.'
                }
              </p>
              <Button onClick={() => window.open('/dashboard/candidates/upload', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Upload CVs
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredCandidates.map((candidate: CandidateResponse) => (
                <Card key={candidate.id} variant="interactive" className="hover-lift h-fit">
                  <CardContent className="p-4 h-full">
                    <div className="flex flex-col h-full space-y-3">
                      {/* Header with checkbox and name */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleSelectCandidate(candidate.id)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-2 truncate">
                            {candidate.first_name} {candidate.last_name}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            {candidate.email && (
                              <div className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{candidate.email}</span>
                              </div>
                            )}
                            {candidate.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                            {candidate.location && (
                              <div className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{candidate.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-xs', getStatusColor(candidate.processing_status))}>
                          {getStatusIcon(candidate.processing_status)}
                          <span className="ml-1">{formatProcessingStatus(candidate.processing_status)}</span>
                        </Badge>
                        <Badge className={cn('text-xs', getSourceColor(candidate.source))}>
                          {formatCandidateSource(candidate.source)}
                        </Badge>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Added {formatTimeAgo(candidate.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                            title="View Profile"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            title="Delete Candidate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCandidates.map((candidate: CandidateResponse) => (
                <div key={candidate.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelectCandidate(candidate.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {candidate.first_name} {candidate.last_name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              {candidate.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {candidate.email}
                                </span>
                              )}
                              {candidate.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {candidate.phone}
                                </span>
                              )}
                              {candidate.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {candidate.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Badge className={cn('text-xs', getStatusColor(candidate.processing_status))}>
                              {getStatusIcon(candidate.processing_status)}
                              <span className="ml-1">{formatProcessingStatus(candidate.processing_status)}</span>
                            </Badge>
                            <Badge className={cn('text-xs', getSourceColor(candidate.source))}>
                              {formatCandidateSource(candidate.source)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 min-w-fit">
                            {formatTimeAgo(candidate.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Candidate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CandidateList;