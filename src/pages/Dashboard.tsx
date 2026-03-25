import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/Card';
import { Plus, BookOpen, Clock, TrendingUp, CheckCircle2, ChevronRight, Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { User, Resource, Topic } from '../types';
import { DocumentViewer } from './DocumentViewer';

interface DashboardProps {
  user: User | null;
  resources: Resource[];
  onUpload: (file: File, onProgress?: (progress: number) => void) => void;
}

export const Dashboard = ({ user, resources, onUpload }: DashboardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setIsUploading(true);
      onUpload(file, (progress) => {
        // You can use progress here if needed, e.g., show progress bar
        console.log('Upload progress:', progress);
      });
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setTimeout(() => setIsUploading(false), 2000); // Mock upload delay
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const stats = [
    { label: 'Resources', value: resources.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Study Time', value: '12h 45m', icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { label: 'Progress', value: `${user?.progress || 0}%`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  ];

  const recentTopics = resources.flatMap(r => r.topics.map(t => ({ ...t, resourceId: r.id, resourceTitle: r.title }))).slice(0, 3);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.displayName?.split(' ')[0]}! 👋</h2>
          <p className="text-gray-500 mt-1">Ready to continue your learning journey today?</p>
        </div>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <Button className="h-12 px-6" disabled={isUploading} onClick={openFileDialog}>
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Upload Resource</span>
              </>
            )}
          </Button>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-500">Selected file: {selectedFile.name}</p>
          )}
        </div>
      </header>

      {previewUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Preview PDF</h3>
          <DocumentViewer pdfUrl={previewUrl} title={selectedFile?.name || 'Preview'} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="flex items-center gap-4 p-5">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Current Learning Path</h3>
            <Button variant="ghost" className="text-indigo-600 text-sm">View All</Button>
          </div>

          <div className="space-y-4">
            {resources.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-gray-50/50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Upload className="w-8 h-8 text-indigo-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">No resources uploaded yet</h4>
                <p className="text-gray-500 max-w-xs mt-2">Upload your study materials to generate a personalized learning path.</p>
              </Card>
            ) : (
              resources.map((resource, i) => (
                <Card key={resource.id} className="p-0 overflow-hidden">
                  <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">{resource.title}</h4>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{resource.topics.length} Topics</span>
                  </div>
                  <div className="p-2">
                    {resource.topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => navigate(`/topic/${resource.id}/${topic.id}`)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            topic.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {topic.completed ? <CheckCircle2 className="w-5 h-5" /> : topic.order + 1}
                          </div>
                          <div className="text-left">
                            <p className={`font-semibold ${topic.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {topic.title}
                            </p>
                            <p className="text-xs text-gray-400">Estimated: 15 mins</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Recommendations & Progress */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Recommended Next</h3>
          <Card className="bg-indigo-600 text-white border-none relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Next Topic</span>
              <h4 className="text-xl font-bold mt-2">Data Structures in Python</h4>
              <p className="text-indigo-100 text-sm mt-2 opacity-90">Based on your recent quiz performance, we suggest revising this topic.</p>
              <Button className="mt-6 w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none">
                Start Learning
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl" />
          </Card>

          <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          <div className="space-y-4">
            {recentTopics.map((topic, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{topic.title}</p>
                  <p className="text-xs text-gray-500">{topic.resourceTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
