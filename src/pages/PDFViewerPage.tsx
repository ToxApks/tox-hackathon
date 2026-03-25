import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { DocumentViewer } from './DocumentViewer';
import { Resource } from '../types';
import { getResourceById } from '../services/storageLocal';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface PDFViewerPageProps {
  userId?: string;
}

export const PDFViewerPage = ({ userId }: PDFViewerPageProps) => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resourceId) {
      setError('No resource ID provided');
      setLoading(false);
      return;
    }

    // Try to get resource from location state first (faster)
    const locationResource = (location.state as any)?.resource;
    if (locationResource) {
      setResource(locationResource);
      setLoading(false);
      return;
    }

    // Otherwise, load from localStorage
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const stored = getResourceById(userId, resourceId);
      if (stored) {
        setResource(stored);
      } else {
        setError('Resource not found');
      }
    } catch (err) {
      setError('Failed to load resource');
      console.error('Error loading resource:', err);
    } finally {
      setLoading(false);
    }
  }, [resourceId, userId, location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
          <p className="text-gray-400 mt-4">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error || 'Could not load PDF'}</p>
          <button
            onClick={() => navigate('/resources')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  if (!resource.pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
          <div className="bg-orange-100 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">PDF Not Available</h2>
          <p className="text-gray-400 mb-6">
            This resource does not have a PDF attached
          </p>
          <button
            onClick={() => navigate('/resources')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/resources')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* PDF Viewer */}
      <DocumentViewer pdfUrl={resource.pdfUrl} title={resource.title} />
    </div>
  );
};

export default PDFViewerPage;
