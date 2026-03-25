import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/Card';
import { ChevronLeft, CheckCircle2, Play, BookOpen, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Topic, QuizQuestion } from '../types';
import { explanationGenerator, quizGenerator } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface TopicViewProps {
  topic: Topic;
  onComplete: (score: number) => void;
}

export const TopicView = ({ topic, onComplete }: TopicViewProps) => {
  const [view, setView] = useState<'explanation' | 'quiz'>('explanation');
  const [explanation, setExplanation] = useState(topic.content);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleExplainSimply = async () => {
    setIsSimplifying(true);
    try {
      const simpleExplanation = await explanationGenerator(topic.title, true);
      setExplanation(simpleExplanation);
    } catch (error) {
      console.error("Error simplifying explanation", error);
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleStartQuiz = async () => {
    setView('quiz');
    if (quizQuestions.length === 0) {
      try {
        const questions = await quizGenerator(topic.title, topic.content);
        setQuizQuestions(questions);
      } catch (error) {
        console.error("Error generating quiz", error);
      }
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-all">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
          <BookOpen className="w-4 h-4" />
          <span>Topic {topic.order + 1}</span>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'explanation' ? (
          <motion.div
            key="explanation"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{topic.title}</h2>
              <div className="flex gap-2">
                {topic.keyPoints.slice(0, 3).map((point, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <Card className="p-8 prose prose-indigo max-w-none shadow-lg border-none bg-white">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 m-0">Explanation</h3>
                <Button 
                  variant="secondary" 
                  onClick={handleExplainSimply} 
                  disabled={isSimplifying}
                  className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSimplifying ? 'Simplifying...' : 'Explain Simply'}</span>
                </Button>
              </div>
              <div className="text-gray-700 leading-relaxed text-lg">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-indigo-50 border-none p-6">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  Key Points
                </h4>
                <ul className="space-y-3">
                  {topic.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-indigo-800 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="bg-emerald-50 border-none p-6">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5" />
                  Example
                </h4>
                <div className="bg-white/50 p-4 rounded-xl text-emerald-800 text-sm italic border border-emerald-100">
                  {topic.example}
                </div>
              </Card>
            </div>

            <div className="flex justify-center pt-8">
              <Button onClick={handleStartQuiz} className="h-14 px-10 text-lg shadow-xl shadow-indigo-100">
                <span>Start Practice Quiz</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {!showResult ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Practice Quiz</h3>
                  <div className="text-sm font-bold text-gray-500">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length || '...'}
                  </div>
                </div>

                {quizQuestions.length > 0 ? (
                  <div className="space-y-6">
                    <Card className="p-8 shadow-lg border-none">
                      <p className="text-xl font-semibold text-gray-900 mb-8">
                        {quizQuestions[currentQuestionIndex].question}
                      </p>
                      <div className="space-y-3">
                        {quizQuestions[currentQuestionIndex].options.map((option, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionSelect(i)}
                            className={`w-full p-5 rounded-2xl text-left font-medium transition-all border-2 ${
                              selectedOption === null
                                ? 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                                : i === quizQuestions[currentQuestionIndex].correctAnswer
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : selectedOption === i
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-100 opacity-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {selectedOption !== null && i === quizQuestions[currentQuestionIndex].correctAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </Card>

                    {selectedOption !== null && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-gray-50 border-none p-6">
                          <h5 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <HelpCircle className="w-5 h-5 text-indigo-500" />
                            Explanation
                          </h5>
                          <p className="text-gray-600 text-sm">
                            {quizQuestions[currentQuestionIndex].explanation}
                          </p>
                          <Button onClick={handleNextQuestion} className="mt-6 ml-auto">
                            <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Generating your personalized quiz...</p>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center shadow-2xl border-none">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Quiz Completed!</h3>
                <p className="text-gray-500 mt-2 text-lg">You scored {score} out of {quizQuestions.length}</p>
                
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => {
                    setShowResult(false);
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setScore(0);
                    setView('explanation');
                  }}>
                    Review Topic
                  </Button>
                  <Button onClick={() => onComplete(score)}>
                    Finish & Continue
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Trophy = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22V18" />
    <path d="M14 22V18" />
    <path d="M18 4H6v7a6 6 0 0 0 12 0V4Z" />
  </svg>
);
