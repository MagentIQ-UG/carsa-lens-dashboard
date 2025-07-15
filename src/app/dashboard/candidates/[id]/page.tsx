/**
 * Candidate Detail Page
 * Individual candidate profile view with comprehensive information
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Target,
  FileText,
  ExternalLink,
  Linkedin,
  Github,
  Star,
  RefreshCw,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { ProfileExtraction } from '@/components/candidates/profile-extraction';

import { 
  useCandidate, 
  useCandidateProfile,
  useDeleteCandidate,
  formatProcessingStatus,
  formatCandidateSource,
  getStatusColor,
  getSourceColor
} from '@/hooks/candidates';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthGuard } from '@/components/auth/auth-guard';

import { 
  ProcessingStatus
} from '@/types/api';

export default function CandidateDetailPage() {
  return (
    <AuthGuard requireAuth={true}>
      <CandidateDetailContent />
    </AuthGuard>
  );
}

function CandidateDetailContent() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [showExtraction, setShowExtraction] = useState(false);
  const [recruiterNotes, setRecruiterNotes] = useState({
    overallRating: 0,
    jobFitScore: 0,
    strengths: '',
    concerns: '',
    interviewNotes: ''
  });

  const { data: candidate, isLoading, error, refetch } = useCandidate(candidateId);
  const { data: candidateProfile, isLoading: profileLoading } = useCandidateProfile(candidateId);
  const deleteCandidateMutation = useDeleteCandidate();

  const handleSaveAssessment = () => {
    // For now, we'll just show a success message and save to localStorage
    // In a real application, this would save to the backend
    localStorage.setItem(`recruiter-notes-${candidateId}`, JSON.stringify(recruiterNotes));
    alert('Assessment saved successfully!');
  };

  const handleExportNotes = () => {
    const exportData = {
      candidate: `${candidate?.first_name} ${candidate?.last_name}`,
      candidateId,
      assessmentDate: new Date().toISOString(),
      ...recruiterNotes
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-${candidate?.first_name}-${candidate?.last_name}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`recruiter-notes-${candidateId}`);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setRecruiterNotes(parsedNotes);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
      }
    }
  }, [candidateId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      try {
        await deleteCandidateMutation.mutateAsync(candidateId);
        router.push('/dashboard/candidates');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  const formatDateRange = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
    if (!startDate) return '';
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    if (isCurrent) return `${start} - Present`;
    if (!endDate) return start;
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    return `${start} - ${end}`;
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Candidates', href: '/dashboard/candidates' },
    { label: candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Loading...', href: `/dashboard/candidates/${candidateId}`, current: true }
  ];

  if (isLoading || profileLoading) {
    return (
      <DashboardLayout title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !candidate) {
    return (
      <DashboardLayout title="Not Found" breadcrumbs={breadcrumbs}>
        <Card variant="alert" className="border-red-200">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Candidate not found</h3>
            <p className="text-red-700 mb-4">
              The candidate you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/dashboard/candidates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (showExtraction) {
    return (
      <DashboardLayout title="AI Profile Extraction" breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowExtraction(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Profile Extraction</h1>
              <p className="text-gray-600">
                Processing profile for {candidate.first_name} {candidate.last_name}
              </p>
            </div>
          </div>
          
          <ProfileExtraction
            candidate={candidate}
            onExtractionComplete={(_updatedCandidate) => {
              setShowExtraction(false);
              refetch();
            }}
            autoStart={true}
          />
        </div>
      </DashboardLayout>
    );
  }


  // Use profile data from the dedicated profile endpoint if available, otherwise fall back to candidate.profile_data
  const profileData = candidateProfile?.profile_data || candidate.profile_data;
  const personalInfo = profileData?.personal_info;
  const workExperience = profileData?.work_experience || [];
  const education = profileData?.education || [];
  const skills = profileData?.skills;
  const certifications = profileData?.certifications || [];
  const projects = profileData?.projects || [];
  
  // Debug profile data in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔍 Profile data debug:', {
      candidateProfile,
      candidateProfileData: candidate.profile_data,
      finalProfileData: profileData,
      personalInfo,
      workExperience,
      education,
      skills,
      certifications,
      projects
    });
  }

  return (
    <DashboardLayout title={`${candidate.first_name} ${candidate.last_name}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/candidates')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate.first_name} {candidate.last_name}
              </h1>
              <p className="text-gray-600">Candidate Profile</p>
            </div>
          </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExtraction(true)}
            disabled={candidate.processing_status === ProcessingStatus.PROCESSING}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Re-extract
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/api/candidates/${candidate.id}/cv`, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CV
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card variant="feature" className="border-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                  {getInitials(candidate.first_name, candidate.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {candidate.first_name} {candidate.last_name}
                </h2>
                
                {workExperience.find((exp: any) => exp.is_current || (!exp.end_date && exp.start_date)) && (
                  <p className="text-lg text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {(workExperience.find((exp: any) => exp.is_current || (!exp.end_date && exp.start_date))?.position || 
                      workExperience.find((exp: any) => exp.is_current || (!exp.end_date && exp.start_date))?.title)} at{' '}
                    {workExperience.find((exp: any) => exp.is_current || (!exp.end_date && exp.start_date))?.company}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {personalInfo?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {personalInfo.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Added {new Date(candidate.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <Badge className={cn('text-xs', getStatusColor(candidate.processing_status))}>
                  {getStatusIcon(candidate.processing_status)}
                  <span className="ml-1">{formatProcessingStatus(candidate.processing_status)}</span>
                </Badge>
                <Badge className={cn('text-xs', getSourceColor(candidate.source))}>
                  {formatCandidateSource(candidate.source)}
                </Badge>
              </div>
              
              {candidate.confidence_score && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>Confidence: {Math.round(candidate.confidence_score * 100)}%</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                      style={{ width: `${candidate.confidence_score * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Data Source Indicator */}
      <Card variant="glass" className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">CV-Extracted Profile Data</span>
            </div>
            <div className="h-4 w-px bg-blue-200" />
            <span className="text-xs text-blue-700">
              This information was automatically extracted from the candidate's CV and is read-only to maintain data integrity.
            </span>
            <div className="ml-auto">
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                <Brain className="h-3 w-3 mr-1" />
                AI Extracted
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Basic Info */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(personalInfo?.email || candidate.email) && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${personalInfo?.email || candidate.email}`} className="text-blue-600 hover:text-blue-800">
                    {personalInfo?.email || candidate.email}
                  </a>
                </div>
              )}
              {(personalInfo?.phone || candidate.phone) && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${personalInfo?.phone || candidate.phone}`} className="text-blue-600 hover:text-blue-800">
                    {personalInfo?.phone || candidate.phone}
                  </a>
                </div>
              )}
              {(personalInfo?.location || candidate.location) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{personalInfo?.location || candidate.location}</span>
                </div>
              )}
              {personalInfo?.linkedin && (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                  <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    LinkedIn Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {personalInfo?.github && (
                <div className="flex items-center gap-3">
                  <Github className="h-4 w-4 text-gray-400" />
                  <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    GitHub Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {skills && (skills.technical?.length || skills.soft?.length || skills.languages?.length) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Skills & Competencies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.technical && skills.technical.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.technical.map((skill: any, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {typeof skill === 'string' ? skill : skill.name}
                          {skill.level && ` (${skill.level})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {skills.soft && skills.soft.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.soft.map((skill: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {typeof skill === 'string' ? skill : skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {skills.languages && skills.languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.languages.map((lang: any, index: number) => (
                        <Badge key={index} variant="ghost" className="text-xs">
                          {typeof lang === 'string' ? lang : lang.language}
                          {lang.proficiency && ` (${lang.proficiency})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {skills.tools && skills.tools.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tools & Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.tools.map((tool: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {typeof tool === 'string' ? tool : tool.name}
                          {tool.level && ` (${tool.level})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map((cert: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuer || cert.issuing_organization}</p>
                      {cert.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Issued: {new Date(cert.date).toLocaleDateString()}
                          {cert.expiry && (
                            <span> • Expires: {new Date(cert.expiry).toLocaleDateString()}</span>
                          )}
                        </p>
                      )}
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                        >
                          View Credential
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Key Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-primary font-medium">{project.role}</p>
                      {project.description && (
                        <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                        >
                          View Project
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Experience & Education */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          {profileData?.summary ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{profileData.summary}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="mb-2">No professional summary available</p>
                  <p className="text-sm">
                    Profile data will be available after CV processing is complete
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowExtraction(true)}
                    className="mt-3"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Extract Profile Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workExperience.length > 0 ? (
                <div className="space-y-6">
                  {workExperience.map((exp: any, index: number) => (
                    <div key={index} className="relative">
                      {index > 0 && <div className="absolute left-4 -top-3 w-0.5 h-3 bg-gray-200" />}
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{exp.position || exp.title}</h4>
                              <p className="text-primary font-medium">{exp.company}</p>
                              {exp.location && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {exp.location}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateRange(exp.start_date, exp.end_date, !exp.end_date)}
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="mb-2">No work experience available</p>
                  <p className="text-sm">
                    Work experience will be extracted from the CV automatically
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {education.length > 0 ? (
                <div className="space-y-6">
                  {education.map((edu: any, index: number) => (
                    <div key={index} className="relative">
                      {index > 0 && <div className="absolute left-4 -top-3 w-0.5 h-3 bg-gray-200" />}
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                              {edu.field_of_study && (
                                <p className="text-primary font-medium">{edu.field_of_study}</p>
                              )}
                              <p className="text-gray-600">{edu.institution}</p>
                              {edu.location && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {edu.location}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateRange(edu.start_date, edu.graduation_date || edu.end_date)}
                            </div>
                          </div>
                          {edu.gpa && (
                            <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>
                          )}
                          {edu.description && (
                            <p className="text-gray-700 mt-2">{edu.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="mb-2">No education information available</p>
                  <p className="text-sm">
                    Education details will be extracted from the CV automatically
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          {profileData?.achievements && profileData.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Key Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profileData.achievements.map((achievement: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recruiter Assessment Section */}
      <Card variant="elevated" className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-amber-600" />
            Recruiter Assessment & Notes
            <Badge variant="outline" className="ml-2 text-xs border-amber-200 text-amber-700">
              Editable
            </Badge>
          </CardTitle>
          <p className="text-sm text-amber-700">
            Add your evaluation notes, interview feedback, and assessment comments. This section is separate from the CV-extracted data.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Overall Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRecruiterNotes(prev => ({ ...prev, overallRating: star }))}
                      className={`transition-colors ${
                        star <= recruiterNotes.overallRating
                          ? 'text-amber-400' 
                          : 'text-gray-300 hover:text-amber-400'
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {recruiterNotes.overallRating > 0 ? `${recruiterNotes.overallRating}/5` : 'Click to rate'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Job Fit Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 cursor-pointer"
                       onClick={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const x = e.clientX - rect.left;
                         const percentage = Math.round((x / rect.width) * 100);
                         setRecruiterNotes(prev => ({ ...prev, jobFitScore: Math.max(0, Math.min(100, percentage)) }));
                       }}>
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-200" 
                         style={{ width: `${recruiterNotes.jobFitScore}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600">{recruiterNotes.jobFitScore}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click to adjust fit score</p>
              </CardContent>
            </Card>
          </div>

          {/* Notes Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Strengths & Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={recruiterNotes.strengths}
                  onChange={(e) => setRecruiterNotes(prev => ({ ...prev, strengths: e.target.value }))}
                  className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Note key strengths, impressive achievements, and positive highlights..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Concerns & Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={recruiterNotes.concerns}
                  onChange={(e) => setRecruiterNotes(prev => ({ ...prev, concerns: e.target.value }))}
                  className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Note any concerns, skill gaps, or areas that need clarification..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Interview Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Interview Notes & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={recruiterNotes.interviewNotes}
                onChange={(e) => setRecruiterNotes(prev => ({ ...prev, interviewNotes: e.target.value }))}
                className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Record interview observations, responses to questions, cultural fit assessment, and next steps..."
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-200">
            <div className="text-sm text-gray-600">
              Assessment notes are private and visible only to your recruiting team.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportNotes}>
                <Download className="h-4 w-4 mr-2" />
                Export Notes
              </Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveAssessment}>
                <Download className="h-4 w-4 mr-2" />
                Save Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: {new Date(candidate.updated_at).toLocaleString()}
              </div>
              {candidate.ai_provider && (
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  {candidate.ai_provider}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/dashboard/candidates/${candidate.id}/share`, '_blank')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
                disabled={deleteCandidateMutation.isPending}
              >
                {deleteCandidateMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Archive className="h-4 w-4 mr-2" />
                )}
                Delete Candidate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}