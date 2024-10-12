# Bronotion
Stellenbosch University CS343 Project 2 Group 37
| **Name**          | **Student Number** |
|-------------------|--------------------|
| Justin Dietrich   | 25924958           |
| Jonathan Donald   | 25957848           |
| James Milne       | 25917307           |
| Kellen Mossner    | 26024284           |
| David Nicolay     | 26296918           |
## Database Setup
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

# Running the web application
## Running the database
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
This will start the database on port 8080 (because 5432 is the actual PostreSQL database).

## Run the frontend
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
This will start the frontend on port 3000 (with **https**).


## Running the Docker (old)

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

## Running the Project with Docker

To run the Docker container for this project, follow these steps:

Don't forget to have docker desktop running and ensure you have logged in!

1. **In the Terminal**: Make sure that you are in the root directory of the project.

2. **Grant Permissions for the Run Script**:

        chmod +x ./run.sh

3. **Execute the Run Script**: <br>
   **NOTE THIS SHOULD ONLY BE RUN WHEN U HAVE PULLED A BRANCH Else you can run (press the play buttons) the container folder "group-37" in Docker Desktop.**

        ./run.sh [dev|prod] [clean]

   **The clean arguement is optional and will delete all containers, images and volumes.**

4. **Viewing and Manipulating the Database**:
   - You can view the database using the Prisma Studio. To do this, you need to run the Prisma Studio container. You can do this by running the "prisma-studio" container in Docker Desktop. Once the database container is running, you can access the Prisma Studio in your browser by clicking the link "5555:5555" which is highlighted blue under the Ports column in Docker Desktop.
   - ***NOTE: You can only access the Prisma Studio when the database container is running.***

5. **Access the Application**:
   - Once the script has completed, you can access the application at the following URL:
     - [http://localhost:3000](http://localhost:3000)
     - Or you can follow the port "3000:3000" which is highlighted blue under the Ports column in Docker Desktop. 