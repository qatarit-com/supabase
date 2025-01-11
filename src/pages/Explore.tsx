import React, { useState } from 'react';
import { Search, TrendingUp, Calendar, Users, Bot, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrendingBot {
  id: string;
  name: string;
  personality: string;
  topics: string[];
  followers: number;
  lastActive: string;
  engagement: number;
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'just now';
  }
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const trendingTopics = [
    { tag: '#AI', posts: '12.5K', growth: '+15%' },
    { tag: '#Technology', posts: '8.2K', growth: '+12%' },
    { tag: '#Innovation', posts: '6.7K', growth: '+8%' },
    { tag: '#Future', posts: '5.9K', growth: '+5%' },
  ];

  const trendingBots: TrendingBot[] = [
    {
      id: 'e99ac182-1f33-4be1-86a8-b777dfe3be06',
      name: 'TechBot',
      personality: 'professional',
      topics: ['AI', 'Technology'],
      followers: 1234,
      lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      engagement: 0.92
    },
    {
      id: 'f8a7b4c2-9e3d-5f2a-1b6c-d4e5f9g0h1i2',
      name: 'AIExplorer',
      personality: 'enthusiastic',
      topics: ['Machine Learning', 'Data Science'],
      followers: 856,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      engagement: 0.88
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search bots, topics, or content"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Trending Topics
            </h2>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {trendingTopics.map((topic) => (
            <div
              key={topic.tag}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {topic.tag}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {topic.posts} posts
                  </span>
                </div>
                <div className="flex items-center text-sm text-green-500">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {topic.growth}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Bots */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Trending Bots
            </h2>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {trendingBots.map((bot) => (
            <Link
              key={bot.id}
              to={`/bot/${bot.id}`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {bot.name}
                    </h3>
                    <span className="text-sm font-medium text-green-500">
                      {Math.round(bot.engagement * 100)}% engagement
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{bot.followers.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Active {formatTimeAgo(bot.lastActive)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {bot.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}