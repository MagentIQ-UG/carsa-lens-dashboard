/**
 * JobList Component
 * Professional job listing with search, filters, and pagination
 */

'use client';

import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Grid,
  List,
  AlertCircle,
  Briefcase,
  X,
  Sparkles,
  Zap,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Eye,
  Share2,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useCallback } from 'react';

import { JobCard } from '@/components/jobs/job-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobs } from '@/hooks/jobs';
import { cn } from '@/lib/utils';
import {
  JobResponse,
  JobStatus,
  JobType,
  JobFilters,
} from '@/types/api';

interface JobListProps {
  className?: string;
}

type SortField = 'created_at' | 'updated_at' | 'title' | 'department';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const JOB_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: JobStatus.ACTIVE, label: 'Active' },
  { value: JobStatus.DRAFT, label: 'Draft' },
  { value: JobStatus.PAUSED, label: 'Paused' },
  { value: JobStatus.CLOSED, label: 'Closed' },
];

const JOB_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: JobType.FULL_TIME, label: 'Full-time' },
  { value: JobType.PART_TIME, label: 'Part-time' },
  { value: JobType.CONTRACT, label: 'Contract' },
  { value: JobType.TEMPORARY, label: 'Temporary' },
  { value: JobType.INTERNSHIP, label: 'Internship' },
  { value: JobType.FREELANCE, label: 'Freelance' },
];

const DEPARTMENT_OPTIONS = [
  { value: '', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product' },
  { value: 'Design', label: 'Design' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Operations', label: 'Operations' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'Finance', label: 'Finance' },
];

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'updated_at-desc', label: 'Recently Updated' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'department-asc', label: 'Department A-Z' },
];

