import db, { initDB } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(request: Request) {
  await initDB();

  const body = await request.json();
  const { profileUsername, visitorName, visitorEmail, visitorPhone } = body;

  if (!profileUsername || !visitorName) {
    return Response.json({ success: false, error: 'Name is required.' }, { status: 400 });
  }

  // Find the profile user
  const userResult = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: [profileUsername],
  });

  if (userResult.rows.length === 0) {
    return Response.json({ success: false, error: 'Profile not found.' }, { status: 404 });
  }

  const profileUser = userResult.rows[0];

  // Simple matching based on hometown for now
  // In the future, AI will cross-reference more data
  const matches: string[] = [];

  if (profileUser.hometown) {
    matches.push(`${profileUser.name} is from ${profileUser.hometown}`);
  }

  const connectionId = uuid();

  await db.execute({
    sql: 'INSERT INTO connections (id, profile_user_id, visitor_name, visitor_email, visitor_phone, matches) VALUES (?, ?, ?, ?, ?, ?)',
    args: [connectionId, profileUser.id as string, visitorName, visitorEmail || null, visitorPhone || null, JSON.stringify(matches)],
  });

  return Response.json({
    success: true,
    connectionId,
    profileName: profileUser.name,
    matches,
  });
}
