import { NextResponse } from 'next/server';
import { getRepository, PlayerSession, Reward, SpinLog, EventConfig } from '@/db';
import { getClientIp } from '@/lib/utils';
import { MoreThanOrEqual } from 'typeorm';

interface RewardEntity {
  id: string;
  name: string;
  type: string;
  value: string;
  probability: number;
  quantityLimit: number;
  quantityRemaining: number;
  status: string;
  message: string;
}

function selectReward(rewards: RewardEntity[]): RewardEntity | null {
  const activeRewards = rewards.filter(
    (r) => r.status === 'active' && (r.quantityLimit === 0 || r.quantityRemaining > 0)
  );

  if (activeRewards.length === 0) return null;

  const totalProbability = activeRewards.reduce((sum, r) => sum + r.probability, 0);
  let random = Math.random() * totalProbability;

  for (const reward of activeRewards) {
    random -= reward.probability;
    if (random <= 0) {
      return reward;
    }
  }

  return activeRewards[0];
}

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(req);

    const sessionRepo = await getRepository<PlayerSession>(PlayerSession);
    const session = await sessionRepo.findOne({ where: { id: sessionId } });

    if (!session) {
      return NextResponse.json(
        { error: 'Session không hợp lệ' },
        { status: 404 }
      );
    }

    const configRepo = await getRepository<EventConfig>(EventConfig);
    const configs = await configRepo.find();
    const configMap = configs.reduce((acc, c) => {
      acc[c.key] = c.value;
      return acc;
    }, {} as Record<string, string>);

    const maxSpinsPerSession = parseInt(configMap.max_spins_per_session || '3');
    const maxSpinsPerIp = parseInt(configMap.max_spins_per_ip || '30');
    const cooldownSeconds = parseInt(configMap.spin_cooldown_seconds || '10');

    if (session.spinsUsedToday >= maxSpinsPerSession) {
      return NextResponse.json(
        { error: 'Bạn đã hết lượt quay hôm nay 😊' },
        { status: 429 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const spinLogRepo = await getRepository<SpinLog>(SpinLog);
    const ipSpinsToday = await spinLogRepo.count({
      where: {
        ipAddress,
        createdAt: MoreThanOrEqual(today),
      },
    });

    if (ipSpinsToday >= maxSpinsPerIp) {
      return NextResponse.json(
        { error: 'Hôm nay bạn quay nhiều quá rồi 😆' },
        { status: 429 }
      );
    }

    if (session.lastSpinAt) {
      const timeSinceLastSpin = Date.now() - session.lastSpinAt.getTime();
      const cooldownMs = cooldownSeconds * 1000;

      if (timeSinceLastSpin < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastSpin) / 1000);
        return NextResponse.json(
          { error: `Vui lòng chờ ${remainingSeconds} giây nữa` },
          { status: 429 }
        );
      }
    }

    const rewardRepo = await getRepository<Reward>(Reward);
    const rewards = await rewardRepo.find({ where: { status: 'active' } });

    const selectedReward = selectReward(rewards);

    if (!selectedReward) {
      return NextResponse.json(
        { error: 'Hiện tại không có phần thưởng nào' },
        { status: 500 }
      );
    }

    const spinLog = spinLogRepo.create({
      sessionId: session.id,
      playerName: session.playerName,
      rewardId: selectedReward.id,
      rewardName: selectedReward.name,
      rewardValue: selectedReward.value,
      ipAddress,
    });

    await spinLogRepo.save(spinLog);

    session.spinsUsedToday += 1;
    session.lastSpinAt = new Date();
    await sessionRepo.save(session);

    if (selectedReward.quantityLimit > 0) {
      selectedReward.quantityRemaining = Math.max(0, selectedReward.quantityRemaining - 1);
      await rewardRepo.save(selectedReward);
    }

    return NextResponse.json({
      spinId: spinLog.id,
      reward: {
        name: selectedReward.name,
        type: selectedReward.type,
        value: selectedReward.value,
        message: selectedReward.message,
      },
      spinsRemaining: maxSpinsPerSession - session.spinsUsedToday,
    });
  } catch (error) {
    console.error('Spin error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
