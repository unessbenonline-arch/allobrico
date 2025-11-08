import express, { Request, Response } from 'express';
import { query } from '../database';

const router = express.Router();

// Get current user's notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 200);
    const result = await query(
      `SELECT id, type, title, message, payload, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return res.json({ notifications: result.rows });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark one notification as read
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;

    const upd = await query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, type, title, message, payload, is_read, created_at`,
      [id, userId]
    );
    if (upd.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });

    return res.json({ notification: upd.rows[0] });
  } catch (err) {
    console.error('Error marking notification read:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read for current user
router.patch('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [userId]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
