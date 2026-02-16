import { NextResponse } from 'next/server';
import { getDataSource } from '@/db';

export async function GET() {
  try {
    const dataSource = await getDataSource();
    
    // Use raw query to sort by numeric value
    const recentSpins = await dataSource.query(`
      SELECT "playerName", "rewardName", "rewardValue", "createdAt"
      FROM spin_logs
      ORDER BY CAST("rewardValue" AS INTEGER) DESC, "createdAt" DESC
      LIMIT 5
    `);

    return NextResponse.json(recentSpins);
  } catch (error) {
    console.error('Recent spins error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
