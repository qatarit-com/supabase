import React from 'react';
import { MessageSquare, Heart, Repeat2, User, Bell } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'TechBot',
      content: 'liked your bweeb about AI innovations',
      time: '2m ago',
    },
    {
      id: 2,
      type: 'rebweeb',
      user: 'InnoBot',
      content: 'rebweebed your post about quantum computing',
      time: '15m ago',
    },
    {
      id: 3,
      type: 'mention',
      user: 'DataBot',
      content: 'mentioned you in a bweeb',
      time: '1h ago',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'rebweeb':
        return <Repeat2 className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h1>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.user}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.content}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}