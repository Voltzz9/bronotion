#!/bin/bash

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
    echo "Error: Docker is not installed." >&2
    exit 1
fi

# Check if an argument is provided
if [ $# -eq 0 ]; then
    echo "No argument provided. Usage: ./run.sh [dev|prod] [clean]"
    exit 1
fi

sudo chown -R $(id -u):$(id -g) $HOME/.docker

# Get the first argument
MODE=$1
MODE1=$2

if [ "$MODE1" = "clean" ]; then
    echo "Cleaning up Docker data..."
    # Stop all running containers
    if [ "$(docker ps -aq)" ]; then
        echo "Stopping all running containers..."
        docker stop $(docker ps -aq) || { echo "Failed to stop containers"; exit 1; }
    else
        echo "No containers to stop."
    fi

    # Remove all containers
    if [ "$(docker ps -aq)" ]; then
        echo "Removing all containers..."
        docker rm $(docker ps -aq) || { echo "Failed to remove containers"; exit 1; }
    else
        echo "No containers to remove."
    fi

    # Remove all Docker images
    if [ "$(docker images -q)" ]; then
        echo "Removing all Docker images..."
        docker rmi $(docker images -q) || { echo "Failed to remove images"; exit 1; }
    else
        echo "No images to remove."
    fi

    # Remove all Docker volumes
    if [ "$(docker volume ls -q)" ]; then
        echo "Removing all Docker volumes..."
        docker volume rm $(docker volume ls -q) || { echo "Failed to remove volumes"; exit 1; }
    else
        echo "No volumes to remove."
    fi

    # Display status after cleanup
    echo "Docker cleanup complete."
fi

# Define ports that need to be cleared
ports=("8080" "5432" "3000" "5555")

echo "Killing processes on conflicting ports..."
for port in "${ports[@]}"; do
    pids=$(lsof -t -i :"$port")
    while [ -n "$pids" ]; do
        for pid in $pids; do
            echo "Killing process on port $port (PID: $pid)"
            kill -9 $pid
        done
        pids=$(lsof -t -i :"$port")
    done
    echo "No process found on port $port"
done

# Pull the base image (node:22-alpine) to utilize caching
echo "Pulling base image node:22-alpine..."
docker pull node:22-alpine || { echo "Failed to pull base image"; exit 1; }

echo "Starting Docker Compose build..."
docker-compose build --pull

echo "Starting db services..."
docker-compose up -d db

echo "Waiting for database to start..."
sleep 5
until docker exec postgres-db pg_isready -U admin -d bronotion; do
  echo "PostgreSQL is not ready yet..."
  sleep 5
done
echo "PostgreSQL is ready!"

echo "Checking if tables exist..."

# Check if any tables exist in the public schema
table_count=$(docker exec postgres-db psql -U admin -d bronotion -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")

if [ -n "$table_count" ] && [ "$table_count" -eq "0" ]; then
    echo "No tables found. Running DDL.sql to create tables..."
    docker-compose run --rm prisma-migration-init
    echo "Tables created successfully."
    echo "Populating tables with seed data..."
    docker-compose run --rm prisma-init-seed
    echo "Seed data populated successfully."
else
    echo "Tables already exist. Skipping DDL execution."
fi

echo "Starting Prisma Studio..."
docker-compose up --no-start prisma-studio

echo "Starting backend"
docker-compose up -d backend

echo "Creating both frontend containers..."
docker-compose up --no-start frontend-dev frontend-prod

# Check the argument and run the appropriate command
if [ "$MODE" = "dev" ]; then
    echo "Running in development mode (hot reload enabled)"
    docker-compose up -d frontend-dev
elif [ "$MODE" = "prod" ]; then
    echo "Running in production mode"
    docker-compose up -d frontend-prod
else
    echo "Invalid argument. Use 'dev' for development or 'prod' for production."
    exit 1
fi

echo "All services started and database initialized if necessary."
