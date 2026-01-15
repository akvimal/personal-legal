'use client';

import { useState } from 'react';
import { FileUpload } from './file-upload';
import { DocumentAnalysis } from './document-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIChat } from './ai-chat';
import { FileText, MessageSquare, Sparkles } from 'lucide-react';

interface DocumentUploadWithAnalysisProps {
  documentData?: {
    title: string;
    category: string;
    description?: string;
    tags?: string[];
  };
  showAnalysisTab?: boolean;
  showChatTab?: boolean;
  onUploadSuccess?: (document: any) => void;
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
}

export function DocumentUploadWithAnalysis({
  documentData,
  showAnalysisTab = true,
  showChatTab = true,
  onUploadSuccess,
  onAnalysisComplete,
  className = '',
}: DocumentUploadWithAnalysisProps) {
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleUploadSuccess = (document: any) => {
    setUploadedDocument(document);
    onUploadSuccess?.(document);

    // Auto-switch to analysis tab if enabled
    if (showAnalysisTab) {
      setActiveTab('analysis');
    }
  };

  const handleAnalysisComplete = (analysis: any) => {
    onAnalysisComplete?.(analysis);
  };

  return (
    <div className={`w-full ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Upload
          </TabsTrigger>
          {showAnalysisTab && (
            <TabsTrigger
              value="analysis"
              disabled={!uploadedDocument}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analysis
            </TabsTrigger>
          )}
          {showChatTab && (
            <TabsTrigger
              value="chat"
              disabled={!uploadedDocument}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <FileUpload
            onSuccess={handleUploadSuccess}
            documentData={documentData}
          />
        </TabsContent>

        {showAnalysisTab && uploadedDocument && (
          <TabsContent value="analysis" className="mt-6">
            <DocumentAnalysis
              documentId={uploadedDocument.id}
              documentTitle={uploadedDocument.title}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </TabsContent>
        )}

        {showChatTab && uploadedDocument && (
          <TabsContent value="chat" className="mt-6">
            <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
              <AIChat
                documentId={uploadedDocument.id}
                documentTitle={uploadedDocument.title}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
