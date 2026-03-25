import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/ui/Card';
import { ArrowRight, CheckCircle2, XCircle, Award } from 'lucide-react';
import { User } from '../types';
import { DSA_QUESTIONS, DSAQuestion } from '../components/dsa-questions';

interface PracticeProps {
  user: User;
}

export const Practice = ({ user }: PracticeProps) => {
  const questions: DSAQuestion[] = DSA_QUESTIONS;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load saved progress
    const savedProgress = localStorage.getItem(`quiz-progress-${user.uid}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentQuestion(progress.question);
      setScore(progress.score);
    }
  }, [user.uid]);

  const handleOptionSelect = (option: number) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === questions[currentQuestion].correctIndex) {
      setScore(score + 1);
      // Auto next if correct
      setTimeout(() => handleNext(), 1500);
    }
    // Save progress
    localStorage.setItem(`quiz-progress-${user.uid}`, JSON.stringify({
      question: currentQuestion,
      score,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setSubmitted(false);
    setShowResults(false);
    localStorage.removeItem(`quiz-progress-${user.uid}`);
  };

  const q = questions[currentQuestion];

  if (showResults) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-8">
        <Card className="text-center p-12">
          <Award className="w-24 h-24 text-yellow-500 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
          <p className="text-5xl font-bold text-indigo-600 mb-8">{score}/{questions.length}</p>
          <p className="text-xl text-gray-600 mb-8">Score: {(score / questions.length * 100).toFixed(0)}%</p>
          <Button onClick={handleRestart} className="text-lg px-8 py-4">
            Take Quiz Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full" />
          <span>Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className="text-sm text-gray-500">
          Score: {score}
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{q.question}</h2>
        
        <div className="space-y-3 mb-8">
          {q.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === index ? 'default' : 'outline'}
              className={`justify-start h-14 p-4 w-full text-left transition-all ${
                submitted 
                  ? index === q.correctIndex 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : selectedOption === index && index !== q.correctIndex
                    ? 'bg-red-100 border-red-300 text-red-800 line-through' 
                    : 'opacity-50'
                  : ''
              }`}
              onClick={() => handleOptionSelect(index)}
              disabled={submitted}
            >
              <span className="font-mono font-semibold w-8">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </div>

        {submitted && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-l-4 border-green-400 mb-8">
            <div className="flex items-start gap-3">
              {selectedOption === q.correctIndex ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-semibold text-lg mb-2">
                  {selectedOption === q.correctIndex ? 'Correct!' : 'Wrong!'}
                </h4>
                <p className="text-gray-700">{q.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleRestart}
            className="flex-1"
          >
            Restart Quiz
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!submitted}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

