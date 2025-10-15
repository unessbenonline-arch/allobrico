import express from 'express';
import pool from '../database';

const router = express.Router();

// Get all conversations for the current user (mock user for now)
router.get('/conversations', async (req: express.Request, res: express.Response) => {
  try {
    // For now, use a mock user ID - in real app this would come from auth
    const userId = '7d6b31d8-3289-48a9-a614-efc43c11b099'; // Mock user ID - Marie Dupont (client)

    const query = `
      SELECT
        c.id,
        c.participant_1,
        c.participant_2,
        c.related_request_id,
        c.title,
        c.last_message_at,
        c.is_active,
        c.created_at,
        c.updated_at,
        -- Get the other participant info
        CASE
          WHEN c.participant_1 = $1 THEN u2.first_name || ' ' || u2.last_name
          ELSE u1.first_name || ' ' || u1.last_name
        END as other_participant_name,
        CASE
          WHEN c.participant_1 = $1 THEN u2.role
          ELSE u1.role
        END as other_participant_role,
        CASE
          WHEN c.participant_1 = $1 THEN u2.id
          ELSE u1.id
        END as other_participant_id,
        -- Get last message
        m.content as last_message_content,
        m.created_at as last_message_time,
        m.sender_id as last_message_sender_id,
        -- Count unread messages
        (
          SELECT COUNT(*)
          FROM messages m2
          WHERE m2.conversation_id = c.id
          AND m2.sender_id != $1
          AND m2.is_read = false
        ) as unread_count
      FROM conversations c
      JOIN users u1 ON c.participant_1 = u1.id
      JOIN users u2 ON c.participant_2 = u2.id
      LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      )
      WHERE (c.participant_1 = $1 OR c.participant_2 = $1)
      AND c.is_active = true
      ORDER BY c.last_message_at DESC
    `;

    const result = await pool.query(query, [userId]);

    const conversations = result.rows.map((row: any) => ({
      id: row.id,
      participants: [
        {
          id: row.participant_1 === userId ? row.participant_2 : row.participant_1,
          name: row.other_participant_name,
          type: row.other_participant_role === 'worker' ? 'worker' : 'client'
        }
      ],
      lastMessage: row.last_message_content ? {
        id: 'last',
        senderId: row.last_message_sender_id,
        senderName: row.other_participant_name,
        senderType: row.other_participant_role === 'worker' ? 'worker' : 'client',
        content: row.last_message_content,
        timestamp: row.last_message_time.toISOString(),
        read: true
      } : undefined,
      unreadCount: parseInt(row.unread_count) || 0,
      updatedAt: row.last_message_at?.toISOString() || row.updated_at.toISOString()
    }));

    res.json(conversations);
    return;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
    return;
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = '7d6b31d8-3289-48a9-a614-efc43c11b099'; // Mock user ID - Marie Dupont (client)

    // First check if user is part of this conversation
    const conversationCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant_1 = $2 OR participant_2 = $2)',
      [conversationId, userId]
    );

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages
    const messagesQuery = `
      SELECT
        m.id,
        m.sender_id,
        m.content,
        m.message_type,
        m.is_read,
        m.read_at,
        m.created_at,
        u.first_name || ' ' || u.last_name as sender_name,
        u.role as sender_type
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `;

    const messagesResult = await pool.query(messagesQuery, [conversationId]);

    const messages = messagesResult.rows.map((row: any) => ({
      id: row.id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderType: row.sender_type === 'worker' ? 'worker' : 'client',
      content: row.content,
      timestamp: row.created_at.toISOString(),
      read: row.is_read
    }));

    // Mark messages as read (messages from the other participant)
    await pool.query(
      `UPDATE messages
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
      [conversationId, userId]
    );

    res.json(messages);
    return;
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
    return;
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = '7d6b31d8-3289-48a9-a614-efc43c11b099'; // Mock user ID - Marie Dupont (client)

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if user is part of this conversation
    const conversationCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant_1 = $2 OR participant_2 = $2)',
      [conversationId, userId]
    );

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Insert message
    const insertQuery = `
      INSERT INTO messages (conversation_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, 'text')
      RETURNING id, created_at
    `;

    const insertResult = await pool.query(insertQuery, [conversationId, userId, content.trim()]);

    // Update conversation's last_message_at
    await pool.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    // Get user info for response
    const userResult = await pool.query(
      'SELECT first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    const newMessage = {
      id: insertResult.rows[0].id,
      senderId: userId,
      senderName: user.first_name + ' ' + user.last_name,
      senderType: user.role === 'worker' ? 'worker' : 'client',
      content: content.trim(),
      timestamp: insertResult.rows[0].created_at.toISOString(),
      read: false
    };

    res.status(201).json(newMessage);
    return;
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
    return;
  }
});

// Start a new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { participantId, requestId, initialMessage } = req.body;
    const userId = '7d6b31d8-3289-48a9-a614-efc43c11b099'; // Mock user ID - Marie Dupont (client)

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if conversation already exists
    let existingConversation = await pool.query(
      `SELECT * FROM conversations
       WHERE ((participant_1 = $1 AND participant_2 = $2) OR (participant_1 = $2 AND participant_2 = $1))
       AND COALESCE(related_request_id::text, '') = COALESCE($3::text, '')
       AND is_active = true`,
      [userId, participantId, requestId || null]
    );

    let conversationId;

    if (existingConversation.rows.length > 0) {
      conversationId = existingConversation.rows[0].id;
    } else {
      // Create new conversation
      const insertConversation = `
        INSERT INTO conversations (participant_1, participant_2, related_request_id, title)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;

      const title = requestId ? 'Discussion concernant une demande' : 'Nouvelle conversation';
      const conversationResult = await pool.query(insertConversation, [
        userId,
        participantId,
        requestId || null,
        title
      ]);

      conversationId = conversationResult.rows[0].id;
    }

    // Send initial message if provided
    if (initialMessage && initialMessage.trim()) {
      await pool.query(
        'INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES ($1, $2, $3, \'text\')',
        [conversationId, userId, initialMessage.trim()]
      );

      // Update conversation's last_message_at
      await pool.query(
        'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
        [conversationId]
      );
    }

    res.status(201).json({ conversationId });
    return;
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
    return;
  }
});

// Mark conversation messages as read
router.put('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = '7d6b31d8-3289-48a9-a614-efc43c11b099'; // Mock user ID - Marie Dupont (client)

    // Check if user is part of this conversation
    const conversationCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant_1 = $2 OR participant_2 = $2)',
      [conversationId, userId]
    );

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark messages as read
    await pool.query(
      `UPDATE messages
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
      [conversationId, userId]
    );

    res.json({ success: true });
    return;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
    return;
  }
});

export default router;