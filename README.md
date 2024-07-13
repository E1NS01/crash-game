# Crash Game

## Overview

Crash Game is an exciting multiplayer betting game where players wager on an increasing multiplier. The game features a space-themed interface with a rocket that climbs higher as the multiplier increases.

![Crash Game Screenshot](path/to/your/screenshot.png)

## How It Works

1. Players place a bet on an increasing multiplier.
2. As the game progresses, the multiplier increases, and players can choose to cash out at any time to secure their profits.
3. The backend calculates a secret "crash value" at which the game will stop.
4. If a player hasn't cashed out when the crash value is reached, they lose their bet.
5. The game continues until the crash point, rewarding strategic players who cash out in time.

## Technologies Used

- Frontend: TypeScript, NextJS, PixiJS
- Backend: NestJS, PostgreSQL
- Real-time Communication: Socket.IO
- API: RESTful API for user-related operations
- Development Environment: Docker

## Key Features

- Real-time multiplayer gameplay
- Dynamic multiplier display
- Space-themed visual interface with an animated rocket
- User balance management
- Bet placement and profit-taking mechanics

## Project Structure

The project is divided into two main components:

1. Frontend: Built with NextJS and PixiJS, with the core game logic implemented in the PixiJS stage.
2. Backend: NestJS application with a PostgreSQL database, featuring a CrashGateway that manages the game loop.

## Prerequisites

- Node.js
- Docker
- Docker Compose

## Installation and Running

1. Clone the repository:

```bash
git clone https://github.com/E1NS01/crash-game.git
```

2. Navigate to the project directory

```bash
cd crash-game
```

3. Start the application using Docker Compose

```bash
docker compose up
```

4. Once the setup is complete, open your browser and navigate to:

```
http://localhost:3001
```

## Development

This project uses a Docker development environment. Ensure you have Docker and Docker Compose installed and running on your system before starting the application.

### Backend Development

The backend is built with NestJS and uses PostgreSQL as the database. It handles game logic, user management, and real-time communication.

### Frontend Development

The frontend is a Next.js application with TypeScript. It uses PixiJS for rendering the game graphics and Socket.IO for real-time updates.

## Testing

To run the tests, use the following command:

```bash
yarn test
```
