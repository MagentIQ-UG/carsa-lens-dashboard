/**
 * FileUpload Component
 * Drag-and-drop file upload with progress tracking for job descriptions
 */

'use client';

import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader
} from 'lucide-react';
import React, { useState, useCallback, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Progress } from '@/components/ui/progress';
import { useUploadJobDescription } from '@/hooks/jobs';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'text/markdown': '.md',
};

const DEFAULT_MAX_SIZE = 10; // 10MB

export function FileUpload({
  jobId,
  isOpen,
  onClose,
  onSuccess,
  accept = Object.keys(ACCEPTED_FILE_TYPES).join(','),
  maxSize = DEFAULT_MAX_SIZE,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useUploadJobDescription();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload PDF, DOC, DOCX, TXT, or MD files.`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum limit of ${maxSize}MB.`;
    }

    return null;
  }, [maxSize]);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      const validation = validateFile(file);
      if (validation) {
        newFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'error',
          error: validation,
        });
      } else {
        newFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'pending',
        });
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      await uploadMutation.mutateAsync({
        jobId,
        file: uploadFile.file,
        onProgress: (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: Math.round(progress) }
              : f
          ));
        },
      });

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: errorMessage, progress: 0 }
          : f
      ));
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    const successCount = files.filter(f => f.status === 'success').length;
    if (successCount > 0) {
      onSuccess?.();
    }
  };

  const retryFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      uploadFile(file);
    }
  };

  const clearAll = () => {
    setFiles([]);
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const uploadingFiles = files.filter(f => f.status === 'uploading');
  const successFiles = files.filter(f => f.status === 'success');
  const errorFiles = files.filter(f => f.status === 'error');
  
  const isUploading = uploadingFiles.length > 0;
  const hasFiles = files.length > 0;
  const canUpload = pendingFiles.length > 0 && !isUploading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      showCloseButton={!isUploading}
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Upload Job Description
          </h2>
          <p className="text-gray-600">
            Upload PDF, DOC, DOCX, TXT, or MD files. Maximum size: {maxSize}MB per file.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-600" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-gray-600 mt-1">
                or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse files
                </button>
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              Supported formats: {Object.values(ACCEPTED_FILE_TYPES).join(', ')}
            </div>
          </div>
        </div>

        {/* File List */}
        {hasFiles && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Files ({files.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {files.map((uploadFile) => (
                <Card key={uploadFile.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {uploadFile.status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : uploadFile.status === 'error' ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : uploadFile.status === 'uploading' ? (
                            <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadFile.file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{(uploadFile.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className="capitalize">{uploadFile.status}</span>
                          </div>
                          
                          {uploadFile.status === 'uploading' && (
                            <div className="mt-2">
                              <Progress value={uploadFile.progress} className="h-1" />
                              <p className="text-xs text-gray-500 mt-1">
                                {uploadFile.progress}% uploaded
                              </p>
                            </div>
                          )}
                          
                          {uploadFile.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {uploadFile.error}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {uploadFile.status === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryFile(uploadFile.id)}
                          >
                            Retry
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          disabled={uploadFile.status === 'uploading'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upload Summary */}
            {(successFiles.length > 0 || errorFiles.length > 0) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Upload Summary:</span>
                  <div className="flex space-x-4">
                    {successFiles.length > 0 && (
                      <span className="text-green-600">
                        {successFiles.length} successful
                      </span>
                    )}
                    {errorFiles.length > 0 && (
                      <span className="text-red-600">
                        {errorFiles.length} failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            {hasFiles && (
              <>
                {pendingFiles.length} pending • {successFiles.length} uploaded • {errorFiles.length} failed
              </>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            
            {canUpload && (
              <Button
                onClick={uploadAllFiles}
                disabled={!canUpload}
                loading={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload {pendingFiles.length} File{pendingFiles.length !== 1 ? 's' : ''}
              </Button>
            )}
            
            {successFiles.length > 0 && pendingFiles.length === 0 && !isUploading && (
              <Button onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default FileUpload;