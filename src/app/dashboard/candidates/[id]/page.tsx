/**
 * Enterprise Candidate Profile Page
 * World-class candidate profile experience inspired by OpenAI, Salesforce, and Microsoft
 * Features modern design, intuitive navigation, and comprehensive candidate insights
 */

'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Edit, 
  Download, 
  Share2, 
  Archive, 
  ArrowLeft,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Target,
  FileText,
  Star,
  RefreshCw,
  Users,
  MessageSquare,
  TrendingUp,
  Zap,
  Code,
  Languages,
  Trophy,
  Sparkles,
  Activity,
  Bookmark,
  Send,
  X,
  Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { ProfileExtraction } from '@/components/candidates/profile-extraction';

import { 
  useCandidate, 
  useCandidateProfile,
  useDeleteCandidate
} from '@/hooks/candidates';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthGuard } from '@/components/auth/auth-guard';

// Enhanced interfaces for the modern experience
interface CandidateInsight {
  type: 'strength' | 'concern' | 'opportunity' | 'note';
  title: string;
  description: string;
  confidence?: number;
  timestamp: string;
}

interface AssessmentData {
  overallRating: number;
  jobFitScore: number;
  technicalSkills: number;
  communication: number;
  experience: number;
  cultural: number;
  strengths: string[];
  concerns: string[];
  interviewNotes: string;
  nextSteps: string[];
  insights: CandidateInsight[];
}

export default function CandidateProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <CandidateProfileContent />
    </AuthGuard>
  );
}

