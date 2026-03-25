import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/ui/Card';
import { ArrowRight, CheckCircle2, XCircle, Award, Brain, Clock } from 'lucide-react';
import { User } from '../types';
import { DSA_QUESTIONS, DSAQuestion } from '../components/dsa-questions';

interface DSAQuizProps {
  user: User;
}

export const DSAQuiz = ({ user }: DSAQuizProps) => {
  const questions: DSAQuestion[] = DSA_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isSubmitted]);

  useEffect(() => {
    const saved = localStorage.getItem(`dsa-quiz-${user.uid}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentIndex(parsed.currentIndex);
      setScore(parsed.score);
    }
  }, [user.uid]);

  const handleAnswerSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore(score + 1);
      // Auto next if correct
      setTimeout(() => handleNext(), 1500);
    }
    localStorage.setItem(`dsa-quiz-${user.uid}`, JSON.stringify({
      currentIndex,
      score,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setTimeLeft(30);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowResults(false);
    setTimeLeft(30);
    localStorage.removeItem(`dsa-quiz-${user.uid}`);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center p-12">
          <Award className="w-24 h-24 text-yellow-500 mx-auto mb-8 animate-bounce" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz Complete!</h1>
          <div className="text-6xl font-black text-indigo-600 mb-8">
            {score}/{questions.length}
          </div>
          <p className="text-xl text-gray-600 mb-12">
            Score: <span className="text-2xl font-bold text-green-600">
              {Math.round((score / questions.length) * 100)}%
            </span>
          </p>
          <Button onClick={handleRestart} className="text-lg px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            Start New Quiz
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            DSA Practice
          </h1>
          <p className="text-xl text-gray-600">
            <Brain className="w-6 h-6 inline -mt-1 mr-2 text-indigo-500" />
            Test your Data Structures & Algorithms knowledge
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {currentIndex + 1} / {questions.length}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Score: <span className="font-semibold text-indigo-600">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Category Badge */}
      <div className="flex items-center gap-3 mb-8">
        <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold text-sm uppercase tracking-wide">
          {currentQuestion.category}
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-10 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 leading-relaxed">
            Q{currentIndex + 1}. {currentQuestion.question}
          </h2>
          
          {/* Timer */}
          <div className="flex justify-end mb-8">
            <div className={`px-4 py-2 rounded-full font-mono font-bold text-sm flex items-center gap-2 ${
              timeLeft > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isSubmitted}
                className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
                  selectedAnswer === index
                    ? index === currentQuestion.correctIndex 
                      ? 'border-green-400 bg-green-50 shadow-md' 
                      : 'border-red-400 bg-red-50 shadow-md line-through'
                    : isSubmitted
                    ? index === currentQuestion.correctIndex 
                      ? 'border-green-200 bg-green-25 border-dashed' 
                      : 'border-gray-100 opacity-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                }`}
              >
                <span className="font-bold text-lg inline-block w-8 mr-4">{String.fromCharCode(65 + index)}.</span>
                <span className="group-hover:text-indigo-900">{option}</span>
              </button>
            ))}
          </div>

          {/* Submit & Feedback */}
          {isSubmitted && (
            <div className="mt-12 p-8 bg-gradient-to-r rounded-2xl border-l-8 border-green-400/50 bg-green-50/80">
              <div className="flex items-start gap-4">
                {selectedAnswer === currentQuestion.correctIndex ? (
                  <CheckCircle2 className="w-12 h-12 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {selectedAnswer === currentQuestion.correctIndex ? 'Correct!' : 'Wrong Answer!'}
                  </h3>
                  <p className="text-lg leading-relaxed text-gray-700">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-8 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => {
              handleRestart();
              setCurrentIndex(0);
            }}
            className="flex-1"
          >
            Restart Quiz
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!isSubmitted}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 font-semibold shadow-lg"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Finish & See Results'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

