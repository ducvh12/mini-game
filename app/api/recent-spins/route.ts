import { NextResponse } from 'next/server';
import { getRepository, SpinLog } from '@/db';

export async function GET() {
  try {
    const spinLogRepo = await getRepository<SpinLog>(SpinLog);
    const recentSpins = await spinLogRepo.find({
      take: 5,
      order: { 
        rewardValue: 'DESC',
        createdAt: 'DESC'
      },
      select: ['playerName', 'rewardName', 'rewardValue', 'createdAt'],
    });

    return NextResponse.json(recentSpins);
  } catch (error) {
    console.error('Recent spins error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
