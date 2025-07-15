/**
 * Profile Editor Component
 * Comprehensive candidate profile editing with real-time validation
 * Modern form with sections for personal info, experience, education, skills, and certifications
 */

'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Target,
  Plus,
  Minus,
  Save,
  X,
  Edit,
  Eye,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Database,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';

import { useUpdateCandidate } from '@/hooks/candidates';
import { cn } from '@/lib/utils';

import { 
  type CandidateResponse
} from '@/types/api';

// Validation schemas
const PersonalInfoSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  stackoverflow: z.string().url('Invalid StackOverflow URL').optional().or(z.literal('')),
  behance: z.string().url('Invalid Behance URL').optional().or(z.literal('')),
  dribbble: z.string().url('Invalid Dribbble URL').optional().or(z.literal('')),
});

const WorkExperienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional().or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  is_current: z.boolean().default(false),
});

const EducationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  field_of_study: z.string().optional().or(z.literal('')),
  institution: z.string().min(1, 'Institution is required'),
  location: z.string().optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  gpa: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

const CertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuing_organization: z.string().min(1, 'Issuing organization is required'),
  issue_date: z.string().optional().or(z.literal('')),
  expiration_date: z.string().optional().or(z.literal('')),
  credential_id: z.string().optional().or(z.literal('')),
  credential_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const ProfileSchema = z.object({
  personal_info: PersonalInfoSchema,
  work_experience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    languages: z.array(z.string()),
  }),
  certifications: z.array(CertificationSchema),
  summary: z.string().optional().or(z.literal('')),
  achievements: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

interface ProfileEditorProps {
  candidate: CandidateResponse;
  onSave?: (candidate: CandidateResponse) => void;
  onCancel?: () => void;
  readonly?: boolean;
  className?: string;
}

