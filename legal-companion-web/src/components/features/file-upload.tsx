'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  validateFile,
  formatFileSize,
  uploadFile,
  type FileUploadPayload,
} from '@/lib/file-upload';

interface FileUploadProps {
  onSuccess?: (document: any) => void;
  onError?: (error: string) => void;
  documentData?: Partial<FileUploadPayload['documentData']>;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  document?: any;
}

export function FileUpload({
  onSuccess,
  onError,
  documentData,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: validation.errors.join(', '),
      });
      onError?.(validation.errors.join(', '));
      return;
    }

    setFile(selectedFile);
    setUploadState({ status: 'idle', progress: 0 });
  };

  const handleUpload = async () => {
    if (!file || !documentData) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Missing file or document data',
      });
      return;
    }

    setUploadState({ status: 'uploading', progress: 0 });

    const result = await uploadFile(
      {
        file,
        documentData: documentData as FileUploadPayload['documentData'],
      },
      (progress) => {
        setUploadState((prev) => ({ ...prev, progress }));
      }
    );

    if (result.success) {
      setUploadState({
        status: 'success',
        progress: 100,
        document: result.data?.document,
      });
      onSuccess?.(result.data?.document);
    } else {
      setUploadState({
        status: 'error',
        progress: 0,
        error: result.error || 'Upload failed',
      });
      onError?.(result.error || 'Upload failed');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadState({ status: 'idle', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      {!file && uploadState.status !== 'success' && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDragging ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Upload
                className={`w-8 h-8 ${
                  isDragging ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {isDragging ? 'Drop file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-gray-500">
                or{' '}
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  browse
                </span>{' '}
                to choose a file
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <p>Supported: PDF, Word, Images (JPG, PNG), TXT, RTF</p>
              <p>Maximum size: 10MB</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.tif,.txt,.rtf"
            className="hidden"
          />
        </div>
      )}

      {/* File Selected */}
      {file && uploadState.status !== 'success' && (
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <File className="w-6 h-6 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>

                {uploadState.status !== 'uploading' && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Upload Progress */}
              {uploadState.status === 'uploading' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadState.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {uploadState.status === 'error' && uploadState.error && (
                <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{uploadState.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          {uploadState.status === 'idle' && (
            <Button
              onClick={handleUpload}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Upload Document
            </Button>
          )}
        </div>
      )}

      {/* Success State */}
      {uploadState.status === 'success' && (
        <div className="border border-green-300 rounded-lg p-6 bg-green-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 mb-1">
                Upload successful!
              </p>
              <p className="text-xs text-green-700">
                Your document has been uploaded and is ready for processing.
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              handleRemoveFile();
              setUploadState({ status: 'idle', progress: 0 });
            }}
            variant="outline"
            className="w-full mt-4"
          >
            Upload Another File
          </Button>
        </div>
      )}
    </div>
  );
}
