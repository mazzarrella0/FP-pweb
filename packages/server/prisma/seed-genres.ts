import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genres = [
  { name: 'Fiction' },
  { name: 'Non-Fiction' },
  { name: 'Mystery' },
  { name: 'Thriller' },
  { name: 'Romance' },
  { name: 'Science Fiction' },
  { name: 'Fantasy' },
  { name: 'Horror' },
  { name: 'Biography' },
  { name: 'Autobiography' },
  { name: 'History' },
  { name: 'Science' },
  { name: 'Technology' },
  { name: 'Self-Help' },
  { name: 'Business' },
  { name: 'Education' },
  { name: 'Philosophy' },
  { name: 'Psychology' },
  { name: 'Religion' },
  { name: 'Poetry' },
  { name: 'Drama' },
  { name: 'Comedy' },
  { name: 'Adventure' },
  { name: 'Children' },
  { name: 'Young Adult' },
  { name: 'Comics' },
  { name: 'Graphic Novel' },
  { name: 'Cookbook' },
  { name: 'Travel' },
  { name: 'Art' },
  { name: 'Music' },
  { name: 'Sports' },
  { name: 'Health' },
  { name: 'Fitness' },
  { name: 'Medical' },
  { name: 'Law' },
  { name: 'Politics' },
  { name: 'Economics' },
  { name: 'Mathematics' },
  { name: 'Programming' },
];

async function main() {
  console.log('Start seeding genres...');

  for (const genre of genres) {
    const created = await prisma.genre.upsert({
      where: { name: genre.name },
      update: {},
      create: genre,
    });
    console.log(`Created/Updated genre: ${created.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
