#!/bin/bash
set -e

# Sleep for 5 seconds
sleep 5

# Run Prisma migrations
npx prisma migrate dev

# Start the NestJS application
npm run dev