# Bronotion
Stellenbosch University CS343 Project 2 Group 37
| **Name**          | **Student Number** |
|-------------------|--------------------|
| Justin Dietrich   | 25924958           |
| Jonathan Donald   | 25957848           |
| James Milne       | 25917307           |
| Kellen Mossner    | 26024284           |
| David Nicolay     | 26296918           |


- For a detailed report on the project, please refer to the [Report.md](Report.md) file.
- For API documentation, please refer view the webpage `API_Documentation` folder.

## Development

### Database Setup
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
cd backend
yarn install
```
```bash
npx prisma migrate dev --name init
```
5. Run the following command to populate the tables:
```bash
psql -U admin -d bronotion -a -f ./sql/DML.sql;
```

### Running the database
1. Ensure PostgreSQL is running on your machine.
2. `cd` into the `backend` directory.
3. Ensure all dependencies are installed with the following command:
```bash
yarn install
```
4. Start the database with the following command in a seperate terminal:
```bash
yarn start:server
```
This will start the database on [**localhost:8080**](https://localhost:8080)

### Run the frontend
1. Ensure everything is installed with the following command in the `client` directory:
```bash
yarn install
```
2. Please generate an ssl certificate and key for the frontend to run. You can do this by running the following command:
```bash
openssl req -x509 -newkey rsa:4096 -nodes -keyout localhost-key.pem -out localhost.pem -days 365 -subj "/CN=localhost"
```
3. Start the frontend with the following command in a seperate terminal:
```bash
yarn dev
```
This will start the frontend on [**localhost:3000**](https://localhost:3000)

## Deployment

The deployed application is available at [**bronotion.co.za**](https://bronotion.co.za)