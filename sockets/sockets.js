// NPM Modules
const SocketServer = require('socket.io');

// Utilities
const Logger = require('../utils/winston');

const PORT = 4747;
const io = SocketServer(PORT);

io.on('connection', (socket) => {
  Logger.debug('Socket!! ');
});

module.exports = io;
