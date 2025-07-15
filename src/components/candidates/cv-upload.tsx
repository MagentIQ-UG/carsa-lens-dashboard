/**
 * CV Upload Component
 * Modern drag-and-drop interface with batch processing and real-time progress
 * AI-powered with glassmorphism effects and micro-interactions
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Users, 
  Zap,
  File,
  FolderOpen,
  Cloud,
  Sparkles,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { useUploadCV, useBatchUploadCV } from '@/hooks/candidates';
import { useJobs } from '@/hooks/jobs';
import { cn } from '@/lib/utils';

interface CVUploadProps {
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: Error) => void;
  jobId?: string;
  className?: string;
}

interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20;

export function CVUpload({ 
  onUploadComplete, 
  onUploadError, 
  jobId,
  className 
}: CVUploadProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCVMutation = useUploadCV();
  const batchUploadMutation = useBatchUploadCV();
  const { data: jobs } = useJobs({ limit: 50 });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const uploadSingle = async (fileItem: FileUploadItem) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      const result = await uploadCVMutation.mutateAsync({
        file: fileItem.file,
        onProgress: (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, progress: Math.min(progress, 95) } // Keep at 95% until complete
              : f
          ));
        },
        // Note: job_id and tags are not supported by the current API
        // These will need to be handled through separate endpoints
      });

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'success', progress: 100, result }
          : f
      ));

      onUploadComplete?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      const isTimeout = errorMessage.includes('timeout');
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { 
              ...f, 
              status: 'error', 
              error: isTimeout 
                ? 'Upload timeout - the file may be too large or server is processing slowly. Please try again.' 
                : errorMessage 
            }
          : f
      ));
      onUploadError?.(error instanceof Error ? error : new Error('Upload failed'));
    }
  };

  const uploadBatch = async () => {
    try {
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const, progress: 50 })));

      const result = await batchUploadMutation.mutateAsync({
        files: files.map(f => f.file),
        // Note: job_id and tags are not supported by the current API
        // These will need to be handled through separate endpoints
      });

      // Update individual file statuses based on batch result
      setFiles(prev => prev.map(f => {
        const batchResult = result.results.find(r => r.candidate.first_name && r.candidate.last_name);
        return {
          ...f,
          status: batchResult ? 'success' : 'error' as const,
          progress: 100,
          result: batchResult,
          error: batchResult ? undefined : 'Processing failed'
        };
      }));

      onUploadComplete?.(result);
    } catch (error) {
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: error instanceof Error ? error.message : 'Batch upload failed' 
      })));
      onUploadError?.(error instanceof Error ? error : new Error('Batch upload failed'));
    }
  };

  const handleUpload = () => {
    if (files.length === 0) return;

    if (uploadMode === 'batch') {
      uploadBatch();
    } else {
      files.forEach(file => {
        if (file.status === 'pending') {
          uploadSingle(file);
        }
      });
    }
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-200 bg-gray-50';
      case 'uploading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingFiles = files.filter(f => f.status === 'pending').length;
  const uploadingFiles = files.filter(f => f.status === 'uploading').length;
  const successFiles = files.filter(f => f.status === 'success').length;
  const errorFiles = files.filter(f => f.status === 'error').length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card variant="feature" className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">CV Upload Center</div>
                <div className="text-sm text-gray-600 mt-1">
                  AI-powered candidate profile extraction with batch processing
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/80 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="bg-white/80">
                <Zap className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Upload Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associate with Job (Optional)
              </label>
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                options={[
                  { value: '', label: 'No specific job' },
                  ...(jobs || []).map(job => ({
                    value: job.id,
                    label: job.title
                  }))
                ]}
                placeholder="Select a job..."
              />
            </div>

            {/* Upload Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Mode
              </label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <Button
                  variant={uploadMode === 'single' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setUploadMode('single')}
                  className="rounded-none flex-1"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Single Upload
                </Button>
                <Button
                  variant={uploadMode === 'batch' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setUploadMode('batch')}
                  className="rounded-none flex-1 border-l"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Batch Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags (press Enter or comma)"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <Card 
        variant="interactive" 
        className={cn(
          'transition-all duration-200',
          isDragActive && 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
        )}
      >
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
              isDragActive
                ? 'border-primary bg-primary/5 shadow-inner'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
                isDragActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400'
              )}>
                <Upload className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop files here' : 'Drag & drop CV files here'}
                </h3>
                <p className="text-sm text-gray-600">
                  or <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    browse files
                  </button>
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                <span>PDF, DOC, DOCX, TXT</span>
                <span>•</span>
                <span>Max {formatFileSize(MAX_FILE_SIZE)}</span>
                <span>•</span>
                <span>Up to {MAX_FILES} files</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5 text-primary" />
                Uploaded Files ({files.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {files.length > 0 && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {pendingFiles > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        {pendingFiles} pending
                      </span>
                    )}
                    {uploadingFiles > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        {uploadingFiles} uploading
                      </span>
                    )}
                    {successFiles > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {successFiles} success
                      </span>
                    )}
                    {errorFiles > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {errorFiles} error
                      </span>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map(fileItem => (
                <div
                  key={fileItem.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                    getStatusColor(fileItem.status)
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(fileItem.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {fileItem.file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(fileItem.file.size)}
                        </span>
                      </div>
                      {fileItem.status === 'uploading' && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {fileItem.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {fileItem.error}
                        </div>
                      )}
                      {fileItem.result && (
                        <div className="text-xs text-green-600 mt-1">
                          Profile extracted for {fileItem.result.candidate.first_name} {fileItem.result.candidate.last_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileItem.status === 'success' && fileItem.result && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to candidate profile
                          window.open(`/dashboard/candidates/${fileItem.result.candidate.id}`, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Actions */}
      {files.length > 0 && (
        <Card variant="glass" className="backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {files.length} file{files.length !== 1 ? 's' : ''} ready for upload
                </div>
                {uploadMode === 'batch' && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Batch Mode
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={uploadingFiles > 0}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={pendingFiles === 0 || uploadingFiles > 0}
                  className="btn-interactive"
                  size="lg"
                >
                  {uploadingFiles > 0 ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {uploadMode === 'batch' ? 'Processing Batch...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadMode === 'batch' ? 'Process Batch' : 'Upload Files'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card variant="ghost" className="border-0 bg-gray-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">AI-Powered Profile Extraction</h4>
              <p className="text-sm text-gray-600">
                Our AI automatically extracts candidate information including work experience, education, skills, and contact details from uploaded CVs. 
                Processing typically takes 30-90 seconds per document. Large files may take longer.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>• Automatic name and contact extraction</span>
                <span>• Skills and experience parsing</span>
                <span>• Education history detection</span>
                <span>• Real-time processing status</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CVUpload;