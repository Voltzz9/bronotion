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

echo "Starting Docker Compose..."

# Build the Docker images
docker-compose build

# Start the database container
docker-compose up -d db

# Start the rest of the services
echo "Starting other services..."
docker-compose up