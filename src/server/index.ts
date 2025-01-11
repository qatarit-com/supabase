import express from 'express';
import cors from 'cors';
import { ContentBot } from './bot';
import type { BotConfig } from '../types';

const app = express();
const port = 3000;

// Configure CORS to allow requests from the Vite dev server
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-User-Id']
}));

// Enable JSON parsing
app.use(express.json());

// Store bot instances in memory
const bots = new Map<string, ContentBot>();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configure bot settings
app.post('/api/bot/configure', (req, res) => {
  try {
    const config: BotConfig = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create bot instance
    const bot = new ContentBot(config);
    bots.set(userId, bot);

    console.log(`Bot configured for user ${userId}`);
    res.json({ success: true, config: bot.getConfig() });
  } catch (error) {
    console.error('Error configuring bot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate content
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, topic } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bot = bots.get(userId);
    
    if (!bot) {
      return res.status(400).json({ error: 'Bot not configured' });
    }

    console.log(`Generating content for user ${userId}`);
    const response = await bot.generatePost(topic || prompt);
    res.json({ response });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server with proper error handling
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle process termination gracefully
const shutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close after 5s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);