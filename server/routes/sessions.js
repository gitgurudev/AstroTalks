// File: server/routes/sessions.js
import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import SYSTEM_PROMPT from '../systemPrompt.js';

const router = express.Router();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mixtral-8x7b-instruct';

// ── POST /api/sessions  — start a new session for a user ──
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const session = await Session.create({ userId, messages: [] });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/sessions/:id  — load a session with its messages ──
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('userId');
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/sessions/user/:userId  — all sessions with preview ──
router.get('/user/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    // Return each session with a short preview (first user message)
    const result = sessions.map((s) => {
      const firstUserMsg = s.messages.find((m) => m.role === 'user');
      return {
        _id: s._id,
        createdAt: s.createdAt,
        messageCount: s.messages.length,
        preview: firstUserMsg
          ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '…' : '')
          : 'New conversation',
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/sessions/:id/message  — send a message, get AI reply, save both ──
router.post('/:id/message', async (req, res) => {
  try {
    const { content, userId } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required.' });

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    // Get user profile to enrich the system prompt context
    const user = await User.findById(userId || session.userId);
    const userContext = user
      ? `\n\nUser profile on file: Name = ${user.name}, DOB = ${user.dob} (DD/MM/YYYY), Sun Sign = ${user.sunSign}, Nakshatra = ${user.nakshatra}. Use this to personalise your answers — do not ask for DOB again.`
      : '';

    // Build message payload for OpenRouter
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT + userContext },
      // Include existing conversation history
      ...session.messages.map(({ role, content }) => ({ role, content })),
      { role: 'user', content },
    ];

    // Call OpenRouter — API key stays on the server, never reaches browser
    const openRouterRes = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AstroTalks',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!openRouterRes.ok) {
      const err = await openRouterRes.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || 'OpenRouter API error.' });
    }

    const data = await openRouterRes.json();
    const replyContent = data?.choices?.[0]?.message?.content?.trim();
    if (!replyContent) return res.status(502).json({ error: 'Empty response from AI.' });

    // Persist both the user message and the AI reply in MongoDB
    session.messages.push({ role: 'user', content });
    session.messages.push({ role: 'assistant', content: replyContent });
    await session.save();

    res.json({ reply: replyContent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/sessions/:id  — delete a session ──
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
