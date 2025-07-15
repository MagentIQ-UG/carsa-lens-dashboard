/**
 * Pipeline Board Component
 * Kanban-style candidate pipeline management with drag-and-drop
 * AI-powered insights and real-time status updates
 */

'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Clock,
  Target,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  MapPin,
  Calendar,
  Briefcase,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { 
  useCandidates,
  useCandidateStats,
  useUpdateCandidate
} from '@/hooks/candidates';
import { cn } from '@/lib/utils';

import { 
  ProcessingStatus,
  type CandidateResponse 
} from '@/types/api';

interface PipelineBoardProps {
  jobId?: string;
  onCandidateSelect?: (candidate: CandidateResponse) => void;
  onCandidateEdit?: (candidate: CandidateResponse) => void;
  className?: string;
}

interface PipelineColumn {
  id: ProcessingStatus;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  candidates: CandidateResponse[];
}

interface DraggableCandidateProps {
  candidate: CandidateResponse;
  onSelect?: (candidate: CandidateResponse) => void;
  onEdit?: (candidate: CandidateResponse) => void;
}

function DraggableCandidate({ 
  candidate, 
  onSelect, 
  onEdit
}: DraggableCandidateProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  const currentPosition = candidate.profile_data?.work_experience?.find(exp => exp.is_current);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-move hover:shadow-lg transition-all duration-200',
        isDragging && 'shadow-xl scale-105'
      )}
      variant="interactive"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={candidate.profile_data?.personal_info?.linkedin || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                {getInitials(candidate.first_name, candidate.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-gray-900 text-sm">
                {candidate.first_name} {candidate.last_name}
              </h4>
              {currentPosition && (
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {currentPosition.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(candidate);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(candidate);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {candidate.profile_data?.personal_info?.location && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              {candidate.profile_data.personal_info.location}
            </div>
          )}
          
          {candidate.profile_data?.personal_info?.email && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="h-3 w-3" />
              {candidate.profile_data.personal_info.email}
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            Added {formatTimeAgo(candidate.created_at)}
          </div>
        </div>

        {/* Skills Preview */}
        {candidate.profile_data?.skills?.technical && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {candidate.profile_data.skills.technical.slice(0, 3).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.profile_data.skills.technical.length > 3 && (
                <Badge variant="ghost" className="text-xs">
                  +{candidate.profile_data.skills.technical.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {candidate.confidence_score && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Target className="h-3 w-3" />
              Confidence: {Math.round(candidate.confidence_score * 100)}%
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${candidate.confidence_score * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PipelineBoard({ 
  jobId, 
  onCandidateSelect, 
  onCandidateEdit, 
  className 
}: PipelineBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<ProcessingStatus | ''>('');
  const [, setActiveId] = useState<string | null>(null);
  const [draggedCandidate, setDraggedCandidate] = useState<CandidateResponse | null>(null);

  const { 
    data: candidatesData, 
    isLoading, 
    refetch 
  } = useCandidates({
    search: searchTerm || undefined,
    job_id: jobId || undefined,
    limit: 100
  });

  const { data: stats } = useCandidateStats();
  const updateCandidateMutation = useUpdateCandidate();

  const candidates = candidatesData?.items || [];

  // Define pipeline columns
  const columns: PipelineColumn[] = [
    {
      id: ProcessingStatus.PENDING,
      title: 'Pending',
      description: 'Candidates awaiting processing',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border-yellow-200',
      icon: <Clock className="h-4 w-4" />,
      candidates: candidates.filter((c: CandidateResponse) => c.processing_status === ProcessingStatus.PENDING)
    },
    {
      id: ProcessingStatus.PROCESSING,
      title: 'Processing',
      description: 'AI extraction in progress',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      candidates: candidates.filter((c: CandidateResponse) => c.processing_status === ProcessingStatus.PROCESSING)
    },
    {
      id: ProcessingStatus.COMPLETED,
      title: 'Completed',
      description: 'Ready for evaluation',
      color: 'text-green-700',
      bgColor: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="h-4 w-4" />,
      candidates: candidates.filter((c: CandidateResponse) => c.processing_status === ProcessingStatus.COMPLETED)
    },
    {
      id: ProcessingStatus.FAILED,
      title: 'Failed',
      description: 'Processing errors',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="h-4 w-4" />,
      candidates: candidates.filter((c: CandidateResponse) => c.processing_status === ProcessingStatus.FAILED)
    }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const candidate = candidates.find((c: CandidateResponse) => c.id === active.id);
    setDraggedCandidate(candidate || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const candidateId = active.id as string;
    const newStatus = over.id as ProcessingStatus;
    
    // Find the candidate
    const candidate = candidates.find((c: CandidateResponse) => c.id === candidateId);
    if (!candidate) return;
    
    // If status hasn't changed, do nothing
    if (candidate.processing_status === newStatus) return;
    
    try {
      // Update candidate status
      await updateCandidateMutation.mutateAsync({
        candidateId,
        data: {
          processing_status: newStatus,
        }
      });
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Failed to update candidate status:', error);
    }
    
    setActiveId(null);
    setDraggedCandidate(null);
  };


  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card variant="feature" className="border-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  Candidate Pipeline
                  <Activity className="h-6 w-6 text-purple-600 inline ml-2 animate-pulse" />
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Drag & drop candidates to manage their processing status
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
                onClick={() => window.open('/dashboard/candidates/upload', '_blank')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidates
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {columns.map((column) => (
            <Card key={column.id} variant="glass" className="backdrop-blur-sm hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{column.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {column.candidates.length}
                    </p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', column.bgColor)}>
                    <div className={column.color}>
                      {column.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value as ProcessingStatus | '')}
                options={[
                  { value: '', label: 'All Columns' },
                  ...columns.map(column => ({
                    value: column.id,
                    label: column.title
                  }))
                ]}
                className="w-40"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/dashboard/candidates/analytics', '_blank')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <Card key={column.id} className={cn('h-fit', column.bgColor)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={column.color}>
                      {column.icon}
                    </div>
                    <div>
                      <h3 className={cn('font-semibold', column.color)}>
                        {column.title}
                      </h3>
                      <p className="text-xs text-gray-600">{column.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {column.candidates.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={column.candidates.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[200px]">
                    {column.candidates
                      .filter(candidate => {
                        const matchesSearch = !searchTerm || 
                          `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          candidate.profile_data?.personal_info?.email?.toLowerCase().includes(searchTerm.toLowerCase());
                        return matchesSearch;
                      })
                      .map((candidate) => (
                        <DraggableCandidate
                          key={candidate.id}
                          candidate={candidate}
                          onSelect={onCandidateSelect}
                          onEdit={onCandidateEdit}
                        />
                      ))}
                    
                    {column.candidates.filter(candidate => {
                      const matchesSearch = !searchTerm || 
                        `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        candidate.profile_data?.personal_info?.email?.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesSearch;
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className={cn('w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center', column.bgColor)}>
                          <div className={column.color}>
                            {column.icon}
                          </div>
                        </div>
                        <p className="text-sm">No candidates</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedCandidate && (
            <DraggableCandidate
              candidate={draggedCandidate}
              onSelect={onCandidateSelect}
              onEdit={onCandidateEdit}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {candidates.length === 0 && !isLoading && (
        <Card variant="ghost" className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates in pipeline</h3>
            <p className="text-gray-600 mb-6">
              Start by uploading CVs to build your candidate pipeline
            </p>
            <Button onClick={() => window.open('/dashboard/candidates/upload', '_blank')}>
              <Plus className="h-4 w-4 mr-2" />
              Upload CVs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading candidate pipeline...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PipelineBoard;