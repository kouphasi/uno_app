import { memo } from 'react';

interface Player {
  playerId: string;
  playerName: string;
  cardCount: number;
  isUno: boolean;
  isFinished: boolean;
  position?: number;
}

interface PlayerListProps {
  players: Player[];
  currentPlayer?: {
    playerId: string;
    playerName: string;
  };
  myPlayerId: string;
}

function PlayerList({ players, currentPlayer, myPlayerId }: PlayerListProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Players</h2>
      <div className="space-y-2">
        {players.map((player) => {
          const isCurrentPlayer = currentPlayer?.playerId === player.playerId;
          const isMe = player.playerId === myPlayerId;

          return (
            <div
              key={player.playerId}
              className={`
                p-3 rounded-lg transition-all
                ${isCurrentPlayer ? 'bg-yellow-200 border-2 border-yellow-400' : 'bg-gray-100'}
                ${player.isFinished ? 'opacity-50' : ''}
              `}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800">
                    {player.playerName}
                    {isMe && ' (You)'}
                  </span>
                  {player.isUno && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      UNO!
                    </span>
                  )}
                  {player.isFinished && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Finished
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'}
                  </span>
                  {isCurrentPlayer && (
                    <span className="text-yellow-600 animate-pulse">▶</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(PlayerList, (prevProps, nextProps) => {
  // Deep comparison of players array
  if (prevProps.players.length !== nextProps.players.length) return false;

  for (let i = 0; i < prevProps.players.length; i++) {
    const prevPlayer = prevProps.players[i];
    const nextPlayer = nextProps.players[i];

    if (
      prevPlayer.playerId !== nextPlayer.playerId ||
      prevPlayer.cardCount !== nextPlayer.cardCount ||
      prevPlayer.isUno !== nextPlayer.isUno ||
      prevPlayer.isFinished !== nextPlayer.isFinished
    ) {
      return false;
    }
  }

  // Compare currentPlayer
  if (prevProps.currentPlayer?.playerId !== nextProps.currentPlayer?.playerId) {
    return false;
  }

  return prevProps.myPlayerId === nextProps.myPlayerId;
});
