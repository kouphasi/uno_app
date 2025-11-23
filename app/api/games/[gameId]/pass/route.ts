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

    gameManager.passTurn(gameId, playerId);
    const game = gameManager.getGame(gameId);

    if (!game || !game.stage) {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }

    const nextPlayer = game.stage.currentPlayer;
    const nextPlayerInfo = game.players.find(p => p.player === nextPlayer);

    return NextResponse.json({
      success: true,
      action: 'pass',
      nextPlayer: {
        playerId: nextPlayerInfo?.playerId,
        playerName: nextPlayerInfo?.playerName,
      },
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
    if (error.message === 'NOT_YOUR_TURN') {
      return NextResponse.json(
        { error: { code: 'NOT_YOUR_TURN', message: 'It is not your turn' } },
        { status: 403 }
      );
    }
    if (error.message === 'NO_DRAWN_CARD') {
      return NextResponse.json(
        { error: { code: 'NO_DRAWN_CARD', message: 'You have not drawn a card to pass' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
