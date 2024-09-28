# Database Setup
FIRST TIME SETUP:
1. Ensure PostgreSQL is installed on your machine AND PostgreSQL is RUNNING on your machine.
2. Create a database called `bronotion` with the following command:
```bash
createdb bronotion
```
3. Create admin user and setup hash function with the following commands:
```bash
psql bronotion
```
```sql
CREATE USER admin WITH PASSWORD 'admin';
ALTER ROLE admin WITH SUPERUSER;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
quit;
```
4. Run the following command to create the tables:
```bash
psql -U admin -d bronotion -a -f ./backend/DDL.sql;
```
5. Run the following command to populate the tables:
```bash
psql -U admin -d bronotion -a -f ./backend/DML.sql;
```


## Running the database
1. Ensure PostgreSQL is RUNNING on your machine.
2. Start the database with the following command in a seperate terminal:
```bash
yarn start:server
```
This will start the database on port 5433 (because 5432 is the actual PostreSQL database).








You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
