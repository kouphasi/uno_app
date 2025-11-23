import { NextRequest, NextResponse } from 'next/server';
import gameManager from '@/lib/game-manager';
import Card from '@/lib/model/card';

function serializeCard(card: Card, playerId?: string, canPlay?: boolean) {
  const baseCard: any = {
    cardId: `card_${card.name}_${Math.random().toString(36).substr(2, 9)}`,
    name: card.name,
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

  if (canPlay !== undefined) {
    baseCard.canPlay = canPlay;
  }

  return baseCard;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'playerId is required' } },
        { status: 400 }
      );
    }

    const game = gameManager.getGame(gameId);
    if (!game) {
      return NextResponse.json(
        { error: { code: 'GAME_NOT_FOUND', message: 'Game not found' } },
        { status: 404 }
      );
    }

    const playerInfo = gameManager.getPlayerInfo(gameId, playerId);
    if (!playerInfo) {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found in this game' } },
        { status: 404 }
      );
    }

    // If game is not started yet, return waiting state
    if (game.status === 'waiting' || !game.stage) {
      return NextResponse.json({
        gameId,
        status: 'waiting',
        players: game.players.map(p => ({
          playerId: p.playerId,
          playerName: p.playerName,
          position: p.position,
        })),
        maxPlayers: game.maxPlayers,
        currentPlayers: game.players.length,
        lastUpdate: game.lastUpdate.toISOString(),
      });
    }

    const stage = game.stage;
    const currentPlayer = stage.currentPlayer;
    const currentPlayerInfo = game.players.find(p => p.player === currentPlayer);
    const isMyTurn = currentPlayerInfo?.playerId === playerId;

    // Serialize my hand with canPlay information
    const myHand = playerInfo.player.cards.map(card =>
      serializeCard(card, playerId, card.canPut(stage))
    );

    // Serialize field card
    const fieldCard = stage.latestCard ? serializeCard(stage.latestCard) : null;

    // Serialize players information (only card count for others)
    const players = game.players.map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      cardCount: p.player.cardCount,
      isUno: p.player.isUno,
      isFinished: stage.finishedPlayers.includes(p.player),
    }));

    // Check if player has drawn a card
    const drawnCard = game.drawnCardByPlayer.get(playerId);
    const drawnCardInfo = drawnCard ? {
      drawnCard: serializeCard(drawnCard, playerId, drawnCard.canPut(stage)),
      canPlayDrawnCard: drawnCard.canPut(stage),
    } : null;

    return NextResponse.json({
      gameId,
      status: game.status,
      turn: stage.turn,
      currentPlayer: {
        playerId: currentPlayerInfo?.playerId,
        playerName: currentPlayerInfo?.playerName,
      },
      isMyTurn,
      fieldCard,
      myHand,
      players,
      turnDirection: stage.isOpposite ? 'counterclockwise' : 'clockwise',
      drawCount: stage.drawNum,
      finishedPlayers: stage.finishedPlayers.map(p => {
        const pInfo = game.players.find(pi => pi.player === p);
        return pInfo?.playerName || 'Unknown';
      }),
      lastUpdate: game.lastUpdate.toISOString(),
      ...drawnCardInfo,
    });

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
