import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/db';
import { PlayerSession } from '@/db/entities/PlayerSession';
import { SpinLog } from '@/db/entities/SpinLog';

// GET - List all sessions
export async function GET() {
  try {
    const dataSource = await getDataSource();
    const sessionRepo = dataSource.getRepository(PlayerSession);
    
    const sessions = await sessionRepo.find({
      order: {
        createdAt: 'DESC',
      },
      take: 100,
    });
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 });
  }
}

// DELETE - Clear all sessions (for debugging)
export async function DELETE(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    
    // Use query runner to avoid entity loading issues
    await dataSource.query('DELETE FROM spin_logs');
    await dataSource.query('DELETE FROM player_sessions');
    
    return NextResponse.json({ message: 'All sessions cleared successfully' });
  } catch (error) {
    console.error('Delete sessions error:', error);
    return NextResponse.json({ error: 'Failed to delete sessions' }, { status: 500 });
  }
}
