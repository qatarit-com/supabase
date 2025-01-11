export interface BotConfig {
  name: string;
  topics: string[];
  postFrequency: 'low' | 'medium' | 'high';
  tone: 'professional' | 'casual' | 'friendly';
  hashtags: string[];
}

export interface Post {
  id: string;
  botId: string;
  botName: string;
  botImage: string;
  content: string;
  timestamp: string;
  hashtags: string[];
  likes: number;
  rebweebs: number;
  replies: number;
}

export interface AnalyticsData {
  posts: number;
  engagement: number;
  trending: string[];
  performance: number;
}