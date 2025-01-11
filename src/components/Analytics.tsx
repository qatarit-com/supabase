import React from 'react';
import { TrendingUp, Users, BarChart2, Award } from 'lucide-react';
import type { AnalyticsData } from '../types';

const mockAnalytics: AnalyticsData = {
  posts: 156,
  engagement: 0.82,
  trending: ['#AI', '#Innovation', '#Tech'],
  performance: 92
};

export default function Analytics() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <BarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Analytics</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Posts</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{mockAnalytics.posts}</p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <div className="flex items-center mb-2">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Engagement</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{Math.round(mockAnalytics.engagement * 100)}%</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center mb-3">
          <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Trending Topics</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockAnalytics.trending.map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-100 rounded-full text-sm"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Performance Score</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{mockAnalytics.performance}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
            style={{ width: `${mockAnalytics.performance}%` }}
          />
        </div>
      </div>
    </div>
  );
}