import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Resource } from '../types';

interface FileCategorization {
  subject: string;
  category: string;
  suggestedTopics: string[];
}

const categorizeDocument = async (text: string): Promise<FileCategorization> => ({
  subject: 'Computer Science',
  category: 'Data Structures & Algorithms',
  suggestedTopics: ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs']
});

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface MultiFileUploadProps {
  onSuccess: (resources: Resource[]) => void;
  userId: string;
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({ onSuccess, userId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progresses, setProgresses] = useState<UploadProgress[]>([]);

  const handleFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).slice(0, 10);
    setFiles(newFiles);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const initialProgresses = files.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'pending' as const
    }));
    setProgresses(initialProgresses);

    const results: Resource[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressKey = file.name;

      // Simulate upload
      for (let p = 10; p <= 100; p += 10) {
        setProgresses(prev => prev.map(pr => pr.fileName === progressKey ? { ...pr, progress: p } : pr ));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mock categorization
      const categorization = await categorizeDocument('mock text');

      // Mock resource
      const resource: Resource = {
        id: `mock-${Date.now()}-${i}`,
        title: file.name.replace('.pdf', ''),
        type: 'pdf',
        uploadDate: new Date().toISOString(),
        topics: [],
        url: `https://example.com/mock/${file.name}`,
        fileName: file.name,
        subject: categorization.subject,
        category: categorization.category,
        userId: 'demo-user'
      };

      setProgresses(prev => prev.map(pr => pr.fileName === progressKey ? { ...pr, status: 'success', progress: 100 } : pr ));
      results.push(resource);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setUploading(false);
    setFiles([]);
    onSuccess(results);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* File Input */}
      <label className="block border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-all cursor-pointer bg-gray-50 hover:bg-indigo-50">
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFilesChange}
          className="hidden"
        />
        <div className="space-y-2">
          <Upload className="w-16 h-16 mx-auto text-gray-400" />
          <div>
            <p className="font-semibold text-lg text-gray-900">Drop PDFs here or click to browse</p>
            <p className="text-sm text-gray-500">Supports multiple files (max 10, up to 10MB each)</p>
          </div>
        </div>
      </label>

      {/* Files Preview */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900">Ready to upload ({files.length} files)</h4>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">PDF</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate pr-2">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={handleUploadAll}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing {files.length} files...
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              {uploading ? 'Processing...' : `AI Arrange & Upload (${files.length} files)`}
            </>
          )}
        </button>
      )}

      {/* Progress */}
      {progresses.length > 0 && (
        <div className="space-y-4">
          {progresses.map((progress) => (
            <div key={progress.fileName} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-900 truncate flex-1 mr-2">{progress.fileName}</span>
                <span className="text-sm font-mono text-gray-500">{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${progress.progress}%` }}
                >
                  {progress.status !== 'pending' && progress.status !== 'success' && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="text-xs mt-1 capitalize font-medium text-gray-600">
                {progress.status}
              </div>
              {progress.error && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{progress.error}</span>
                </div>
              )}
              {progress.status === 'success' && (
                <div className="flex items-center gap-2 mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" />
                  <span>AI categorized & uploaded!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
