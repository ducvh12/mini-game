require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wheel_minigame',
  synchronize: true,
  entities: [
    __dirname + '/entities/*.js',
    __dirname + '/entities/*.ts',
  ],
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const rewardRepo = AppDataSource.getRepository('Reward');
    const configRepo = AppDataSource.getRepository('EventConfig');

    // Seed rewards
    const rewards = [
      {
        name: '1K',
        type: 'money',
        value: '1000',
        probability: 30,
        quantityLimit: 0,
        quantityRemaining: 0,
        status: 'active',
        message: 'Bạn nhận được lì xì 1.000 VNĐ',
      },
      {
        name: '2K',
        type: 'money',
        value: '2000',
        probability: 25,
        quantityLimit: 0,
        quantityRemaining: 0,
        status: 'active',
        message: 'Bạn nhận được lì xì 2.000 VNĐ',
      },
      {
        name: '5K',
        type: 'money',
        value: '5000',
        probability: 20,
        quantityLimit: 0,
        quantityRemaining: 0,
        status: 'active',
        message: 'Bạn nhận được lì xì 5.000 VNĐ',
      },
      {
        name: '10K',
        type: 'money',
        value: '10000',
        probability: 15,
        quantityLimit: 0,
        quantityRemaining: 0,
        status: 'active',
        message: 'Bạn nhận được lì xì 10.000 VNĐ',
      },
      {
        name: '20K',
        type: 'money',
        value: '20000',
        probability: 7,
        quantityLimit: 100,
        quantityRemaining: 100,
        status: 'active',
        message: 'Bạn nhận được lì xì 20.000 VNĐ',
      },
      {
        name: '50K',
        type: 'money',
        value: '50000',
        probability: 2,
        quantityLimit: 50,
        quantityRemaining: 50,
        status: 'active',
        message: 'Bạn nhận được lì xì 50.000 VNĐ',
      },
      {
        name: '100K',
        type: 'money',
        value: '100000',
        probability: 1,
        quantityLimit: 10,
        quantityRemaining: 10,
        status: 'active',
        message: 'Bạn nhận được lì xì 100.000 VNĐ',
      },
    ];

    for (const reward of rewards) {
      await rewardRepo.save(reward);
    }

    // Seed event config
    const configs = [
      { key: 'event_start', value: '2026-01-25T00:00:00Z' },
      { key: 'event_end', value: '2026-02-15T23:59:59Z' },
      { key: 'max_spins_per_session', value: '3' },
      { key: 'max_spins_per_ip', value: '30' },
      { key: 'spin_cooldown_seconds', value: '10' },
    ];

    for (const config of configs) {
      await configRepo.save(config);
    }

    console.log('✅ Database seeded successfully!');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
