# Library Management System

A NestJS + Prisma + PostgreSQL API for managing a library's book catalogue.

## Setup

1. `cd api`
2. `npm install`
3. Copy `.env.example` to `.env` and add your PostgreSQL connection string
4. `npx prisma migrate dev`
5. `npx prisma db seed`
6. `npm run start:dev`

## Schema Decisions

**Why Book references Genre instead of embedding it.**
PostgreSQL is a relational database, so related data lives in separate
tables linked by foreign keys. Each Book stores a `genreId` that points to
a row in the Genre table, rather than copying the genre's details inside
every book.

This keeps genre data in exactly one place. If a genre is renamed, one row
is updated and every book reflects the change. Embedding the genre in each
book would duplicate it hundreds of times, which wastes space and risks
inconsistencies (for example "Sci-Fi" in one book and "Science Fiction" in
another). The foreign key also lets the database enforce that a book can
never point to a genre that does not exist.

**Why a Role enum on User.**
Limiting roles to PATRON and LIBRARIAN at the database level prevents
invalid values and makes permission checks simple later on.

## Deliverables

| Requirement | File |
|---|---|
| Schema (Role enum, User, Genre, Book) | `api/prisma/schema.prisma` |
| Seed script (4 genres, 16 books) | `api/prisma/seed.ts` |
| PrismaService | `api/src/prisma/prisma.service.ts` |
| Environment placeholder | `api/.env.example` |

### `api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  PATRON
  LIBRARIAN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(PATRON)
  createdAt DateTime @default(now())
}

model Genre {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  books Book[]
}

model Book {
  id              Int    @id @default(autoincrement())
  title           String
  author          String
  isbn            String @unique
  totalCopies     Int    @default(1)
  availableCopies Int    @default(1)
  genreId         Int
  genre           Genre  @relation(fields: [genreId], references: [id])
}
```

### `api/prisma/seed.ts`

```ts
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
```

### `api/src/prisma/prisma.service.ts`

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### `api/.env.example`

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```