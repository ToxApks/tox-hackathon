import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, StopCircle } from 'lucide-react';
import { Card, Button } from '../components/ui/Card';
import { User } from '../types';

interface CodingPlaygroundProps {
  user: User;
}

export const CodingPlayground = ({ user }: CodingPlaygroundProps) => {
  const [code, setCode] = useState('// Write your code here\nconst greet = () => console.log("Hello World!");');
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput('Error: Code is empty');
      return;
    }

    setIsRunning(true);
    setOutput('Running...');
    try {
      const response = await fetch('http://localhost:3001/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input }),
      });

      const result = await response.json();
      setOutput(result.output || result.error || 'No output');
    } catch (error) {
      setOutput('Error: Backend not running or network issue');
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setOutput('');
    setInput('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Coding Playground</h2>
          <p className="text-gray-500">Write, run, and test code instantly</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        {/* Editor */}
        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Code Editor
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <Editor 
              height="100%"
              language={language}
              value={code}
              theme="vs-dark"
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
              }}
            />
          </div>
        </Card>

        {/* Input/Output */}
        <div className="space-y-4">
          {/* Input */}
          <Card className="flex flex-col h-[35vh]">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Input (stdin)</h3>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input data for your program..."
              className="flex-1 p-4 font-mono text-sm bg-gray-50 border-0 resize-none focus:ring-2 focus:ring-indigo-500"
            />
          </Card>

          {/* Output */}
          <Card className="flex flex-col h-[35vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Output (stdout)</h3>
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm bg-black text-green-400 overflow-auto whitespace-pre-wrap">
              {output || 'Output will appear here...'}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex gap-3">
          <Button 
            size="lg" 
            onClick={handleRun} 
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-2 font-semibold"
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Code
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={handleClear}>
            <StopCircle className="w-5 h-5" />
            Clear All
          </Button>
        </div>
      </Card>
    </div>
  );
};