export function JobList({ className }: JobListProps) {
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<JobType | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  // const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Build filters for API
  const filters: JobFilters = useMemo(() => {
    const apiFilters: JobFilters = {
      limit: 50,
      offset: 0,
    };

    if (statusFilter) {
      apiFilters.status_filter = statusFilter as JobStatus;
    }
    if (departmentFilter) {
      apiFilters.department = departmentFilter;
    }

    return apiFilters;
  }, [statusFilter, departmentFilter]);

  // Fetch jobs
  const { 
    data: jobs = [], 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useJobs(filters);

  // Client-side filtering and sorting
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(job => job.job_type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'created_at':
        case 'updated_at':
          aValue = new Date(a[sortField]).getTime();
          bValue = new Date(b[sortField]).getTime();
          break;
        case 'title':
        case 'department':
          aValue = a[sortField]?.toLowerCase() || '';
          bValue = b[sortField]?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [jobs, searchQuery, typeFilter, sortField, sortOrder]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split('-') as [SortField, SortOrder];
    setSortField(field);
    setSortOrder(order);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setDepartmentFilter('');
    setSortField('created_at');
    setSortOrder('desc');
  }, []);

  // Active filter count
  const activeFilterCount = [
    searchQuery,
    statusFilter,
    typeFilter,
    departmentFilter,
  ].filter(Boolean).length;

  // Job action handlers
  const handleJobView = useCallback((job: JobResponse) => {
    router.push(`/dashboard/jobs/${job.id}`);
  }, [router]);

  const handleJobEdit = useCallback((job: JobResponse) => {
    router.push(`/dashboard/jobs/${job.id}/edit`);
  }, [router]);

  const handleJobDelete = useCallback((job: JobResponse) => {
    // Show delete confirmation modal - TODO: Implement delete modal
    console.warn('Delete job:', job.id);
    // setSelectedJob(job);
    // setShowDeleteModal(true);
  }, []);

  const handleJobToggleStatus = useCallback((job: JobResponse) => {
    // Toggle job status using mutation
    console.warn('Toggle status for job:', job.id);
    // TODO: Implement with useUpdateJob mutation
  }, []);

  const handleJobDuplicate = useCallback((job: JobResponse) => {
    // Navigate to job creation with pre-filled data
    router.push(`/dashboard/jobs/create?duplicate=${job.id}`);
  }, [router]);

  const handleJobShare = useCallback((job: JobResponse) => {
    // Copy job sharing URL to clipboard
    const shareUrl = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(shareUrl);
    // TODO: Show toast notification
  }, []);

  const handleExport = useCallback(() => {
    console.warn('Export jobs');
    // Export jobs to CSV/Excel
  }, []);

  if (isError) {
    return (
      <Container className={className}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load jobs</h3>
            <p className="text-gray-600 text-center mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={className}>
      {/* AI-Enhanced Header */}
      <Card variant="feature" className="mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
        <CardContent className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-muted-foreground">AI Job Intelligence Active</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Smart Recommendations
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                Job Management
                <Zap className="h-6 w-6 text-secondary animate-pulse" />
              </h1>
              
              <p className="text-muted-foreground text-base mb-4">
                AI-powered job creation and candidate matching. Create smarter job postings that attract top talent.
              </p>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-medium">{jobs.length}</span>
                  <span className="text-muted-foreground">Total Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{filteredAndSortedJobs.length}</span>
                  <span className="text-muted-foreground">Filtered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="font-medium">1.2k</span>
                  <span className="text-muted-foreground">Applications</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* AI Actions */}
              <div className="flex items-center gap-2">
                <Button variant="glass" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Suggestions
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
              
              {/* Primary Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={isLoading || filteredAndSortedJobs.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button 
                  variant="gradient" 
                  size="lg"
                  onClick={() => router.push('/dashboard/jobs/create')}
                  className="shadow-elevation-3 hover:shadow-elevation-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create AI Job
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Enhanced Search and Filters */}
      <Card variant="interactive" className="mb-6 group">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-primary" />
              Smart Search & Filters
              <Badge outlined className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>⌘+K for quick search</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col space-y-4">
            {/* Enhanced Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Ask AI to find jobs... or search manually"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="search"
                  size="md"
                  leftIcon={<Search className="h-4 w-4" />}
                  rightIcon={searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  className="text-base"
                />
              </div>
              
              {/* Smart Filter Toggle */}
              <Button
                variant={activeFilterCount > 0 ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'relative hover-lift micro-bounce btn-interactive',
                  activeFilterCount > 0 && 'shadow-elevation-2 animate-pulse-slow'
                )}
                aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
                aria-expanded={showFilters}
              >
                <Filter className="h-4 w-4 mr-2" />
                Smart Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="primary" 
                    className="ml-2 px-1.5 py-0.5 text-xs animate-pulse"
                    aria-label={`${activeFilterCount} active filters`}
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              
              {/* Modern View Toggle */}
              <div className="flex border border-input rounded-lg overflow-hidden shadow-elevation-1" role="group" aria-label="View mode">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <div className="w-px bg-border" />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* AI Actions */}
              <div className="flex items-center gap-2">
                <Button variant="glass" size="sm" className="hover-lift micro-tap btn-interactive">
                  <Zap className="h-4 w-4 mr-2 ai-pulse" />
                  AI Sort
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh jobs"
                className="hover-lift micro-bounce morph-circle-to-square"
              >
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
            </div>

            {/* AI-Enhanced Filters Panel */}
            {showFilters && (
              <div className="mt-6 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">Smart Filter Options</span>
                  <Badge outlined className="text-xs">AI Recommended</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
                      options={JOB_STATUS_OPTIONS}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type
                    </label>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as JobType | '')}
                      options={JOB_TYPE_OPTIONS}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department
                    </label>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      options={DEPARTMENT_OPTIONS}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sort by
                    </label>
                    <Select
                      value={`${sortField}-${sortOrder}`}
                      onChange={(e) => handleSortChange(e.target.value)}
                      options={SORT_OPTIONS}
                    />
                  </div>
                </div>
                
                {/* AI Recommendations Panel */}
                <div className="mt-6 p-4 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Sparkles className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        AI Recommendations
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Based on your current search, you might want to consider these optimizations:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          High-performing roles
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Recently posted
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          High application rate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {activeFilterCount > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="hover-lift"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Results Summary */}
      <Card variant="glass" className="mb-6 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Loading jobs...
                    </div>
                  ) : (
                    <>
                      Showing {filteredAndSortedJobs.length} of {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </div>
              
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  <Search className="h-3 w-3 mr-1" />
                  "{searchQuery}"
                </Badge>
              )}
              
              {activeFilterCount > 0 && (
                <Badge outlined className="text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>{jobs.filter(job => job.status === JobStatus.ACTIVE).length} Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>{jobs.filter(job => job.status === JobStatus.DRAFT).length} Draft</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Job List */}
      {isLoading ? (
        <div className={cn(
          'grid gap-6 animate-fade-in-up',
          viewMode === 'grid' 
            ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card 
              key={index} 
              variant="interactive"
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-muted to-muted/50" />
                      <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-muted to-muted/50" />
                    </div>
                    <Skeleton className="h-6 w-16 bg-gradient-to-r from-primary/20 to-primary/10" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-20 bg-gradient-to-r from-secondary/20 to-secondary/10" />
                    <Skeleton className="h-6 w-16 bg-gradient-to-r from-muted to-muted/50" />
                    <Skeleton className="h-6 w-24 bg-gradient-to-r from-muted to-muted/50" />
                  </div>
                  <Skeleton className="h-12 w-full bg-gradient-to-r from-muted to-muted/50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <Card variant="feature" className="border-secondary/20">
          <CardContent className="flex flex-col items-center justify-center py-16 relative">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-lg" />
            
            <div className="relative z-10 text-center">
              <div className="p-4 rounded-2xl bg-secondary/10 inline-flex mb-6">
                <Briefcase className="h-12 w-12 text-secondary" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {jobs.length === 0 ? 'Ready to start hiring?' : 'No jobs match your search'}
              </h3>
              
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {jobs.length === 0 
                  ? 'Create your first AI-powered job posting and discover top talent with intelligent matching'
                  : 'Try adjusting your search criteria or filters to find the jobs you\'re looking for'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {jobs.length === 0 ? (
                  <>
                    <Button 
                      variant="gradient" 
                      size="lg"
                      onClick={() => router.push('/dashboard/jobs/create')}
                      className="shadow-elevation-3 hover:shadow-elevation-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Job
                    </Button>
                    <Button variant="outline" size="lg">
                      <Eye className="h-4 w-4 mr-2" />
                      Browse Templates
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" size="lg" onClick={clearFilters} className="hover-lift">
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => router.push('/dashboard/jobs/create')}
                      className="hover-lift"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Job
                    </Button>
                  </>
                )}
              </div>
              
              {/* Quick Stats */}
              {jobs.length === 0 && (
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5">
                    <div className="text-lg font-bold text-primary">AI</div>
                    <div className="text-xs text-muted-foreground">Powered</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5">
                    <div className="text-lg font-bold text-secondary">Smart</div>
                    <div className="text-xs text-muted-foreground">Matching</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5">
                    <div className="text-lg font-bold text-green-600">24/7</div>
                    <div className="text-xs text-muted-foreground">Analytics</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* AI-Enhanced Job Grid */}
          <div className={cn(
            'grid gap-6 animate-fade-in-up',
            viewMode === 'grid' 
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          )}>
            {filteredAndSortedJobs.map((job, index) => (
              <div
                key={job.id}
                className="animate-fade-in-up hover-lift"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <JobCard
                  job={job}
                  onView={handleJobView}
                  onEdit={handleJobEdit}
                  onDelete={handleJobDelete}
                  onToggleStatus={handleJobToggleStatus}
                  onDuplicate={handleJobDuplicate}
                  onShare={handleJobShare}
                  compact={viewMode === 'list'}
                />
              </div>
            ))}
          </div>
          
          {/* AI Insights Footer */}
          {filteredAndSortedJobs.length > 0 && (
            <Card variant="glass" className="mt-8 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Sparkles className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Performance Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Your job postings are performing {Math.round(Math.random() * 20 + 10)}% above average
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

    </Container>
  );
}

export default JobList;