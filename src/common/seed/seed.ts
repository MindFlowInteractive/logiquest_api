import { AppDataSource } from 'src/config/data-source'; // <-- ✅ Import the correct DataSource
import { User } from 'src/user/entities/user.entity';

async function seed() {
  const connection = await AppDataSource.initialize(); // ✅ Correct usage

  const userRepo = connection.getRepository(User);

  const user = userRepo.create({ name: 'John Doe', email: 'john@example.com' });
  await userRepo.save(user);

  await connection.destroy(); // or `.close()` if you're on an older TypeORM version
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
});