function CandidateProfileContent() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  // State management for modern experience
  const [activeTab, setActiveTab] = useState('overview');
  const [showExtraction, setShowExtraction] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    overallRating: 0,
    jobFitScore: 0,
    technicalSkills: 0,
    communication: 0,
    experience: 0,
    cultural: 0,
    strengths: [],
    concerns: [],
    interviewNotes: '',
    nextSteps: [],
    insights: []
  });

  // Data fetching
  const { data: candidate, isLoading, error, refetch } = useCandidate(candidateId);
  const { data: candidateProfile, isLoading: profileLoading } = useCandidateProfile(candidateId);
  const deleteCandidateMutation = useDeleteCandidate();

  // Enhanced candidate data with computed insights
  const candidateInsights = useMemo(() => {
    if (!candidate || !candidateProfile) return null;

    const profile = candidateProfile.profile_data || {};
    const experience = profile.work_experience || [];
    const education = profile.education || [];
    const skills = profile.skills || {};

    return {
      experienceLevel: experience.length > 5 ? 'Senior' : experience.length > 2 ? 'Mid-level' : 'Junior',
      totalExperience: experience.reduce((total: number, exp: any) => {
        const start = new Date(exp.start_date || '2020-01-01');
        const end = exp.is_current ? new Date() : new Date(exp.end_date || '2023-01-01');
        return total + (end.getFullYear() - start.getFullYear());
      }, 0),
      keySkills: [
        ...(skills.technical || []).map((skill: any) => typeof skill === 'string' ? skill : skill.name || skill),
        ...(skills.soft || []).map((skill: any) => typeof skill === 'string' ? skill : skill.name || skill),
        ...(skills.languages || []).map((lang: any) => typeof lang === 'string' ? lang : lang.language || lang.name || lang)
      ].filter(Boolean).slice(0, 6),
      education: education[0]?.degree || 'Not specified',
      strengths: profile.strengths || [],
      lastActive: candidate.updated_at,
      completeness: calculateProfileCompleteness(profile)
    };
  }, [candidate, candidateProfile]);

  // Loading states with modern skeleton
  if (isLoading || profileLoading) {
    return (
      <DashboardLayout title="Candidate Profile" className="max-w-none">
        <div className="space-y-6">
          <EnhancedLoadingSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !candidate) {
    return (
      <DashboardLayout title="Candidate Not Found" className="max-w-none">
        <EnhancedErrorState 
          onRetry={() => refetch()} 
          onBack={() => router.push('/dashboard/candidates')} 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={`${candidate.first_name} ${candidate.last_name}`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Candidates', href: '/dashboard/candidates' },
        { label: `${candidate.first_name} ${candidate.last_name}`, href: '#' }
      ]}
      className="max-w-none"
    >
      <div className="space-y-6">
        {/* Hero Header - OpenAI/Salesforce inspired */}
        <CandidateHeroSection 
          candidate={candidate}
          candidateProfile={candidateProfile}
          insights={candidateInsights}
          onBack={() => router.push('/dashboard/candidates')}
        />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <CandidateDetailTabs
              candidate={candidate}
              candidateProfile={candidateProfile}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              assessmentData={assessmentData}
              onAssessmentUpdate={setAssessmentData}
            />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <CandidateInsightsPanel 
              candidate={candidate}
              insights={candidateInsights}
              assessmentData={assessmentData}
            />
            
            <CandidateActionsPanel 
              candidate={candidate}
              onExtract={() => setShowExtraction(true)}
              onDelete={() => deleteCandidateMutation.mutate(candidateId)}
            />
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showExtraction && (
            <ProfileExtractionModal
              candidate={candidate}
              onClose={() => setShowExtraction(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// Helper function to calculate profile completeness
function calculateProfileCompleteness(profile: any): number {
  const fields = [
    profile.personal_info?.email,
    profile.personal_info?.phone,
    profile.personal_info?.location,
    profile.work_experience?.length > 0,
    profile.education?.length > 0,
    profile.skills?.technical?.length > 0,
    profile.summary
  ];
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Modern Hero Section Component - Salesforce/OpenAI inspired
function CandidateHeroSection({ 
  candidate, 
  candidateProfile, 
  insights, 
  onEdit, 
  onBack 
}: {
  candidate: any;
  candidateProfile: any;
  insights: any;
  onEdit?: () => void;
  onBack: () => void;
}) {
  const profile = candidateProfile?.profile_data || {};
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 border border-gray-200/60 shadow-lg"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600" />
      </div>

      <div className="relative p-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
          <div className="h-4 w-px bg-gray-300" />
          <Badge variant="outline" className="text-xs">
            {insights?.experienceLevel} Level
          </Badge>
        </div>

        <div className="flex items-start justify-between">
          {/* Profile Info */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <div className="absolute -bottom-1 -right-1">
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center",
                  candidate.processing_status === 'completed' ? 'bg-green-500' :
                  candidate.processing_status === 'processing' ? 'bg-yellow-500' :
                  candidate.processing_status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                )}>
                  {candidate.processing_status === 'completed' && <CheckCircle className="h-3 w-3 text-white" />}
                  {candidate.processing_status === 'processing' && <Clock className="h-3 w-3 text-white" />}
                  {candidate.processing_status === 'failed' && <AlertCircle className="h-3 w-3 text-white" />}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {candidate.first_name} {candidate.last_name}
                </h1>
                
                <div className="flex items-center gap-4 text-gray-600">
                  {profile.personal_info?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{profile.personal_info.email}</span>
                    </div>
                  )}
                  {profile.personal_info?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{profile.personal_info.phone}</span>
                    </div>
                  )}
                  {profile.personal_info?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{profile.personal_info.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {insights?.totalExperience}+ years experience
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {insights?.completeness}% complete profile
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Updated {new Date(candidate.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Skills Preview */}
              {insights?.keySkills && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {insights.keySkills.map((skill: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {onEdit && (
              <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Tabs Component - Microsoft/OpenAI inspired
function CandidateDetailTabs({ 
  candidate, 
  candidateProfile, 
  activeTab, 
  onTabChange, 
  assessmentData, 
  onAssessmentUpdate 
}: {
  candidate: any;
  candidateProfile: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  assessmentData: AssessmentData;
  onAssessmentUpdate: (data: AssessmentData) => void;
}) {
  const profile = candidateProfile?.profile_data || {};

  return (
    <Card className="border-0 shadow-lg">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <CardHeader className="pb-0">
          <TabsList className="grid w-full grid-cols-5 bg-gray-50 p-1 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Experience</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Assessment</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          <TabsContent value="overview" className="mt-0">
            <CandidateOverviewTab profile={profile} candidate={candidate} />
          </TabsContent>
          
          <TabsContent value="experience" className="mt-0">
            <CandidateExperienceTab profile={profile} />
          </TabsContent>
          
          <TabsContent value="skills" className="mt-0">
            <CandidateSkillsTab profile={profile} />
          </TabsContent>
          
          <TabsContent value="assessment" className="mt-0">
            <CandidateAssessmentTab 
              candidate={candidate}
              assessmentData={assessmentData}
              onUpdate={onAssessmentUpdate}
            />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            <CandidateDocumentsTab candidate={candidate} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

// Overview Tab Component
function CandidateOverviewTab({ profile, candidate: _candidate }: { profile: any; candidate: any }) {
  // Helper function to find current role with better logic
  const getCurrentRole = (workExperience: any[]) => {
    if (!workExperience || workExperience.length === 0) return null;
    
    // First, try to find a role explicitly marked as current
    let currentRole = workExperience.find((exp: any) => exp.is_current === true);
    
    // If no explicit current role, try the most recent role without an end date
    if (!currentRole) {
      currentRole = workExperience.find((exp: any) => !exp.end_date || exp.end_date === '');
    }
    
    // If still no current role, take the most recent role (first in the array assuming it's sorted)
    if (!currentRole) {
      // Sort by start_date descending to get the most recent
      const sortedExperience = [...workExperience].sort((a, b) => {
        const dateA = new Date(a.start_date || '1900-01-01');
        const dateB = new Date(b.start_date || '1900-01-01');
        return dateB.getTime() - dateA.getTime();
      });
      currentRole = sortedExperience[0];
    }
    
    return currentRole;
  };

  const currentRole = getCurrentRole(profile.work_experience || []);

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {profile.summary && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Professional Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
        </div>
      )}

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Personal Info */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.personal_info?.email && (
              <div className="flex items-center gap-3 min-w-0">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 break-all truncate" title={profile.personal_info.email}>
                  {profile.personal_info.email}
                </span>
              </div>
            )}
            {profile.personal_info?.phone && (
              <div className="flex items-center gap-3 min-w-0">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 break-all">{profile.personal_info.phone}</span>
              </div>
            )}
            {profile.personal_info?.location && (
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 break-words">{profile.personal_info.location}</span>
              </div>
            )}
            
            {/* Online Profiles */}
            {(profile.personal_info?.linkedin || 
              profile.personal_info?.github || 
              profile.personal_info?.portfolio_url || 
              profile.personal_info?.website || 
              profile.personal_info?.twitter || 
              profile.personal_info?.stackoverflow || 
              profile.personal_info?.behance || 
              profile.personal_info?.dribbble) && (
              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2">Online Profiles</div>
                <div className="space-y-2">
                  {profile.personal_info.linkedin && (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">in</span>
                      </div>
                      <a 
                        href={profile.personal_info.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.linkedin}
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {profile.personal_info.github && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Code className="h-3 w-3 text-gray-700 flex-shrink-0" />
                      <a 
                        href={profile.personal_info.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.github}
                      >
                        GitHub
                      </a>
                    </div>
                  )}
                  {profile.personal_info.portfolio_url && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="h-3 w-3 text-purple-600 flex-shrink-0" />
                      <a 
                        href={profile.personal_info.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.portfolio_url}
                      >
                        Portfolio
                      </a>
                    </div>
                  )}
                  {profile.personal_info.website && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <a 
                        href={profile.personal_info.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.website}
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {profile.personal_info.twitter && (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 bg-blue-400 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">T</span>
                      </div>
                      <a 
                        href={profile.personal_info.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.twitter}
                      >
                        Twitter
                      </a>
                    </div>
                  )}
                  {profile.personal_info.stackoverflow && (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">SO</span>
                      </div>
                      <a 
                        href={profile.personal_info.stackoverflow}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.stackoverflow}
                      >
                        StackOverflow
                      </a>
                    </div>
                  )}
                  {profile.personal_info.behance && (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">Be</span>
                      </div>
                      <a 
                        href={profile.personal_info.behance}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.behance}
                      >
                        Behance
                      </a>
                    </div>
                  )}
                  {profile.personal_info.dribbble && (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 bg-pink-500 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">Dr</span>
                      </div>
                      <a 
                        href={profile.personal_info.dribbble}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        title={profile.personal_info.dribbble}
                      >
                        Dribbble
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Education */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Latest Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.education?.[0] ? (
              <div className="space-y-2">
                <p className="font-medium text-gray-900 break-words">{profile.education[0].degree}</p>
                <p className="text-sm text-gray-600 break-words">{profile.education[0].institution}</p>
                <p className="text-xs text-gray-500">{profile.education[0].end_date}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No education information</p>
            )}
          </CardContent>
        </Card>

        {/* Current Role */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Current Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentRole ? (
              <div className="space-y-2">
                <p className="font-medium text-gray-900 break-words">
                  {currentRole.title}
                </p>
                <p className="text-sm text-gray-600 break-words">
                  {currentRole.company}
                </p>
                {currentRole.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 min-w-0">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="break-words">{currentRole.location}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {currentRole.is_current ? 'Current Position' : 'Most Recent Position'}
                </p>
                {currentRole.start_date && (
                  <p className="text-xs text-gray-500 break-words">
                    {currentRole.is_current || !currentRole.end_date 
                      ? `Started ${new Date(currentRole.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : `${new Date(currentRole.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(currentRole.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                    }
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No work experience available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Key Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.achievements.map((achievement: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Experience Tab Component
function CandidateExperienceTab({ profile }: { profile: any }) {
  const workExperience = profile.work_experience || [];

  return (
    <div className="space-y-6">
      {workExperience.length > 0 ? (
        workExperience.map((experience: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {experience.title}
                    </h3>
                    <p className="text-blue-600 font-medium mb-2">{experience.company}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {experience.start_date} - {experience.is_current ? 'Present' : experience.end_date}
                        </span>
                      </div>
                      {experience.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{experience.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {experience.is_current && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Current
                    </Badge>
                  )}
                </div>
                
                {experience.description && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{experience.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No work experience information available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Skills Tab Component
function CandidateSkillsTab({ profile }: { profile: any }) {
  const skills = profile.skills || {};

  return (
    <div className="space-y-6">
      {/* Technical Skills */}
      {skills.technical && skills.technical.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" />
              Technical Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                >
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Soft Skills */}
      {skills.soft && skills.soft.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Soft Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.soft.map((skill: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                >
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {skills.languages && skills.languages.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-purple-600" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.languages.map((language: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                >
                  {typeof language === 'string' ? language : language.language || language.name || language}
                  {typeof language === 'object' && language.proficiency && (
                    <span className="ml-1 text-xs opacity-75">({language.proficiency})</span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.certifications.map((cert: any, index: number) => (
                <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <h4 className="font-medium text-gray-900">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                  {cert.issue_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Issued: {cert.issue_date}
                      {cert.expiration_date && ` • Expires: ${cert.expiration_date}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!skills.technical?.length && !skills.soft?.length && !skills.languages?.length && !profile.certifications?.length) && (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No skills information available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Assessment Tab Component
function CandidateAssessmentTab({ 
  candidate: _candidate, 
  assessmentData, 
  onUpdate 
}: { 
  candidate: any; 
  assessmentData: AssessmentData; 
  onUpdate: (data: AssessmentData) => void; 
}) {
  const [newNote, setNewNote] = useState('');

  const updateRating = (field: keyof AssessmentData, value: number) => {
    onUpdate({ ...assessmentData, [field]: value });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const insight: CandidateInsight = {
      type: 'note',
      title: 'Recruiter Note',
      description: newNote,
      timestamp: new Date().toISOString()
    };
    
    onUpdate({
      ...assessmentData,
      insights: [...assessmentData.insights, insight]
    });
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Rating Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Skill Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RatingInput
              label="Technical Skills"
              value={assessmentData.technicalSkills}
              onChange={(value) => updateRating('technicalSkills', value)}
            />
            <RatingInput
              label="Communication"
              value={assessmentData.communication}
              onChange={(value) => updateRating('communication', value)}
            />
            <RatingInput
              label="Experience Level"
              value={assessmentData.experience}
              onChange={(value) => updateRating('experience', value)}
            />
            <RatingInput
              label="Cultural Fit"
              value={assessmentData.cultural}
              onChange={(value) => updateRating('cultural', value)}
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RatingInput
              label="Overall Rating"
              value={assessmentData.overallRating}
              onChange={(value) => updateRating('overallRating', value)}
              size="large"
            />
            <RatingInput
              label="Job Fit Score"
              value={assessmentData.jobFitScore}
              onChange={(value) => updateRating('jobFitScore', value)}
              size="large"
            />
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Notes & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add your notes and observations..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1"
              rows={3}
            />
            <Button onClick={addNote} className="self-start">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {assessmentData.insights.length > 0 && (
            <div className="space-y-3 mt-6">
              <h4 className="font-medium text-gray-900">Previous Notes</h4>
              {assessmentData.insights.map((insight, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{insight.title}</h5>
                      <p className="text-gray-700 mt-1">{insight.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(insight.timestamp).toLocaleDateString()}
                    </span>
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

// Documents Tab Component
function CandidateDocumentsTab({ candidate }: { candidate: any }) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <div>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Document management coming soon</p>
              <p className="text-sm text-gray-500 mt-1">
                Original filename: {candidate.original_filename || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Rating Input Component
function RatingInput({ 
  label, 
  value, 
  onChange, 
  size = 'normal' 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void; 
  size?: 'normal' | 'large'; 
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}/10</span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={cn(
              "transition-colors rounded-full border-2",
              size === 'large' ? "h-8 w-8" : "h-6 w-6",
              rating <= value
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-300 hover:border-blue-300"
            )}
          >
            <span className="sr-only">{rating}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Insights Panel Component
function CandidateInsightsPanel({ 
  candidate: _candidate, 
  insights, 
  assessmentData 
}: { 
  candidate: any; 
  insights: any; 
  assessmentData: AssessmentData; 
}) {
  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Completeness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
            <span className="text-sm text-gray-500">{insights?.completeness}%</span>
          </div>
          <Progress value={insights?.completeness || 0} className="h-2" />
        </div>

        {/* Experience Level */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Experience Level</span>
          </div>
          <p className="text-sm text-blue-800">{insights?.experienceLevel}</p>
          <p className="text-xs text-blue-600 mt-1">
            {insights?.totalExperience} years total experience
          </p>
        </div>

        {/* Key Strengths */}
        {insights?.strengths && insights.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Key Strengths</h4>
            <div className="space-y-1">
              {insights.strengths.slice(0, 3).map((strength: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">AI Recommendation</span>
          </div>
          <p className="text-sm text-green-800">
            Strong candidate for technical roles. Consider for senior positions based on experience.
          </p>
        </div>

        {/* Overall Score */}
        {assessmentData.overallRating > 0 && (
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {assessmentData.overallRating}/10
            </div>
            <p className="text-sm text-gray-600">Overall Assessment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Actions Panel Component
function CandidateActionsPanel({ 
  candidate: _candidate, 
  onExtract, 
  onDelete 
}: { 
  candidate: any; 
  onExtract: () => void; 
  onDelete: () => void; 
}) {
  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onExtract} 
          className="w-full justify-start bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Re-extract Profile
        </Button>
        
        <Button variant="outline" className="w-full justify-start">
          <Download className="h-4 w-4 mr-2" />
          Download CV
        </Button>
        
        <Button variant="outline" className="w-full justify-start">
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </Button>

        <Button variant="outline" className="w-full justify-start">
          <Bookmark className="h-4 w-4 mr-2" />
          Add to Shortlist
        </Button>

        <Separator />

        <Button 
          variant="outline" 
          onClick={onDelete}
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
        >
          <Archive className="h-4 w-4 mr-2" />
          Archive Candidate
        </Button>
      </CardContent>
    </Card>
  );
}

// Profile Extraction Modal Component
function ProfileExtractionModal({ 
  candidate, 
  onClose 
}: { 
  candidate: any; 
  onClose: () => void; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Profile Extraction</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <ProfileExtraction candidate={candidate} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Loading Skeleton
function EnhancedLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Skeleton */}
      <div className="rounded-2xl bg-gray-100 p-8 animate-pulse">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Enhanced Error State
function EnhancedErrorState({ 
  onRetry, 
  onBack 
}: { 
  onRetry: () => void; 
  onBack: () => void; 
}) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Not Found</h2>
      <p className="text-gray-600 mb-6">
        The candidate you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}