import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerName } = body;

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'playerName is required' } },
        { status: 400 }
      );
    }

    const { playerId, position } = gameManager.joinGame(gameId, playerName);

    return NextResponse.json({
      gameId,
      playerId,
      playerName,
      position,
    });

  } catch (error: any) {
    if (error.message === 'GAME_NOT_FOUND') {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }
    if (error.message === 'GAME_FULL') {
      return NextResponse.json(
        { error: { code: 'GAME_FULL', message: 'Game is full' } },
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
