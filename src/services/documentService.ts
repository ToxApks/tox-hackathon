import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { Resource, Topic } from '../types';

// Set worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extract text from a PDF file
 */
export const extractPdfText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        resolve(fullText);
      } catch (error) {
        reject(new Error(`Failed to extract text from PDF: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generate topics from extracted PDF text
 */
export const generateTopicsFromText = async (text: string): Promise<Topic[]> => {
  try {
    const response = await fetch('/api/extract-topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const topics = await response.json();
    return topics.map((topic: any, index: number) => ({
      id: `topic-${Date.now()}-${index}`,
      title: topic.title,
      content: topic.content,
      keyPoints: topic.keyPoints || [],
      example: topic.example || '',
      order: index,
      completed: false,
    }));
  } catch (error) {
    throw new Error(`Failed to generate topics: ${error}`);
  }
};

/**
 * Create a blob URL for a PDF file (temporary storage)
 */
export const createPdfBlobUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke a blob URL to free memory
 */
export const revokePdfBlobUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Validate PDF file
 */
export const validatePdfFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Please upload a valid PDF file' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_SIZE / (1024 * 1024)}MB limit` };
  }

  return { valid: true };
};

/**
 * Extract file metadata
 */
export const getFileMetadata = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    uploadDate: new Date().toISOString(),
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
  };
};

/**
 * Create a resource object from file and topics
 */
export const createResource = (
  file: File,
  topics: Topic[],
  pdfUrl: string
): Resource => {
  const metadata = getFileMetadata(file);

  return {
    id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: file.name.replace('.pdf', ''),
    type: 'pdf',
    uploadDate: metadata.uploadDate,
    topics,
    pdfUrl,
    fileSize: file.size,
    fileName: file.name,
    folder: 'My Uploads',
  };
};
