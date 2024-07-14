#!/bin/bash
set -e

# Sleep for 5 seconds
sleep 5

# Run Prisma migrations
npx prisma migrate deploy

# Start the NestJS application
npm run start:prod