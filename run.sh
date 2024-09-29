#!/bin/bash

# Define ports that need to be cleared
ports=("5433" "5432")  # Add any other ports you need to clear

echo "Killing processes on conflicting ports..."
for port in "${ports[@]}"; do
    # Find the processes using the port and kill them
    pids=$(lsof -t -i :"$port")
    while [ -n "$pids" ]; do
        for pid in $pids; do
            echo "Killing process on port $port (PID: $pid)"
            kill -9 $pid
        done
        # Refresh the list of PIDs after killing the processes
        pids=$(lsof -t -i :"$port")
    done
    echo "No process found on port $port"
done

echo "Starting Docker Compose build..."

# Build the Docker images
docker-compose build

echo "Starting the database service..."
# Start the database container (db) first
docker-compose up -d db

# Run the DDL.sql file to create the necessary tables
echo "Running DDL.sql to create tables..."
docker exec -i postgres-db psql -U admin -d bronotion -f /docker-entrypoint-initdb.d/DDL.sql

# Now start the backend service
echo "Starting the backend service..."
docker-compose up -d backend

echo "All services started and database initialized."
