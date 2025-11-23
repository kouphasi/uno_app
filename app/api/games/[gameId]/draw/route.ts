import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';

function serializeCard(card: any, canPlay: boolean) {
  const baseCard: any = {
    cardName: card.name,
  };

  if (card.color) {
    baseCard.color = {
      name: card.color.name,
      code: card.color.code,
    };
  }

  if (card.num !== undefined && card.num !== null) {
    baseCard.num = card.num;
  }

  if (card.symbol) {
    baseCard.symbol = card.symbol;
  }

  baseCard.canPlay = canPlay;

  return baseCard;
}

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

    const drawnCard = gameManager.drawCard(gameId, playerId);
    const game = gameManager.getGame(gameId);

    if (!game || !game.stage) {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }

    const canPlay = drawnCard.canPut(game.stage);

    return NextResponse.json({
      success: true,
      action: 'draw_card',
      drawnCard: serializeCard(drawnCard, canPlay),
      canPlayDrawnCard: canPlay,
    });

  } catch (error: any) {
    if (error.message === 'DREW_PENALTY_CARDS') {
      return NextResponse.json({
        success: true,
        action: 'drew_penalty_cards',
        message: 'Drew penalty cards and turn passed',
      });
    }
    if (error.message === 'CAN_PUT_CARD') {
      return NextResponse.json(
        { error: { code: 'CAN_PUT_CARD', message: 'You can put a card from your hand' } },
        { status: 400 }
      );
    }
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
    if (error.message === 'ALREADY_DRAWN') {
      return NextResponse.json(
        { error: { code: 'ALREADY_DRAWN', message: 'You have already drawn a card' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
