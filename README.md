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

## Run the frontend
1. Start the frontend with the following command in a seperate terminal:
```bash
yarn install
```
```bash
yarn dev
```
This will start the frontend on port 3000.
2. You can login with the following credentials:
```bash
email: admin@example.com
password: admin
```

## Running the Docker

### Prerequisites

Before you can run the project in Docker, you need to have the following installed:

- **Docker Desktop**: Ensure you have Docker Desktop installed on your machine. You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop). 

### Installation Steps for Docker Desktop

1. **Download Docker Desktop**:
   - Go to [Docker Desktop](https://www.docker.com/products/docker-desktop) and download the appropriate version for your operating system (Windows/Mac).
   - Check this video if using WSL2: [Docker Desktop with WSL2](https://www.youtube.com/watch?v=5RQbdMn04Oc).
  
2. **Install Docker Desktop**:
   - Follow the installation instructions specific to your operating system.

3. **Start Docker Desktop**:
   - After installation, launch Docker Desktop. Make sure it's running before proceeding. (Ensure that you have created an account and logged in to Docker Desktop).

## Running the Project

To run the Docker container for this project, follow these steps:

Don't forget to have docker desktop running.

1. **In the Terminal**: Make sure that you are in the root directory of the project.

2. **Grant Permissions for the Run Script**:

        chmod +x ./run.sh

3. **Execute the Run Script**: <br>
   **NOTE THIS SHOULD ONLY BE RUN WHEN U HAVE PULLED A BRANCH Else you can run (press the play buttons) the container folder "group-37" in Docker Desktop.**

        ./run.sh [dev|prod] [clean]

   **The clean arguement is optional and will delete all containers and images.**
<br>
<hr>
<br>
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
