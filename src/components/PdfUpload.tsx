import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, Loader, Save } from 'lucide-react';
import { Resource } from '../types';
import { validatePdfFile, createResource } from '../services/documentService';
import { uploadPdfToStorage, saveResourceMetadataToFirestore } from '../services/storageService';

interface PdfUploadProps {
  onSaveSuccess: (resource: Resource) => void;
  onError: (error: string) => void;
  userId?: string;
  saveToFirestore?: boolean;
}

export const PdfUpload = ({
  onSaveSuccess,
  onError,
  userId,
  saveToFirestore = false,
}: PdfUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'ready' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: show userId status
  React.useEffect(() => {
    console.log('[PdfUpload] Mounted/Updated. userId:', userId, 'saveToFirestore:', saveToFirestore, 'selectedFile:', selectedFile?.name);
  }, [userId, saveToFirestore, selectedFile?.name]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      setStatus('idle');
      return;
    }

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      onError(validation.error || 'Invalid file');
      setSelectedFile(null);
      setStatus('error');
      return;
    }

    setSelectedFile(file);
    setStatus('ready');
  };

  const handleSave = async () => {
    if (!selectedFile) {
      console.error('[PdfUpload] Save clicked but no file selected');
      onError('Please select a PDF file to save.');
      return;
    }

    if (!userId) {
      const msg = 'Not logged in. Please sign up/login to upload.';
      console.error('[PdfUpload] Save clicked but userId is:', userId, 'Message:', msg);
      onError(msg);
      return;
    }

    setSaving(true);
    setStatus('uploading');
    setProgress(0);

    try {
      console.error('[PdfUpload] ✅ SAVE STARTED - userId:', userId, 'file:', selectedFile.name);
      const userKey = userId || 'anonymous';
      
      const uploadPromise = uploadPdfToStorage(userKey, selectedFile, (uploadProgress) => {
        console.log('[PdfUpload] Upload progress:', uploadProgress);
        setProgress(uploadProgress);
      });

      // Add 60 second timeout
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout: File did not complete within 60 seconds')), 60000)
      );

      const pdfUrl = await Promise.race([uploadPromise, timeoutPromise]);
      console.log('[PdfUpload] Upload successful, URL:', pdfUrl);

      const resource = createResource(selectedFile, [], pdfUrl);

      if (saveToFirestore && userId) {
        await saveResourceMetadataToFirestore(userId, resource);
      }

      onSaveSuccess(resource);
      setSaving(false);
      setStatus('success');
      setSelectedFile(null);
      setProgress(100);

      // Clear input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload PDF';
      console.error('[PdfUpload] ❌ ERROR:', message, error);
      onError(message);
      setSaving(false);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md space-y-3">
      {/* Debug Info Box */}
      {!userId && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-700 font-semibold">⚠️ Not logged in</p>
          <p className="text-xs text-orange-600">userId is: {userId === null ? 'null' : 'undefined'}</p>
        </div>
      )}
      
      {userId && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 font-semibold">✅ Logged in as: {userId.substring(0, 12)}...</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />

      {selectedFile && (
        <div className="p-3 border rounded-lg bg-gray-50">
          <p className="text-sm font-medium text-gray-700">Selected: {selectedFile.name}</p>
          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!selectedFile || saving || !userId}
        title={!userId ? "Please login first" : ""}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white ${
          !selectedFile || saving || !userId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save
      </button>

      {status === 'uploading' && (
        <>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-1">Uploading… {progress}%</div>
        </>
      )}

      {status === 'success' && (
        <div className="text-sm text-green-700">File uploaded successfully.</div>
      )}

      {status === 'error' && (
        <div className="text-sm text-red-600">Upload failed. Please try again.</div>
      )}
    </div>
  );
};

