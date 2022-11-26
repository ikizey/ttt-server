class PlayersQueue {
  _queue = [];

  add = (player) => {
    this._queue.unshift(player);
  };

  takeFirst = () => {
    return this._queue.pop();
  };

  remove = (player) => {
    const index = this._queue.indexOf(player);
    if (index >= -1) {
      this._queue.splice(index, 1);
    }
  };
}

const playersQueue = new PlayersQueue();

module.exports = playersQueue;
