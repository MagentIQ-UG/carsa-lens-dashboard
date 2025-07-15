/**
 * Candidate Card Component
 * Professional candidate profile card with AI-powered insights and actions
 * Features expandable details, skills visualization, and quick actions
 */

'use client';

import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Download,
  Award,
  Clock,
  Linkedin,
  Github,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { 
  formatProcessingStatus,
  formatCandidateSource,
  getStatusColor,
  getSourceColor
} from '@/hooks/candidates';
import { cn } from '@/lib/utils';

import { 
  ProcessingStatus,
  type CandidateResponse,
  type WorkExperience
} from '@/types/api';

interface CandidateCardProps {
  candidate: CandidateResponse;
  onView?: (candidate: CandidateResponse) => void;
  onEdit?: (candidate: CandidateResponse) => void;
  onDelete?: (candidateId: string) => void;
  onSelect?: (candidateId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
  expandable?: boolean;
  showSkills?: boolean;
  showExperience?: boolean;
  className?: string;
}

export function CandidateCard({
  candidate,
  onView,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
  showActions = true,
  expandable = true,
  showSkills = true,
  showExperience = true,
  className
}: CandidateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  const getExperienceYears = (experience?: WorkExperience[]) => {
    if (!experience?.length) return 0;
    
    const totalMonths = experience.reduce((acc, exp) => {
      const start = new Date(exp.start_date);
      const end = exp.end_date ? new Date(exp.end_date) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
      return acc + months;
    }, 0);
    
    return Math.floor(totalMonths / 12);
  };

  const profileData = candidate.profile_data;
  const personalInfo = profileData?.personal_info;
  const workExperience = profileData?.work_experience || [];
  const education = profileData?.education || [];
  const skills = profileData?.skills;
  const certifications = profileData?.certifications || [];

  const experienceYears = getExperienceYears(workExperience);
  const currentPosition = workExperience.find(exp => exp.is_current);

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary border-primary',
        className
      )}
      variant={isSelected ? 'interactive' : 'default'}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(candidate.id)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            
            <Avatar className="h-12 w-12">
              <AvatarImage src={personalInfo?.linkedin || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(candidate.first_name, candidate.last_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {candidate.first_name} {candidate.last_name}
                </h3>
                {candidate.confidence_score && candidate.confidence_score > 0.8 && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    <Sparkles className="h-3 w-3 mr-1" />
                    High Confidence
                  </Badge>
                )}
              </div>
              
              {currentPosition && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {currentPosition.title} at {currentPosition.company}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                {personalInfo?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {personalInfo.location}
                  </span>
                )}
                {experienceYears > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {experienceYears} years exp
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Added {new Date(candidate.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView?.(candidate)}
                title="View Profile"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(candidate)}
                title="Edit Profile"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(candidate.id)}
                className="text-red-600 hover:text-red-700"
                title="Delete Candidate"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Status and Source */}
        <div className="flex items-center gap-2 mb-4">
          <Badge className={cn('text-xs', getStatusColor(candidate.processing_status))}>
            {getStatusIcon(candidate.processing_status)}
            <span className="ml-1">{formatProcessingStatus(candidate.processing_status)}</span>
          </Badge>
          <Badge className={cn('text-xs', getSourceColor(candidate.source))}>
            {formatCandidateSource(candidate.source)}
          </Badge>
          {candidate.ai_provider && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {candidate.ai_provider}
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {personalInfo?.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${personalInfo.email}`} className="hover:text-primary">
                {personalInfo.email}
              </a>
            </div>
          )}
          {personalInfo?.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${personalInfo.phone}`} className="hover:text-primary">
                {personalInfo.phone}
              </a>
            </div>
          )}
          {personalInfo?.linkedin && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Linkedin className="h-4 w-4" />
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                LinkedIn Profile
              </a>
            </div>
          )}
          {personalInfo?.github && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Github className="h-4 w-4" />
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                GitHub Profile
              </a>
            </div>
          )}
        </div>

        {/* Skills Preview */}
        {showSkills && skills && (skills.technical?.length || skills.soft?.length) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {skills.technical?.slice(0, 3).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.soft?.slice(0, 2).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {(skills.technical?.length || 0) + (skills.soft?.length || 0) > 5 && (
                <Badge variant="ghost" className="text-xs">
                  +{(skills.technical?.length || 0) + (skills.soft?.length || 0) - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        {expandable && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between p-2 h-8"
            >
              <span className="text-sm">
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {isExpanded && (
              <div className="mt-4 space-y-4 border-t pt-4">
                {/* Summary */}
                {profileData?.summary && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-sm text-gray-600">{profileData.summary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {showExperience && workExperience.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Work Experience
                    </h4>
                    <div className="space-y-2">
                      {workExperience.slice(0, 3).map((exp, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-gray-900">{exp.title}</div>
                          <div className="text-gray-600">{exp.company}</div>
                          <div className="text-xs text-gray-500">
                            {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                          </div>
                        </div>
                      ))}
                      {workExperience.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{workExperience.length - 3} more positions
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      Education
                    </h4>
                    <div className="space-y-2">
                      {education.slice(0, 2).map((edu, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-gray-900">{edu.degree}</div>
                          <div className="text-gray-600">{edu.institution}</div>
                          {edu.field_of_study && (
                            <div className="text-xs text-gray-500">{edu.field_of_study}</div>
                          )}
                        </div>
                      ))}
                      {education.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{education.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Certifications
                    </h4>
                    <div className="space-y-1">
                      {certifications.slice(0, 3).map((cert, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-gray-900">{cert.name}</div>
                          <div className="text-xs text-gray-500">{cert.issuing_organization}</div>
                        </div>
                      ))}
                      {certifications.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{certifications.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* All Skills */}
                {skills && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">All Skills</h4>
                    <div className="space-y-2">
                      {skills.technical && skills.technical.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Technical</div>
                          <div className="flex flex-wrap gap-1">
                            {skills.technical.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {skills.soft && skills.soft.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Soft Skills</div>
                          <div className="flex flex-wrap gap-1">
                            {skills.soft.map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {skills.languages && skills.languages.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Languages</div>
                          <div className="flex flex-wrap gap-1">
                            {skills.languages.map(lang => (
                              <Badge key={lang} variant="ghost" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(candidate)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(candidate)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Download CV functionality
              window.open(`/api/candidates/${candidate.id}/cv`, '_blank');
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CandidateCard;