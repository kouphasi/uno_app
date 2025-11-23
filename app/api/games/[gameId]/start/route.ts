import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId } = body;

    if (!playerId || typeof playerId !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'playerId is required' } },
        { status: 400 }
      );
    }

    gameManager.startGame(gameId, playerId);
    const game = gameManager.getGame(gameId);

    if (!game) {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gameId,
      status: game.status,
      startedAt: game.startedAt?.toISOString(),
    });

  } catch (error: any) {
    if (error.message === 'GAME_NOT_FOUND') {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }
    if (error.message === 'NOT_HOST') {
      return NextResponse.json(
        { error: { code: 'NOT_HOST', message: 'Only host player can start the game' } },
        { status: 403 }
      );
    }
    if (error.message === 'INSUFFICIENT_PLAYERS') {
      return NextResponse.json(
        { error: { code: 'INSUFFICIENT_PLAYERS', message: 'At least 2 players required' } },
        { status: 400 }
      );
    }
    if (error.message === 'GAME_ALREADY_STARTED') {
      return NextResponse.json(
        { error: { code: 'GAME_ALREADY_STARTED', message: 'Game has already started' } },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
