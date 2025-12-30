// Import required modules
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const nanoid = require('nanoid');
require('dotenv').config();

// Initialize Express app
const app = express();

// Enable CORS only for the specified client URL
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// --- Redis Client Setup ---
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('error', (err) => console.error('Redis connection error:', err));
redis.on('connect', () => console.log('Connected to Redis.'));

// --- Helper Functions ---
const getCurrentTime = (req) => {
    if (process.env.TEST_MODE === '1') {
        const testNowMs = req.headers['x-test-now-ms'];
        if (testNowMs && !isNaN(parseInt(testNowMs, 10))) {
            return parseInt(testNowMs, 10);
        }
    }
    return Date.now();
};

const PASTE_KEY_PREFIX = 'paste:';

async function getAndViewPaste(id, req) {
    const key = `${PASTE_KEY_PREFIX}${id}`;
    const currentTime = getCurrentTime(req);

    const paste = await redis.hgetall(key);

    if (!paste || Object.keys(paste).length === 0) {
        return { paste: null, error: 'not_found' };
    }
    
    const expiresAt = paste.expiresAt ? parseInt(paste.expiresAt, 10) : null;
    const createdAt = paste.createdAt ? parseInt(paste.createdAt, 10) : null;

    if (expiresAt && expiresAt < currentTime) {
        await redis.del(key);
        return { paste: null, error: 'expired' };
    }

    let remainingViews = paste.remainingViews ? parseInt(paste.remainingViews, 10) : null;

    if (remainingViews !== null) {
        const decrementedViews = await redis.hincrby(key, 'remainingViews', -1);
        if (decrementedViews < 0) {
            await redis.del(key); 
            return { paste: null, error: 'view_limit_exceeded' };
        }
        remainingViews = decrementedViews;
    }

    return {
        paste: {
            content: paste.content,
            created_at: createdAt,
            expires_at: expiresAt,
            remaining_views: remainingViews
        },
        error: null
    };
}

// --- API Routes ---

// Create a new paste
app.post('/api/pastes', async (req, res) => {
    try {
        const { content, ttl_seconds, max_views } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content cannot be empty' });
        }

        const id = nanoid(8);
        const createdAt = getCurrentTime(req);
        const expiresAt = ttl_seconds ? createdAt + (ttl_seconds * 1000) : null;
        
        const parsedMaxViews = max_views ? parseInt(max_views, 10) : null;
        if (parsedMaxViews !== null && (isNaN(parsedMaxViews) || parsedMaxViews <= 0)) {
            return res.status(400).json({ error: 'max_views must be a positive integer.' });
        }
        
        const pasteData = {
            content,
            createdAt: createdAt.toString(),
            ...(expiresAt && { expiresAt: expiresAt.toString() }),
            ...(parsedMaxViews && { maxViews: parsedMaxViews.toString(), remainingViews: parsedMaxViews.toString() }),
        };

        const key = `${PASTE_KEY_PREFIX}${id}`;
        await redis.multi().hset(key, pasteData).exec();

        res.status(201).json({ id });

    } catch (error) {
        console.error('Failed to create paste:', error);
        res.status(500).json({ error: 'Failed to create paste' });
    }
});

// Retrieve a paste
app.get('/api/pastes/:id', async (req, res) => {
    try {
        const { paste, error } = await getAndViewPaste(req.params.id, req);

        if (error) {
            return res.status(404).json({ error: `Paste not found (${error})` });
        }
        
        res.json({
            content: paste.content,
            created_at: paste.created_at ? new Date(paste.created_at).toISOString() : null,
            remaining_views: paste.remaining_views,
            expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
        });

    } catch (error) {
        console.error(`Failed to retrieve paste ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to retrieve paste' });
    }
});

// Health check route
app.get('/api/healthz', async (req, res) => {
    try {
        const pingResponse = await redis.ping();
        if (pingResponse === 'PONG') {
            res.status(200).json({ ok: true });
        } else {
            throw new Error('Redis PING command failed.');
        }
    } catch (error) {
        console.error('Health check failed - Redis connection error:', error);
        res.status(200).json({ ok: false, error: 'Redis connection failed' });
    }
});

// --- Error handling middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
