import { NextResponse } from 'next/server';
import { getRepository, PlayerSession, SpinLog } from '@/db';
import { getDataSource } from '@/db/data-source';
import { MoreThanOrEqual } from 'typeorm';

export async function GET() {
  try {
    const sessionRepo = await getRepository<PlayerSession>(PlayerSession);
    const spinLogRepo = await getRepository<SpinLog>(SpinLog);

    const totalSpins = await spinLogRepo.count();
    const totalPlayers = await sessionRepo.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const spinsToday = await spinLogRepo.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    const dataSource = await getDataSource();
    const topRewards = await dataSource
      .getRepository(SpinLog)
      .createQueryBuilder('spin')
      .select('spin.rewardName', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('spin.rewardName')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const dailySpins = await dataSource
      .getRepository(SpinLog)
      .createQueryBuilder('spin')
      .select('DATE(spin.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(spin.createdAt)')
      .orderBy('date', 'DESC')
      .limit(7)
      .getRawMany();

    return NextResponse.json({
      totalSpins,
      totalPlayers,
      spinsToday,
      topRewards,
      dailySpins,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
