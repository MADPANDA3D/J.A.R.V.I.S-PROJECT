/**
 * File Attachment Upload Component
 * Drag-and-drop file upload with progress tracking and validation
 */

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import type { FileUploadProgress } from '@/types/bugReport';

interface FileAttachmentUploadProps {
  onFileUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  acceptedTypes?: string[];
  uploadProgress?: FileUploadProgress[];
  className?: string;
}

export const FileAttachmentUpload: React.FC<FileAttachmentUploadProps> = ({
  onFileUpload,
  maxFiles = 5,
  maxSizePerFile = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', '.txt', '.log', '.json', '.pdf'],
  uploadProgress = [],
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Check total file count
    if (files.length + selectedFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed. You've selected ${files.length + selectedFiles.length} files.`);
      return { valid: [], errors };
    }

    files.forEach((file, index) {
      // Check file size
      if (file.size > maxSizePerFile) {
        errors.push(`${file.name}: File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(maxSizePerFile)})`);
        return;
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else if (type.includes('/*')) {
          const mimeCategory = type.split('/')[0];
          return file.type.startsWith(mimeCategory);
        } else {
          return file.type === type;
        }
      });

      if (!isValidType) {
        errors.push(`${file.name}: File type not supported. Allowed types: ${acceptedTypes.join(', ')}`);
        return;
      }

      // Check for duplicate names
      const duplicateInSelected = selectedFiles.some(existing => existing.name === file.name);
      const duplicateInCurrent = files.slice(0, index).some(existing => existing.name === file.name);
      
      if (duplicateInSelected || duplicateInCurrent) {
        errors.push(`${file.name}: Duplicate file name`);
        return;
      }

      validFiles.push(file);
    });

    return { valid: validFiles, errors };
  }, [maxFiles, maxSizePerFile, acceptedTypes, selectedFiles]);

  const handleFileSelection = useCallback((files: FileList | null) {
    if (!files) return;

    const filesArray = Array.from(files);
    const { valid, errors } = validateFiles(filesArray);

    setValidationErrors(errors);

    if (valid.length > 0) {
      const newSelectedFiles = [...selectedFiles, ...valid];
      setSelectedFiles(newSelectedFiles);
      onFileUpload(newSelectedFiles);
    }
  }, [selectedFiles, validateFiles, onFileUpload]);

  const handleDrag = useCallback((e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFileSelection(files);
  }, [handleFileSelection]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) {
    handleFileSelection(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelection]);

  const removeFile = useCallback((index: number) {
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newSelectedFiles);
    onFileUpload(newSelectedFiles);
    
    // Clear validation errors related to removed file
    setValidationErrors([]);
  }, [selectedFiles, onFileUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File): string => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('text') || file.name.endsWith('.log')) return '📝';
    if (file.type.includes('json')) return '🔧';
    return '📎';
  };

  const getUploadProgress = (fileName: string): FileUploadProgress | undefined => {
    return uploadProgress.find(p => p.filename === fileName);
  };

  return (
    <div className={`file-attachment-upload ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="sr-only"
          id="file-upload"
        />

        <div className="space-y-2">
          <div className="text-4xl">📎</div>
          <div>
            <p className="text-gray-600">
              Drop files here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max {maxFiles} files, {formatFileSize(maxSizePerFile)} each
            </p>
            <p className="text-xs text-gray-500">
              Supported: {acceptedTypes.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <div>
            <p className="text-red-800 font-medium mb-1">File Upload Errors:</p>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) {
              const progress = getUploadProgress(file.name);
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="text-lg flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-500 text-sm font-medium focus:outline-none"
                        disabled={progress?.status === 'uploading'}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type || 'Unknown type'}</span>
                    </div>

                    {/* Upload Progress */}
                    {progress && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`font-medium ${
                            progress.status === 'completed' ? 'text-green-600' :
                            progress.status === 'error' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {progress.status === 'completed' ? 'Uploaded' :
                             progress.status === 'error' ? 'Upload failed' :
                             progress.status === 'uploading' ? 'Uploading...' :
                             'Pending'}
                          </span>
                          {progress.status === 'uploading' && (
                            <span>{progress.progress}%</span>
                          )}
                        </div>
                        
                        {(progress.status === 'uploading' || progress.status === 'completed') && (
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all duration-300 ${
                                progress.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress.progress}%` }}
                            ></div>
                          </div>
                        )}
                        
                        {progress.error && (
                          <p className="text-xs text-red-600 mt-1">
                            {progress.error}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clear All Button */}
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() {
                setSelectedFiles([]);
                onFileUpload([]);
                setValidationErrors([]);
              }}
              disabled={uploadProgress.some(p => p.status === 'uploading')}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">
          File Upload Tips:
        </h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Screenshots help us understand visual issues</li>
          <li>• Browser console logs are useful for JavaScript errors</li>
          <li>• Network logs can help diagnose API issues</li>
          <li>• Please don't include sensitive information in files</li>
        </ul>
      </div>
    </div>
  );
};