export function ProfileEditor({ 
  candidate, 
  onSave, 
  onCancel, 
  readonly = false,
  className 
}: ProfileEditorProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [skillType, setSkillType] = useState<'technical' | 'soft' | 'languages'>('technical');
  const [achievementInput, setAchievementInput] = useState('');

  const updateCandidateMutation = useUpdateCandidate();

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'summary', label: 'Summary', icon: FileText },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    setValue,
    getValues,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      personal_info: {
        full_name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.profile_data?.personal_info?.email || '',
        phone: candidate.profile_data?.personal_info?.phone || '',
        location: candidate.profile_data?.personal_info?.location || '',
        linkedin: candidate.profile_data?.personal_info?.linkedin || '',
        github: candidate.profile_data?.personal_info?.github || '',
        portfolio_url: candidate.profile_data?.personal_info?.portfolio_url || '',
        website: candidate.profile_data?.personal_info?.website || '',
        twitter: candidate.profile_data?.personal_info?.twitter || '',
        stackoverflow: candidate.profile_data?.personal_info?.stackoverflow || '',
        behance: candidate.profile_data?.personal_info?.behance || '',
        dribbble: candidate.profile_data?.personal_info?.dribbble || '',
      },
      work_experience: candidate.profile_data?.work_experience || [],
      education: candidate.profile_data?.education || [],
      skills: {
        technical: candidate.profile_data?.skills?.technical || [],
        soft: candidate.profile_data?.skills?.soft || [],
        languages: candidate.profile_data?.skills?.languages || [],
      },
      certifications: candidate.profile_data?.certifications || [],
      summary: candidate.profile_data?.summary || '',
      achievements: candidate.profile_data?.achievements || [],
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: 'work_experience',
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: 'education',
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: 'certifications',
  });

  const skills = watch('skills');
  const achievements = watch('achievements');

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updateData: any = {
        first_name: data.personal_info.full_name.split(' ')[0],
        last_name: data.personal_info.full_name.split(' ').slice(1).join(' '),
        email: data.personal_info.email || undefined,
        phone: data.personal_info.phone || undefined,
        location: data.personal_info.location || undefined,
        profile_data: {
          personal_info: data.personal_info,
          work_experience: data.work_experience,
          education: data.education,
          skills: data.skills,
          certifications: data.certifications,
          summary: data.summary,
          achievements: data.achievements,
        },
      };

      const result = await updateCandidateMutation.mutateAsync({
        candidateId: candidate.id,
        data: updateData,
      });

      onSave?.(result);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = getValues(`skills.${skillType}`);
      if (!currentSkills.includes(skillInput.trim())) {
        setValue(`skills.${skillType}`, [...currentSkills, skillInput.trim()]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (type: 'technical' | 'soft' | 'languages', index: number) => {
    const currentSkills = getValues(`skills.${type}`);
    setValue(`skills.${type}`, currentSkills.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    if (achievementInput.trim()) {
      const currentAchievements = getValues('achievements');
      if (!currentAchievements.includes(achievementInput.trim())) {
        setValue('achievements', [...currentAchievements, achievementInput.trim()]);
        setAchievementInput('');
      }
    }
  };

  const removeAchievement = (index: number) => {
    const currentAchievements = getValues('achievements');
    setValue('achievements', currentAchievements.filter((_, i) => i !== index));
  };

  const getSectionErrors = (sectionId: string): number => {
    switch (sectionId) {
      case 'personal':
        return errors.personal_info ? Object.keys(errors.personal_info).length : 0;
      case 'experience':
        return errors.work_experience ? (errors.work_experience.length || 0) : 0;
      case 'education':
        return errors.education ? (errors.education.length || 0) : 0;
      case 'skills':
        return errors.skills ? Object.keys(errors.skills).length : 0;
      case 'certifications':
        return errors.certifications ? (errors.certifications.length || 0) : 0;
      case 'summary':
        return errors.summary ? 1 : 0;
      default:
        return 0;
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Controller
            name="personal_info.full_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter full name"
                error={errors.personal_info?.full_name?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Controller
            name="personal_info.email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="Enter email address"
                error={errors.personal_info?.email?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <Controller
            name="personal_info.phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="tel"
                placeholder="Enter phone number"
                error={errors.personal_info?.phone?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Controller
            name="personal_info.location"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter location"
                error={errors.personal_info?.location?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <Controller
            name="personal_info.linkedin"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://linkedin.com/in/username"
                error={errors.personal_info?.linkedin?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Profile
          </label>
          <Controller
            name="personal_info.github"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://github.com/username"
                error={errors.personal_info?.github?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Website
          </label>
          <Controller
            name="personal_info.portfolio_url"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://yourportfolio.com"
                error={errors.personal_info?.portfolio_url?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Website
          </label>
          <Controller
            name="personal_info.website"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://yourwebsite.com"
                error={errors.personal_info?.website?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twitter Profile
          </label>
          <Controller
            name="personal_info.twitter"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://twitter.com/username"
                error={errors.personal_info?.twitter?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            StackOverflow Profile
          </label>
          <Controller
            name="personal_info.stackoverflow"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://stackoverflow.com/users/..."
                error={errors.personal_info?.stackoverflow?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Behance Profile
          </label>
          <Controller
            name="personal_info.behance"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://behance.net/username"
                error={errors.personal_info?.behance?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dribbble Profile
          </label>
          <Controller
            name="personal_info.dribbble"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://dribbble.com/username"
                error={errors.personal_info?.dribbble?.message}
                disabled={readonly}
              />
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderWorkExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
        {!readonly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendExperience({
              title: '',
              company: '',
              location: '',
              start_date: '',
              end_date: '',
              description: '',
              is_current: false,
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        )}
      </div>
      
      {experienceFields.map((field, index) => (
        <Card key={field.id} variant="outlined">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="font-medium">Experience {index + 1}</span>
              </div>
              {!readonly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <Controller
                  name={`work_experience.${index}.title`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter job title"
                      error={errors.work_experience?.[index]?.title?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <Controller
                  name={`work_experience.${index}.company`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter company name"
                      error={errors.work_experience?.[index]?.company?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Controller
                  name={`work_experience.${index}.location`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter location"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Controller
                    name={`work_experience.${index}.start_date`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        error={errors.work_experience?.[index]?.start_date?.message}
                        disabled={readonly}
                      />
                    )}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Controller
                    name={`work_experience.${index}.end_date`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        disabled={readonly || watch(`work_experience.${index}.is_current`)}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Controller
                    name={`work_experience.${index}.is_current`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={readonly}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Current Position
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Controller
                  name={`work_experience.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Describe your role and achievements"
                      rows={3}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {experienceFields.length === 0 && (
        <Card variant="ghost" className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work experience added</h3>
            <p className="text-gray-600 mb-4">Add work experience to showcase professional background</p>
            {!readonly && (
              <Button
                type="button"
                onClick={() => appendExperience({
                  title: '',
                  company: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  description: '',
                  is_current: false,
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Experience
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Education</h3>
        {!readonly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendEducation({
              degree: '',
              field_of_study: '',
              institution: '',
              location: '',
              start_date: '',
              end_date: '',
              gpa: '',
              description: '',
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        )}
      </div>
      
      {educationFields.map((field, index) => (
        <Card key={field.id} variant="outlined">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium">Education {index + 1}</span>
              </div>
              {!readonly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree *
                </label>
                <Controller
                  name={`education.${index}.degree`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Bachelor's, Master's, etc."
                      error={errors.education?.[index]?.degree?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field of Study
                </label>
                <Controller
                  name={`education.${index}.field_of_study`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Computer Science, Business, etc."
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution *
                </label>
                <Controller
                  name={`education.${index}.institution`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="University or school name"
                      error={errors.education?.[index]?.institution?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Controller
                  name={`education.${index}.location`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="City, Country"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Controller
                  name={`education.${index}.start_date`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Controller
                  name={`education.${index}.end_date`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPA
                </label>
                <Controller
                  name={`education.${index}.gpa`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="3.8/4.0"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Controller
                  name={`education.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Relevant coursework, achievements, etc."
                      rows={2}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Skills & Competencies</h3>
        
        {!readonly && (
          <div className="flex gap-2">
            <Select
              value={skillType}
              onChange={(e) => setSkillType(e.target.value as 'technical' | 'soft' | 'languages')}
              options={[
                { value: 'technical', label: 'Technical Skills' },
                { value: 'soft', label: 'Soft Skills' },
                { value: 'languages', label: 'Languages' },
              ]}
              className="w-40"
            />
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Enter skill"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button
              type="button"
              onClick={addSkill}
              disabled={!skillInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {['technical', 'soft', 'languages'].map((type) => (
          <div key={type}>
            <h4 className="font-medium text-gray-900 mb-2 capitalize flex items-center gap-2">
              <Target className="h-4 w-4" />
              {type === 'technical' ? 'Technical Skills' : type === 'soft' ? 'Soft Skills' : 'Languages'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills[type as keyof typeof skills]?.map((skill, index) => (
                <Badge
                  key={index}
                  variant={type === 'technical' ? 'secondary' : type === 'soft' ? 'outline' : 'ghost'}
                  className="text-sm"
                >
                  {skill}
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => removeSkill(type as 'technical' | 'soft' | 'languages', index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {skills[type as keyof typeof skills]?.length === 0 && (
                <span className="text-sm text-gray-500">No {type} skills added</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
        {!readonly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCertification({
              name: '',
              issuing_organization: '',
              issue_date: '',
              expiration_date: '',
              credential_id: '',
              credential_url: '',
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        )}
      </div>
      
      {certificationFields.map((field, index) => (
        <Card key={field.id} variant="outlined">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium">Certification {index + 1}</span>
              </div>
              {!readonly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certification Name *
                </label>
                <Controller
                  name={`certifications.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="AWS Certified Solutions Architect"
                      error={errors.certifications?.[index]?.name?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Organization *
                </label>
                <Controller
                  name={`certifications.${index}.issuing_organization`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Amazon Web Services"
                      error={errors.certifications?.[index]?.issuing_organization?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <Controller
                  name={`certifications.${index}.issue_date`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date
                </label>
                <Controller
                  name={`certifications.${index}.expiration_date`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credential ID
                </label>
                <Controller
                  name={`certifications.${index}.credential_id`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Certificate ID or number"
                      disabled={readonly}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credential URL
                </label>
                <Controller
                  name={`certifications.${index}.credential_url`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://..."
                      error={errors.certifications?.[index]?.credential_url?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Summary</h3>
        <Controller
          name="summary"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Write a brief professional summary..."
              rows={6}
              disabled={readonly}
            />
          )}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Achievements</h3>
        {!readonly && (
          <div className="flex gap-2 mb-4">
            <Input
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              placeholder="Enter achievement"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
            />
            <Button
              type="button"
              onClick={addAchievement}
              disabled={!achievementInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="flex-1">{achievement}</span>
              {!readonly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAchievement(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {achievements.length === 0 && (
            <p className="text-sm text-gray-500">No achievements added</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderWorkExperience();
      case 2:
        return renderEducation();
      case 3:
        return renderSkills();
      case 4:
        return renderCertifications();
      case 5:
        return renderSummary();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card variant="feature" className="border-0 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  Profile Editor
                  {readonly && <Eye className="h-6 w-6 text-blue-600 inline ml-2" />}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {readonly ? 'Viewing' : 'Editing'} profile for {candidate.first_name} {candidate.last_name}
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/80 text-green-700">
                <Database className="h-3 w-3 mr-1" />
                {candidate.source}
              </Badge>
              {candidate.confidence_score && (
                <Badge variant="outline" className="bg-white/80">
                  <Shield className="h-3 w-3 mr-1" />
                  {Math.round(candidate.confidence_score * 100)}% confidence
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Section Navigation */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                const hasErrors = getSectionErrors(section.id) > 0;
                const isActive = currentSection === index;
                
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentSection(index)}
                    className={cn(
                      'flex items-center gap-2',
                      hasErrors && 'text-red-600 hover:text-red-700'
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    {section.label}
                    {hasErrors && (
                      <Badge variant="error" className="text-xs">
                        {getSectionErrors(section.id)}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {currentSection + 1} / {sections.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                disabled={currentSection === sections.length - 1}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Section */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(sections[currentSection].icon, { className: "h-5 w-5 text-primary" })}
              {sections[currentSection].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCurrentSection()}
          </CardContent>
        </Card>

        {/* Actions */}
        {!readonly && (
          <Card variant="glass" className="backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isDirty && (
                    <Badge variant="warning" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unsaved changes
                    </Badge>
                  )}
                  <div className="text-sm text-gray-600">
                    {Object.keys(errors).length > 0 && (
                      <span className="text-red-600">
                        {Object.keys(errors).length} error(s) found
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className="btn-interactive"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

export default ProfileEditor;