const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the current directory
app.use(express.static(__dirname));

const rooms = new Map();

wss.on("connection", (ws) => {
  let roomId;
  let playerId;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "join":
        roomId = data.roomId;
        if (!rooms.has(roomId)) {
          rooms.set(roomId, [ws]);
          playerId = "X";
          ws.send(JSON.stringify({ type: "start", playerId }));
        } else if (rooms.get(roomId).length === 1) {
          rooms.get(roomId).push(ws);
          playerId = "O";
          rooms.get(roomId).forEach((client, index) => {
            client.send(
              JSON.stringify({
                type: "start",
                playerId: index === 0 ? "X" : "O",
              })
            );
          });
        }
        break;

      case "move":
        if (rooms.has(roomId)) {
          rooms.get(roomId).forEach((client) => {
            if (client !== ws) {
              client.send(
                JSON.stringify({
                  type: "move",
                  position: data.position,
                })
              );
            }
          });
        }
        break;
    }
  });

  ws.on("close", () => {
    if (roomId && rooms.has(roomId)) {
      rooms.set(
        roomId,
        rooms.get(roomId).filter((client) => client !== ws)
      );
      if (rooms.get(roomId).length === 0) {
        rooms.delete(roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
