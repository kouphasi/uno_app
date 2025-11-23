import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = gameManager.getGame(gameId);

    if (!game) {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gameId: game.gameId,
      status: game.status,
      maxPlayers: game.maxPlayers,
      players: game.players.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        position: p.position,
      })),
      createdAt: game.createdAt.toISOString(),
      startedAt: game.startedAt?.toISOString() || null,
    });

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
