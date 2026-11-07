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