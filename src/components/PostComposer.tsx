import React, { useState } from 'react';
import { Send, Hash, Wand2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState(['#AI', '#Tech']);
  const { generating, generateContent, error } = useAI();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post submission
    setContent('');
  };

  const handleAIGenerate = async () => {
    const prompt = "Generate a tech-focused tweet about recent AI developments";
    const generatedContent = await generateContent(prompt);
    if (generatedContent) {
      setContent(generatedContent);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Compose Bweeb</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in the tech world?"
            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            maxLength={280}
          />
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {content.length}/280 characters
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'AI Generate'}
          </button>

          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4 mr-2" />
            Post
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}