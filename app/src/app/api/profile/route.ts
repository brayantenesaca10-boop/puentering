import db, { initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(request: Request) {
  await initDB();

  const body = await request.json();
  const { name, username, hometown, email, recordings, photos } = body;

  if (!name || !username || !hometown) {
    return Response.json({ success: false, error: 'Name, username, and hometown are required.' }, { status: 400 });
  }

  // Check if username exists
  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE username = ?',
    args: [username],
  });

  if (existing.rows.length > 0) {
    return Response.json({ success: false, error: 'Username already taken.' }, { status: 400 });
  }

  const userId = uuid();

  await db.execute({
    sql: 'INSERT INTO users (id, name, username, hometown, email) VALUES (?, ?, ?, ?, ?)',
    args: [userId, name, username, hometown, email || null],
  });

  // Save voice recordings and photos
  if (recordings && Array.isArray(recordings)) {
    for (let i = 0; i < recordings.length; i++) {
      if (recordings[i]) {
        const photoData = (photos && photos[i]) ? photos[i] : null;
        await db.execute({
          sql: 'INSERT INTO voice_answers (id, user_id, question_index, audio_data, photo_data) VALUES (?, ?, ?, ?, ?)',
          args: [uuid(), userId, i, recordings[i], photoData],
        });
      }
    }
  }

  return Response.json({ success: true, username, userId });
}

export async function GET(request: Request) {
  await initDB();

  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return Response.json({ error: 'Username required' }, { status: 400 });
  }

  const userResult = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: [username],
  });

  if (userResult.rows.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const user = userResult.rows[0];

  const voiceResult = await db.execute({
    sql: 'SELECT question_index, audio_data, transcript FROM voice_answers WHERE user_id = ? ORDER BY question_index',
    args: [user.id as string],
  });

  const connectionsResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM connections WHERE profile_user_id = ?',
    args: [user.id as string],
  });

  return Response.json({
    user: {
      name: user.name,
      username: user.username,
      hometown: user.hometown,
      photo_url: user.photo_url,
      created_at: user.created_at,
    },
    voice_answers: voiceResult.rows.map(r => ({
      question_index: r.question_index,
      audio_data: r.audio_data,
      transcript: r.transcript,
      photo_data: r.photo_data || null,
    })),
    connection_count: connectionsResult.rows[0].count,
  });
}
