'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DocumentCategory } from '@/types';
import { categoryLabels } from '@/lib/mock-data';
import { uploadFile, type FileUploadPayload } from '@/lib/file-upload';
import { useAuthStore } from '@/stores/authStore';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (file: File, category: DocumentCategory, metadata: any) => void;
}

export function UploadDocumentModal({ isOpen, onClose, onUpload }: UploadDocumentModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('employment');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, Word, or image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const { user } = useAuthStore();

  const handleSubmit = async () => {
    if (!selectedFile || !title || !user) return;

    setUploading(true);

    try {
      // Prepare document data
      const payload: FileUploadPayload = {
        file: selectedFile,
        documentData: {
          title: title || selectedFile.name,
          category,
          documentType: category, // Using category as document type for now
          country: user.location?.includes('India') ? 'India' : 'Unknown',
          region: user.location?.includes('Tamil Nadu') ? 'Tamil Nadu' : 'Unknown',
          language: 'en',
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          parties: [], // Can be extracted later
        },
      };

      // Upload file
      const result = await uploadFile(payload);

      if (result.success) {
        setUploadSuccess(true);
        if (onUpload) {
          onUpload(selectedFile, category, { title, tags });
        }

        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        alert(result.error || 'Upload failed. Please try again.');
        setUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setTitle('');
    setTags('');
    setCategory('employment');
    setUploading(false);
    setUploadSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <CardTitle>Upload Document</CardTitle>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                disabled={uploading}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {!uploadSuccess ? (
              <>
                {/* File Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-3">
                      <FileText className="h-12 w-12 text-primary mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        disabled={uploading}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-700 font-medium">
                          Drag and drop your document here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">or</p>
                      </div>
                      <label className="inline-block">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                        />
                        <Button variant="outline" size="sm" className="cursor-pointer" type="button">
                          Browse Files
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: PDF, Word, PNG, JPG (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Document Details */}
                {selectedFile && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Title *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter document title"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(Object.entries(categoryLabels) as [DocumentCategory, string][]).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setCategory(key)}
                            disabled={uploading}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              category === key
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200 text-gray-700 hover:border-primary/50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (optional)
                      </label>
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g., important, contract, signed (comma separated)"
                        disabled={uploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Add tags to help organize and find this document later
                      </p>
                    </div>

                    {/* AI Processing Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">AI Processing</p>
                          <p className="text-blue-700">
                            After upload, our AI will automatically:
                          </p>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700">
                            <li>Extract text using OCR (if image/scanned)</li>
                            <li>Identify important dates and deadlines</li>
                            <li>Create calendar events and reminders</li>
                            <li>Suggest relevant tasks</li>
                            <li>Detect potential risks</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedFile || !title || uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading & Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Document Uploaded Successfully!
                </h3>
                <p className="text-gray-600">
                  Your document is being processed. You'll be notified when it's ready.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
