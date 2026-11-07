import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const genreData = [
    { name: 'Fiction', slug: 'fiction' },
    { name: 'Science', slug: 'science' },
    { name: 'History', slug: 'history' },
    { name: 'Technology', slug: 'technology' },
  ];

  const genres: Record<string, number> = {};
  for (const g of genreData) {
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    genres[g.slug] = genre.id;
  }

  const books = [
    { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', genre: 'fiction' },
    { title: 'Weep Not, Child', author: "Ngũgĩ wa Thiong'o", isbn: '9780435908300', genre: 'fiction' },
    { title: 'The River Between', author: "Ngũgĩ wa Thiong'o", isbn: '9780435905484', genre: 'fiction' },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '9781400095209', genre: 'fiction' },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', genre: 'science' },
    { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780198788607', genre: 'science' },
    { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', genre: 'science' },
    { title: 'The Gene', author: 'Siddhartha Mukherjee', isbn: '9781476733500', genre: 'science' },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', genre: 'history' },
    { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', genre: 'history' },
    { title: 'Long Walk to Freedom', author: 'Nelson Mandela', isbn: '9780316548182', genre: 'history' },
    { title: 'The Fate of Africa', author: 'Martin Meredith', isbn: '9781610391795', genre: 'history' },
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', genre: 'technology' },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780135957059', genre: 'technology' },
    { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', isbn: '9781593279509', genre: 'technology' },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', genre: 'technology' },
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        totalCopies: 3,
        availableCopies: 3,
        genreId: genres[b.genre],
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());