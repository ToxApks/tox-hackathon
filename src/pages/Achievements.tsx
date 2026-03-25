import React from 'react';
import { Card, Button } from '../components/ui/Card';
import { Trophy, Star, Target, Award, Medal, Crown } from 'lucide-react';

export const Achievements = () => {
  const achievements = [
    {
      id: 'first-upload',
      title: 'First Steps',
      description: 'Upload your first study resource',
      icon: Star,
      unlocked: true,
      unlockedDate: '2024-01-15',
      rarity: 'common'
    },
    {
      id: 'topic-master',
      title: 'Topic Master',
      description: 'Complete 10 topics',
      icon: Target,
      unlocked: true,
      unlockedDate: '2024-01-20',
      rarity: 'rare'
    },
    {
      id: 'quiz-champion',
      title: 'Quiz Champion',
      description: 'Score 100% on 5 quizzes',
      icon: Trophy,
      unlocked: false,
      progress: 3,
      total: 5,
      rarity: 'epic'
    },
    {
      id: 'study-streak',
      title: 'Study Streak',
      description: 'Study for 7 consecutive days',
      icon: Crown,
      unlocked: false,
      progress: 4,
      total: 7,
      rarity: 'legendary'
    },
    {
      id: 'mentor-friend',
      title: 'AI Mentor Friend',
      description: 'Have 50 conversations with AI Mentor',
      icon: Medal,
      unlocked: false,
      progress: 23,
      total: 50,
      rarity: 'rare'
    },
    {
      id: 'resource-collector',
      title: 'Resource Collector',
      description: 'Upload 25 different resources',
      icon: Award,
      unlocked: false,
      progress: 8,
      total: 25,
      rarity: 'epic'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-600';
      case 'rare': return 'bg-blue-100 text-blue-600';
      case 'epic': return 'bg-purple-100 text-purple-600';
      case 'legendary': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Achievements</h2>
        <p className="text-gray-500 mt-1">Track your learning progress and unlock rewards</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={`p-6 ${achievement.unlocked ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity}
              </span>
            </div>

            <h3 className={`text-lg font-bold mb-2 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
              {achievement.title}
            </h3>

            <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
              {achievement.description}
            </p>

            {achievement.unlocked ? (
              <div className="flex items-center gap-2 text-green-600">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Unlocked {new Date(achievement.unlockedDate!).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${(achievement.progress! / achievement.total!) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Keep Learning!</h3>
            <p className="text-indigo-100">Complete more topics and quizzes to unlock new achievements.</p>
          </div>
          <Trophy className="w-12 h-12 text-white/80" />
        </div>
      </Card>
    </div>
  );
};