import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId, cardName, selectedColor } = body;

    if (!playerId || !cardName) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'playerId and cardName are required' } },
        { status: 400 }
      );
    }

    const card = gameManager.playCard(gameId, playerId, cardName, selectedColor);
    const game = gameManager.getGame(gameId);

    if (!game || !game.stage) {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }

    const nextPlayer = game.stage.currentPlayer;
    const nextPlayerInfo = game.players.find(p => p.player === nextPlayer);

    const response: any = {
      success: true,
      action: 'play_card',
      card: {
        cardName: card.name,
      },
      nextPlayer: {
        playerId: nextPlayerInfo?.playerId,
        playerName: nextPlayerInfo?.playerName,
      },
    };

    if (selectedColor) {
      response.selectedColor = selectedColor;
    }

    if (card.drawNum > 0) {
      response.effect = {
        type: 'draw',
        count: card.drawNum,
        targetPlayer: nextPlayerInfo?.playerId,
      };
    } else if (card.symbol === 'skip') {
      response.effect = {
        type: 'skip',
      };
    } else if (card.symbol === 'reverse') {
      response.effect = {
        type: 'reverse',
      };
    }

    return NextResponse.json(response);

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
    if (error.message === 'CARD_NOT_FOUND') {
      return NextResponse.json(
        { error: { code: 'CARD_NOT_FOUND', message: 'Card not found in your hand' } },
        { status: 404 }
      );
    }
    if (error.message === 'INVALID_CARD') {
      return NextResponse.json(
        { error: { code: 'INVALID_CARD', message: 'This card cannot be played' } },
        { status: 400 }
      );
    }
    if (error.message === 'MUST_HANDLE_DRAWN_CARD') {
      return NextResponse.json(
        { error: { code: 'MUST_HANDLE_DRAWN_CARD', message: 'You must play or pass the drawn card first' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
