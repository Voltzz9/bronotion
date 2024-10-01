#!/bin/bash

# Define ports that need to be cleared
ports=("8080" "5432" "3000")

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

echo "Starting Docker Compose build..."
docker-compose build

echo "Starting all services..."
docker-compose up -d db

echo "Database is ready. Checking if tables exist..."

# Check if any tables exist in the public schema
#table_count=$(docker exec postgres-db psql -U admin -d bronotion -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
table_count=$(docker exec postgres-db psql -U admin -d bronotion -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")

if [ -n "$table_count" ] && [ "$table_count" -eq "0" ]; then
    echo "No tables found. Running DDL.sql to create tables..."
    docker exec -i postgres-db psql -U admin -d bronotion -f /docker-entrypoint-initdb.d/DDL.sql
    echo "Tables created successfully."
    echo "Running DML.sql manually will populate tables..."
else
    echo "Tables already exist. Skipping DDL execution."
fi

echo "Starting backend and frontend services..."
docker-compose up -d backend frontend

echo "All services started and database initialized if necessary."
