import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { User, Resource } from './types';
import { Dashboard } from './pages/Dashboard';
import { TopicView } from './pages/TopicView';
import { Resources } from './pages/Resources';
import { PDFViewerPage } from './pages/PDFViewerPage';
import { AIMentor } from './pages/AIMentor';
import { Achievements } from './pages/Achievements';
import { Settings } from './pages/Settings';
import { CodingPlayground } from './pages/CodingPlayground';
import { DSAQuiz } from './pages/DSAQuiz';
import { Auth } from './pages/Auth';
import { Sidebar } from './components/Sidebar';
import { MentorChat } from './components/MentorChat';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getResourcesFromStorage, saveResourcesToStorage, clearUserResources } from './services/storageLocal';
import { uploadPdfToStorage } from './services/storageService';

// Set worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resources, setResources] = useState<Resource[]>([]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AUTH USER:", currentUser); // 🔥 Debug log

      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email || 'unknown@example.com',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          photoURL: currentUser.photoURL || '',
          progress: 0,
        });
        setAuthenticated(true);
        // Load resources from localStorage
        const stored = getResourcesFromStorage(currentUser.uid);
        setResources(stored);
      } else {
        setAuthenticated(false);
        setUser(null);
        setResources([]);
      }
    });
    return unsubscribe;
  }, []);

  // remove demo data in favor of user-uploaded resources (localStorage text)
  useEffect(() => {
    if (authenticated && resources.length === 0) {
      setLoading(false);
    }
  }, [authenticated, resources.length]);

  const handleUpload = async (file: File, onProgress?: (progress: number) => void) => {
    if (!user) return;

    try {
      // Upload PDF to Firebase Storage first
      console.log('Uploading PDF to storage...');
      const pdfUrl = await uploadPdfToStorage(user.uid, file, onProgress);

      // Extract text from PDF for topic generation
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }

      // Send text to backend for topic extraction
      const response = await fetch('http://localhost:3001/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, userId: user.uid, title: file.name }),
      });

      if (!response.ok) throw new Error(`API Error ${response.status}: ${await response.text()}`);
      const topics = await response.json();

      // Create resource with PDF URL
      const resourceData = {
        id: `resource-${Date.now()}`,
        title: file.name.replace('.pdf', ''),
        type: 'pdf' as const,
        uploadDate: new Date().toISOString(),
        topics,
        folder: 'My Uploads',
        pdfUrl,
      };

      setResources(prev => {
        const updated = [...prev, resourceData];
        if (user) saveResourcesToStorage(user.uid, updated);
        return updated;
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('PDF processing failed. Check console and try a small PDF. Backend at localhost:3001 must be running.');
    }
  };

  const handleTopicComplete = async (resourceId: string, topicId: string, score: number) => {
    if (!user) return;

    setResources(prev => prev.map(resource => {
      if (resource.id === resourceId) {
        return {
          ...resource,
          topics: resource.topics.map(topic =>
            topic.id === topicId ? { ...topic, completed: true, score } : topic
          )
        };
      }
      return resource;
    }));

    const totalTopics = resources.reduce((acc, r) => acc + r.topics.length, 0);
    const completedTopics = resources.reduce((acc, r) => acc + r.topics.filter(t => t.completed).length, 0) + 1;
    const progress = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

    setUser(prev => prev ? { ...prev, progress } : null);

    if (user) {
      saveResourcesToStorage(user.uid, resources);
    }
  };

  useEffect(() => {
    if (user) {
      saveResourcesToStorage(user.uid, resources);
    }
  }, [user, resources]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show Auth component if not authenticated
  // Bypassed auth for direct dashboard access
  if (!user) {
    setUser({
      uid: 'demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: '',
      progress: 0,
    });
    setAuthenticated(true);
  }

  const TopicRoute = () => {
    const { resourceId, topicId } = useParams<{ resourceId?: string; topicId?: string }>();
    if (!resourceId || !topicId) return <Navigate to="/dashboard" />;

    const resource = resources.find(r => r.id === resourceId);
    const topic = resource?.topics.find(t => t.id === topicId);

    if (!resource || !topic) {
      return <div className="p-8">Topic not found.</div>;
    }

    return (
      <TopicView
        topic={topic}
        onComplete={(score) => handleTopicComplete(resourceId, topicId, score)}
      />
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  user={user}
                  resources={resources}
                  onUpload={handleUpload}
                />
              }
            />
            <Route path="/topic/:resourceId/:topicId" element={<TopicRoute />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        );
      case 'resources':
        return (
          <Resources
            resources={resources}
            userId={user?.uid}
            onResourcesUpdate={setResources}
          />
        );
      case 'mentor':
        return <AIMentor />;
      case 'practice':
        return <DSAQuiz user={user} />;
      case 'playground':
        return <CodingPlayground user={user} />;
      case 'achievements':
        return <Achievements />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard
            user={user}
            resources={resources}
            onUpload={handleUpload}
          />
        );
    }
  };

  // Main Router setup with all top-level routes
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 ml-64 min-h-screen p-8">
          {renderContent()}
        </main>
        <MentorChat context={{ currentTopic: undefined, userProgress: user?.progress ?? 0 }} />
      </div>
    </Router>
  );
}
