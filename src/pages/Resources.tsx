import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/Card';
import { MultiFileUpload } from '../components/MultiFileUpload';
import { BookOpen, FileText, Download, Search, Filter, Trash2, Eye, AlertCircle } from 'lucide-react';
import { Resource } from '../types';
import {
  getResourcesFromStorage,
  addResourceToStorage,
  deleteResourceFromStorage,
} from '../services/storageLocal';

interface ResourcesProps {
  resources: Resource[];
  userId?: string;
  onResourcesUpdate?: (resources: Resource[]) => void;
}

export const Resources = ({ resources, userId, onResourcesUpdate }: ResourcesProps) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localResources, setLocalResources] = useState<Resource[]>(resources);
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const navigate = useNavigate();

  // Debug userId
  React.useEffect(() => {
    console.log('[Resources] Component mounted. userId:', userId, 'resources:', resources.length);
  }, [userId, resources]);

  useEffect(() => {
    if (userId) {
      const stored = getResourcesFromStorage(userId);
      console.log('[Resources] Loading resources from storage for userId:', userId, 'found:', stored.length);
      setLocalResources(stored);
    }
  }, [userId]);

  useEffect(() => {
    if (resources && resources.length > 0) {
      setLocalResources(resources);
    }
  }, [resources]);

  const handleSaveSuccess = (resource: Resource) => {
    const updated = [...localResources, resource];

    if (userId) {
      addResourceToStorage(userId, resource);
    }

    setLocalResources(updated);
    onResourcesUpdate?.(updated);

    setSuccessMessage(`"${resource.title}" saved successfully.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };
  
  const handleSaveError = (error: string) => {
    setUploadError(error);
    setTimeout(() => setUploadError(null), 5000);
  };

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveUrlResource = () => {
    if (!urlInput.trim()) {
      handleSaveError('Please enter a PDF URL.');
      return;
    }
    if (!isValidUrl(urlInput.trim())) {
      handleSaveError('Please enter a valid URL.');
      return;
    }
    if (!urlInput.toLowerCase().endsWith('.pdf')) {
      handleSaveError('URL must end with .pdf');
      return;
    }

    const filename = urlInput.split('/').pop() || 'document.pdf';
    const newResource: Resource = {
      id: `resource-${Date.now()}`,
      title: urlTitle.trim() || filename,
      type: 'pdf',
      uploadDate: new Date().toISOString(),
      topics: [],
      pdfUrl: urlInput.trim(),
      fileName: filename,
      folder: 'URL Imports',
    };

    handleSaveSuccess(newResource);
    setUrlInput('');
    setUrlTitle('');
  };

  // (Resources are loaded in initial useEffect above.)


  const handleDelete = (resourceId: string) => {
    if (userId && confirm('Are you sure you want to delete this resource?')) {
      deleteResourceFromStorage(userId, resourceId);
      const updated = getResourcesFromStorage(userId);
      setLocalResources(updated);
      onResourcesUpdate?.(updated);
    }
  };

  const handleView = (resource: Resource) => {
    navigate(`/viewer/${resource.id}`, { state: { resource } });
  };

  const filteredResources = localResources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Resources</h2>
          <p className="text-gray-500 mt-1">Manage and organize your study materials</p>
        </div>
      </header>

      {/* Error/Success Messages */}
      {uploadError && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{uploadError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Multi File Upload Card */}
        <Card className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4">Upload Multiple PDFs</h3>
          <MultiFileUpload
            onSuccess={(resources) => resources.forEach(handleSaveSuccess)}
            userId={userId || ''}
          />
          <p className="text-xs text-gray-600 mt-4">
            Select multiple PDFs. AI will extract text, categorize by subject/topic, upload to Firebase Storage, save metadata to Firestore.
          </p>
        </Card>

        {/* Stats */}
        <Card className="p-8">
          <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{localResources.length}</p>
              <p className="text-sm text-gray-600">Resources uploaded</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {localResources.reduce((sum, r) => sum + r.topics.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Topics generated</p>
            </div>
          </div>
        </Card>

        {/* URL import */}
        <Card className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50">
          <h3 className="font-semibold text-gray-900 mb-4">Add PDF from URL</h3>
          <input
            type="text"
            value={urlTitle}
            onChange={(e) => setUrlTitle(e.target.value)}
            placeholder="Optional title"
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/my-file.pdf"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Button onClick={handleSaveUrlResource} className="w-full">
            Save PDF from URL
          </Button>
          <p className="text-xs text-gray-500 mt-3">URL-based PDF resources are saved immediately as a reference link.</p>
        </Card>

        {/* Quick Actions */}
        <Card className="p-8">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Filter className="w-4 h-4" />
              Filter Resources
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Search className="w-4 h-4" />
              Search Resources
            </Button>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full">
            <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-gray-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <BookOpen className="w-8 h-8 text-indigo-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                {localResources.length === 0 ? 'No resources yet' : 'No results found'}
              </h4>
              <p className="text-gray-500 max-w-xs mt-2">
                {localResources.length === 0
                  ? 'Upload your first PDF to get started.'
                  : 'Try adjusting your search query.'}
              </p>
            </Card>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <Card key={resource.id} className="p-6 hover:shadow-lg transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {resource.type}
                  </span>
                  {resource.folder && (
                    <span className="text-[10px] font-semibold text-teal-600 mt-1">
                      {resource.folder}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {resource.title}
              </h3>

              <div className="space-y-2 mb-4 flex-grow">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-indigo-600">{resource.topics.length}</span> topics generated
                </p>
                <p className="text-xs text-gray-400">
                  Added {new Date(resource.uploadDate).toLocaleDateString()}
                </p>
                {resource.fileSize && (
                  <p className="text-xs text-gray-400">
                    Size: {(resource.fileSize / 1024 / 1024).toFixed(2)}MB
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => handleView(resource)}
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 text-sm"
                  onClick={() => handleDelete(resource.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

