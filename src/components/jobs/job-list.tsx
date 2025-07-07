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
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useCallback } from 'react';

import { JobCard } from '@/components/jobs/job-card';
import { JobWizard } from '@/components/jobs/job-wizard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const [showWizard, setShowWizard] = useState(false);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and recruitment pipeline
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || filteredAndSortedJobs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Search and View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs by title, department, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search jobs"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'relative',
                  activeFilterCount > 0 && 'bg-blue-50 border-blue-200'
                )}
                aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
                aria-expanded={showFilters}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="primary" 
                    size="sm" 
                    className="ml-2 px-1.5 py-0.5 text-xs"
                    aria-label={`${activeFilterCount} active filters`}
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              
              <div className="flex border border-gray-200 rounded-md" role="group" aria-label="View mode">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l-0"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh jobs"
              >
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
                      options={JOB_STATUS_OPTIONS}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as JobType | '')}
                      options={JOB_TYPE_OPTIONS}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      options={DEPARTMENT_OPTIONS}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort by
                    </label>
                    <Select
                      value={`${sortField}-${sortOrder}`}
                      onChange={(e) => handleSortChange(e.target.value)}
                      options={SORT_OPTIONS}
                    />
                  </div>
                </div>
                
                {activeFilterCount > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
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

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {isLoading ? (
              <LoadingSpinner size="sm" className="inline mr-2" />
            ) : (
              <>
                Showing {filteredAndSortedJobs.length} of {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </>
            )}
          </span>
          
          {searchQuery && (
            <Badge outlined size="sm">
              Search: "{searchQuery}"
            </Badge>
          )}
        </div>
      </div>

      {/* Job List */}
      {isLoading ? (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid' 
            ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {jobs.length === 0 ? 'No jobs yet' : 'No jobs match your filters'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {jobs.length === 0 
                ? 'Get started by creating your first job posting'
                : 'Try adjusting your search criteria or filters'
              }
            </p>
            {jobs.length === 0 ? (
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Job
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid' 
            ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {filteredAndSortedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={handleJobView}
              onEdit={handleJobEdit}
              onDelete={handleJobDelete}
              onToggleStatus={handleJobToggleStatus}
              onDuplicate={handleJobDuplicate}
              onShare={handleJobShare}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      {/* Job Creation Wizard */}
      <JobWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </Container>
  );
}

export default JobList;