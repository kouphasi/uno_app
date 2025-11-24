'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/app/components/Card';
import PlayerList from '@/app/components/PlayerList';
import ColorPicker from '@/app/components/ColorPicker';
import { POLLING_INTERVAL_MS, CardSymbol } from '@/app/constants/game';
import { useWebSocket } from '@/app/hooks/useWebSocket';

interface GameState {
  gameId: string;
  status: string;
  turn?: number;
  currentPlayer?: {
    playerId: string;
    playerName: string;
  };
  isMyTurn?: boolean;
  fieldCard?: any;
  myHand?: any[];
  players: any[];
  turnDirection?: string;
  drawCount?: number;
  finishedPlayers?: string[];
  drawnCard?: any;
  canPlayDrawnCard?: boolean;
  maxPlayers?: number;
  currentPlayers?: number;
}

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [wsEnabled, setWsEnabled] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    const storedPlayerName = localStorage.getItem('playerName');

    if (!storedPlayerId || !storedPlayerName) {
      router.push('/');
      return;
    }

    setPlayerId(storedPlayerId);
    setPlayerName(storedPlayerName);
  }, [router]);

  const fetchGameState = useCallback(async (): Promise<boolean> => {
    if (!playerId) return false;

    // Prevent concurrent fetches
    if (isFetchingRef.current) return false;
    isFetchingRef.current = true;

    try {
      const response = await fetch(`/api/games/${gameId}/state?playerId=${playerId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Game not found');
          return false;
        }
        throw new Error('Failed to fetch game state');
      }

      const data = await response.json();
      setGameState(data);
      setError('');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [gameId, playerId]);

  // WebSocket connection with fallback to polling
  const { isConnected: wsConnected, connectionError: wsError } = useWebSocket({
    gameId,
    playerId,
    onGameStateUpdate: () => {
      // Fetch updated game state when WebSocket notifies of changes
      fetchGameState();
    },
    onPlayerAction: (action, data) => {
      console.log('Player action received:', action, data);
      // Fetch updated game state on player actions
      fetchGameState();
    },
    onConnect: () => {
      console.log('WebSocket connected, disabling polling');
      setWsEnabled(true);
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected, enabling polling fallback');
      setWsEnabled(false);
    },
    autoReconnect: true,
    maxReconnectAttempts: 5,
  });

  useEffect(() => {
    if (!playerId) return;

    // Initial fetch
    fetchGameState();

    // Setup polling as fallback when WebSocket is not connected
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (!wsConnected || !wsEnabled) {
      // Use polling when WebSocket is not available
      pollingIntervalRef.current = setInterval(fetchGameState, POLLING_INTERVAL_MS);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [playerId, wsConnected, wsEnabled, fetchGameState]);

  const handleStartGame = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to start game');
      }

      const refreshSuccess = await fetchGameState();
      if (!refreshSuccess) {
        throw new Error('Failed to refresh game state after starting');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlayCard = useCallback(async (cardId: string, selectedColor?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/games/${gameId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cardId, selectedColor }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to play card');
      }

      const refreshSuccess = await fetchGameState();
      if (!refreshSuccess) {
        throw new Error('Failed to refresh game state after playing card');
      }
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [gameId, playerId, fetchGameState]);

  const isWildCard = useCallback((card: any): boolean => {
    return card.name === CardSymbol.WILD ||
           card.name === CardSymbol.DRAW4 ||
           card.symbol === CardSymbol.WILD ||
           card.symbol === CardSymbol.DRAW4;
  }, []);

  const handleCardClick = useCallback((card: any) => {
    if (!gameState?.isMyTurn || actionLoading) return;
    if (gameState.drawnCard) return;

    if (isWildCard(card)) {
      setPendingCardId(card.cardId);
      setShowColorPicker(true);
    } else {
      handlePlayCard(card.cardId);
    }
  }, [gameState?.isMyTurn, gameState?.drawnCard, actionLoading, isWildCard, handlePlayCard]);

  const handleColorSelect = (color: string) => {
    if (pendingCardId) {
      handlePlayCard(pendingCardId, color);
    }
    setShowColorPicker(false);
    setPendingCardId(null);
  };

  const handleDrawCard = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/games/${gameId}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to draw card');
      }

      const refreshSuccess = await fetchGameState();
      if (!refreshSuccess) {
        throw new Error('Failed to refresh game state after drawing card');
      }
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlayDrawnCard = async () => {
    if (!gameState?.drawnCard) return;

    if (isWildCard(gameState.drawnCard)) {
      setPendingCardId(gameState.drawnCard.cardId);
      setShowColorPicker(true);
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/games/${gameId}/play-drawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cardId: gameState.drawnCard.cardId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to play drawn card');
      }

      const refreshSuccess = await fetchGameState();
      if (!refreshSuccess) {
        throw new Error('Failed to refresh game state after playing drawn card');
      }
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/games/${gameId}/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to pass');
      }

      const refreshSuccess = await fetchGameState();
      if (!refreshSuccess) {
        throw new Error('Failed to refresh game state after passing');
      }
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnoDeclaration = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/games/${gameId}/uno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to declare UNO');
      }

      const refreshSuccess = await fetchGameState();
      if (!refreshSuccess) {
        throw new Error('Failed to refresh game state after UNO declaration');
      }
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    alert('Game ID copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error && !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (gameState?.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Waiting Room
            </h1>

            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Game ID:</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-lg font-mono bg-white p-2 rounded">
                  {gameId}
                </code>
                <button
                  onClick={copyGameId}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Players ({gameState.currentPlayers}/{gameState.maxPlayers})
              </h2>
              <div className="space-y-2">
                {gameState.players.map((player) => (
                  <div
                    key={player.playerId}
                    className="p-3 bg-gray-100 rounded-lg"
                  >
                    <span className="font-semibold">{player.playerName}</span>
                    {player.playerId === playerId && ' (You)'}
                    {player.position === 0 && ' 👑 Host'}
                  </div>
                ))}
              </div>
            </div>

            {gameState.players[0]?.playerId === playerId && (
              <button
                onClick={handleStartGame}
                disabled={actionLoading || (gameState.currentPlayers || 0) < 2}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {actionLoading ? 'Starting...' : 'Start Game'}
              </button>
            )}

            {gameState.players[0]?.playerId !== playerId && (
              <p className="text-center text-gray-600">
                Waiting for host to start the game...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const myPlayer = gameState?.players.find(p => p.playerId === playerId);
  const canDeclareUno = myPlayer && myPlayer.cardCount === 1 && !myPlayer.isUno;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
      {showColorPicker && (
        <ColorPicker
          onSelectColor={handleColorSelect}
          onCancel={() => {
            setShowColorPicker(false);
            setPendingCardId(null);
          }}
        />
      )}

      {/* WebSocket connection indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-2 ${
            wsConnected
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-white animate-pulse' : 'bg-white'
            }`}
          />
          <span>{wsConnected ? 'Live' : 'Polling'}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-1">
            <PlayerList
              players={gameState?.players || []}
              currentPlayer={gameState?.currentPlayer}
              myPlayerId={playerId}
            />

            <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">Game Info</h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p>Turn: {gameState?.turn}</p>
                <p>Direction: {gameState?.turnDirection === 'clockwise' ? '↻' : '↺'}</p>
                {(gameState?.drawCount || 0) > 0 && (
                  <p className="text-red-600 font-bold">
                    Draw: +{gameState?.drawCount}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {gameState?.isMyTurn ? "Your Turn!" : `${gameState?.currentPlayer?.playerName}'s Turn`}
                </h2>
                <p className="text-gray-600">Field Card:</p>
              </div>

              <div className="flex justify-center mb-6">
                {gameState?.fieldCard && (
                  <Card card={gameState.fieldCard} size="large" />
                )}
              </div>

              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {gameState?.drawnCard && (
                <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                  <p className="text-center font-bold text-gray-800 mb-4">
                    You drew a card!
                  </p>
                  <div className="flex justify-center mb-4">
                    <Card card={gameState.drawnCard} size="medium" />
                  </div>
                  <div className="flex space-x-2 justify-center">
                    {gameState.canPlayDrawnCard && (
                      <button
                        onClick={handlePlayDrawnCard}
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg"
                      >
                        Play Card
                      </button>
                    )}
                    <button
                      onClick={handlePass}
                      disabled={actionLoading}
                      className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg"
                    >
                      Pass
                    </button>
                  </div>
                </div>
              )}

              {gameState?.isMyTurn && !gameState.drawnCard && (
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    onClick={handleDrawCard}
                    disabled={actionLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    Draw Card
                  </button>
                  {canDeclareUno && (
                    <button
                      onClick={handleUnoDeclaration}
                      disabled={actionLoading}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg animate-pulse"
                    >
                      UNO!
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Your Hand ({gameState?.myHand?.length || 0} cards)
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {gameState?.myHand?.map((card) => (
                  <Card
                    key={card.cardId}
                    card={card}
                    onClick={() => handleCardClick(card)}
                    size="medium"
                    disabled={!gameState?.isMyTurn || actionLoading || !!gameState.drawnCard}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
