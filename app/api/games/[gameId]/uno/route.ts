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

    if (!playerId) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'playerId is required' } },
        { status: 400 }
      );
    }

    gameManager.declareUno(gameId, playerId);
    const playerInfo = gameManager.getPlayerInfo(gameId, playerId);

    return NextResponse.json({
      success: true,
      action: 'uno_declared',
      playerName: playerInfo?.playerName,
    });

  } catch (error: any) {
    if (error.message === 'GAME_NOT_FOUND') {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }
    if (error.message === 'PLAYER_NOT_FOUND') {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' } },
        { status: 404 }
      );
    }
    if (error.message === 'UNO_NOT_APPLICABLE') {
      return NextResponse.json(
        { error: { code: 'UNO_NOT_APPLICABLE', message: 'You must have exactly 1 card to declare UNO' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
