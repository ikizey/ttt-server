const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const playersQueue = require('./models/Queue.js');
const Game = require('./models/Game.js');
const e = require('express');

const PORT = 3001;

const players = [];
const games = [];

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

server.listen(PORT, () => {
  console.log('Server is running on port: ' + PORT);
});

io.on('connection', (client) => {
  console.log('user connected: ' + client.id);
  client.emit('id', { id: client.id });
  client.join('global');
  players.push(client);
  io.in('global').emit('totalPlayers', { players: players.length });

  client.on('name', ({ gameId, playerName, playerID }) => {
    client.to(gameId).emit('opponentName', { playerName });
    client.to(gameId).emit('opponentID', { playerID });
  });

  client.on('concede', ({ game }) => {});

  client.on('find', () => {
    const firstInQueue = playersQueue.takeFirst();
    if (!firstInQueue) {
      playersQueue.add(client);
      client.emit('inQueue', {});
    } else {
      const newGameId =
        firstInQueue.id > client.id
          ? client.id + '_' + firstInQueue.id
          : firstInQueue.id + '_' + client.id;

      client.join(newGameId);
      firstInQueue.join(newGameId);
      const newGame = new Game(newGameId, client, firstInQueue);
      games.push(newGame);
      io.in(newGameId).emit('beginGame', {
        gameId: newGameId,
      });
      io.in(newGameId).emit('currentPlayer', {
        player: newGame.currentPlayer.id,
      });
      io.in(newGameId).emit('moves', {
        moves: newGame.flatMoves(),
      });
    }
  });

  client.on('move', ({ gameId, move }) => {
    const currentGame = games.find((game) => game.id === gameId);
    if (!currentGame) {
      client.emit('error', { message: 'no such game' });
      console.error(
        'client ' +
          client.id +
          ' tried to make move in nonexistent game ' +
          gameId
      );
      return;
    }

    if (currentGame.currentPlayer.id !== client.id) {
      client.emit('error', { message: "It's not your turn" });
      console.error(
        'client ' +
          client.id +
          ' tried to make move during opponents turn ' +
          gameId
      );
      return;
    }

    currentGame.makeMove(move);
    io.in(gameId).emit('moves', { moves: currentGame.flatMoves() });

    currentGame.decideGameOver();
    const winner = currentGame.winner;
    if (winner) {
      io.in(gameId).emit('winner', { player: winner });
    } else {
      io.in(gameId).emit('currentPlayer', {
        player: currentGame.currentPlayer.id,
      });
    }
  });

  client.on('disconnect', () => {
    const index = players.indexOf(client);
    if (index > -1) {
      players.splice(index, 1);
    }
    console.log(client.id + ' disconnected');
  });
});
