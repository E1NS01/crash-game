# Crash Game

## Overview

Crash Game is an exciting multiplayer betting game where players wager on an increasing multiplier. The game features a space-themed interface with a rocket that climbs higher as the multiplier increases.

![Crash Game Gif](assets/GameGif.gif)

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

## Key Features

- Dynamic multiplier display
- Visual interface with an animated rocket
- User balance management
- Bet placement and profit-taking mechanics

## Project Structure

The project is divided into two main components:

1. Frontend: Built with NextJS and PixiJS
2. Backend: NestJS application with a PostgreSQL database.

## Prerequisites

To ensure a smooth setup and running experience, please have the following installed:

- Node.js (Requires Node.js version 18 or higher.)
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

3. Install required packages

```bash
yarn install
```

4. Start the application using Docker Compose

```bash
yarn start
```

- This command duplicates the .env.example file, creating a .env file in the project's root directory as well as within both the frontend and backend folders.

5. Once the setup is complete, open your browser and navigate to:

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
