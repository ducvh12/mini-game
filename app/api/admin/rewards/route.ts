import { NextResponse } from 'next/server';
import { getRepository, Reward } from '@/db';

export async function GET() {
  try {
    const rewardRepo = await getRepository<Reward>(Reward);
    const rewards = await rewardRepo.find({
      order: { probability: 'DESC' },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Reward ID is required' },
        { status: 400 }
      );
    }

    const rewardRepo = await getRepository<Reward>(Reward);
    await rewardRepo.update(id, data);

    const reward = await rewardRepo.findOne({ where: { id } });
    return NextResponse.json(reward);
  } catch (error) {
    console.error('Update reward error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
