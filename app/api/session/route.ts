import { NextResponse } from 'next/server';
import { getRepository, PlayerSession } from '@/db';
import { getClientIp, getUserAgent } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { playerName } = await req.json();

    if (!playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên của bạn' },
        { status: 400 }
      );
    }

    if (playerName.length > 30) {
      return NextResponse.json(
        { error: 'Tên không được quá 30 ký tự' },
        { status: 400 }
      );
    }

    const sanitizedName = playerName.replace(/[<>]/g, '');
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const sessionRepo = await getRepository<PlayerSession>(PlayerSession);
    const session = sessionRepo.create({
      playerName: sanitizedName,
      ipAddress,
      userAgent,
      spinsUsedToday: 0,
    });

    await sessionRepo.save(session);

    return NextResponse.json({
      sessionId: session.id,
      playerName: session.playerName,
    });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const sessionRepo = await getRepository<PlayerSession>(PlayerSession);
    const session = await sessionRepo.findOne({ where: { id: sessionId } });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      playerName: session.playerName,
      spinsUsedToday: session.spinsUsedToday,
      lastSpinAt: session.lastSpinAt,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
