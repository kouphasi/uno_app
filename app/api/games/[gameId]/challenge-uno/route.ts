import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId, targetPlayerId } = body;

    if (!playerId || !targetPlayerId) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'playerId and targetPlayerId are required' } },
        { status: 400 }
      );
    }

    const penaltyCards = gameManager.challengeUno(gameId, playerId, targetPlayerId);
    const targetPlayerInfo = gameManager.getPlayerInfo(gameId, targetPlayerId);

    return NextResponse.json({
      success: true,
      action: 'uno_penalty',
      targetPlayer: targetPlayerInfo?.playerName,
      penaltyCards,
    });

  } catch (error: any) {
    if (error.message === 'GAME_NOT_FOUND') {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }
    if (error.message === 'TARGET_PLAYER_NOT_FOUND') {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'Target player not found' } },
        { status: 404 }
      );
    }
    if (error.message === 'TARGET_NOT_ONE_CARD') {
      return NextResponse.json(
        { error: { code: 'TARGET_NOT_ONE_CARD', message: 'Target player does not have exactly 1 card' } },
        { status: 400 }
      );
    }
    if (error.message === 'TARGET_ALREADY_DECLARED') {
      return NextResponse.json(
        { error: { code: 'TARGET_ALREADY_DECLARED', message: 'Target player has already declared UNO' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
