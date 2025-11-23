import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostPlayerName, maxPlayers = 8 } = body;

    if (!hostPlayerName || typeof hostPlayerName !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'hostPlayerName is required' } },
        { status: 400 }
      );
    }

    if (maxPlayers < 2 || maxPlayers > 8) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'maxPlayers must be between 2 and 8' } },
        { status: 400 }
      );
    }

    const { gameId, playerId } = gameManager.createGame(hostPlayerName, maxPlayers);
    const game = gameManager.getGame(gameId);

    if (!game) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to create game' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      gameId,
      playerId,
      hostPlayer: hostPlayerName,
      maxPlayers,
      currentPlayers: game.players.length,
      status: game.status,
      createdAt: game.createdAt.toISOString(),
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
