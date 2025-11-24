const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store WebSocket connections by gameId and playerId
const gameConnections = new Map();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, request, gameId, playerId) => {
    console.log(`WebSocket connected: gameId=${gameId}, playerId=${playerId}`);

    // Store connection
    if (!gameConnections.has(gameId)) {
      gameConnections.set(gameId, new Map());
    }
    gameConnections.get(gameId).set(playerId, ws);

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      gameId,
      playerId,
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        // Handle ping-pong for connection health check
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket disconnected: gameId=${gameId}, playerId=${playerId}`);
      const gameMap = gameConnections.get(gameId);
      if (gameMap) {
        gameMap.delete(playerId);
        if (gameMap.size === 0) {
          gameConnections.delete(gameId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for gameId=${gameId}, playerId=${playerId}:`, error);
    });
  });

  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const { pathname, query } = parse(request.url, true);

    if (pathname === '/api/ws') {
      const gameId = query.gameId;
      const playerId = query.playerId;

      if (!gameId || !playerId) {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, gameId, playerId);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

// Broadcast function to send game state updates to all players in a game
function broadcastToGame(gameId, data) {
  const gameMap = gameConnections.get(gameId);
  if (!gameMap) return;

  const message = JSON.stringify(data);
  gameMap.forEach((ws, playerId) => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  });
}

// Broadcast to specific player
function sendToPlayer(gameId, playerId, data) {
  const gameMap = gameConnections.get(gameId);
  if (!gameMap) return;

  const ws = gameMap.get(playerId);
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}

// Export for use in game-manager
global.wsServer = {
  broadcastToGame,
  sendToPlayer,
  hasConnections: (gameId) => {
    const gameMap = gameConnections.get(gameId);
    return gameMap && gameMap.size > 0;
  },
  getConnectionCount: (gameId) => {
    const gameMap = gameConnections.get(gameId);
    return gameMap ? gameMap.size : 0;
  },
};
