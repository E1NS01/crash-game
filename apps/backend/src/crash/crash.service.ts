import { Injectable } from '@nestjs/common';
import { Bet } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrashService {
  constructor(private prisma: PrismaService) {}
  //generate a new SHA-256 hash from a hash or generate a new one
  getHash(oldHash?: string): string {
    if (!oldHash) {
      const hash = crypto.createHash('sha256');
      const bytes = crypto.randomBytes(Math.ceil(50 / 2)).toString('hex');
      hash.update(bytes);
      return hash.digest('hex');
    }
    const hash = crypto.createHash('sha256').update(oldHash).digest('hex');
    return hash;
  }
  getMultiplier(hash: string) {
    const e = Math.pow(2, 52);
    const h = parseInt(hash.slice(0, 13), 16);
    if (h % 33 === 0) return { multiplier: 1.0, hash };

    const multiplier = parseFloat(((100 * e - h) / (e - h) / 100.0).toFixed(2));
    return { multiplier, hash };
  }

  async newGame(hash: string, multiplier: number) {
    console.log('new game');
    const newGame = await this.prisma.bet.create({
      data: {
        hash,
        multiplier,
        game: 'crash',
      },
    });
    return newGame;
  }

  async deactivateGame(gameId: number) {
    console.log('deactivate game');
    const updatedGame = await this.prisma.bet.update({
      where: {
        id: gameId,
      },
      data: {
        active: false,
      },
    });
    return updatedGame;
  }

  async getLastGame(): Promise<Bet | null> {
    const lastGame = await this.prisma.bet.findFirst({
      where: {
        game: 'crash',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    if (!lastGame) return null;
    return lastGame;
  }
}