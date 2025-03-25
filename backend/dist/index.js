"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const wss = new ws_1.WebSocketServer({ port: 8000 });
let allSocket = [];
wss.on("connection", (socket) => {
    console.log("User connected");
    socket.onmessage = (message) => {
        // Parse the incoming message from the client
        const parsedMessage = JSON.parse(message.data.toString()); // Fixed: Added `.toString()` to ensure data is parsed correctly
        if (parsedMessage.type === "join") {
            // Add the user to the list of connected users
            allSocket.push({
                socket,
                room: parsedMessage.payload.room,
                name: parsedMessage.payload.name,
            });
        }
        if (parsedMessage.type === "generateRoom") {
            // Generate a new room ID and send it back to the client
            const roomId = (0, uuid_1.v4)().slice(0, 6); // Generate a 6-character room ID
            socket.send(JSON.stringify({
                type: "roomGenerated",
                payload: { roomId },
            }));
        }
        if (parsedMessage.type === "joinRoom") {
            // Add the user to the specified room
            const roomId = parsedMessage.payload.roomId;
            allSocket.push({
                socket,
                room: roomId,
                name: parsedMessage.payload.name,
            });
            // Notify the client that they have successfully joined the room
            socket.send(JSON.stringify({
                type: "joinRoom",
                payload: { roomId },
            }));
        }
        if (parsedMessage.type === "chat") {
            // Find the room of the current user
            let currentUserRoom = null;
            for (let i = 0; i < allSocket.length; i++) {
                if (allSocket[i].socket === socket) {
                    currentUserRoom = allSocket[i].room;
                    break; // Exit the loop once the user is found
                }
            }
            // Broadcast the message to all users in the same room
            for (let i = 0; i < allSocket.length; i++) {
                if (allSocket[i].room === currentUserRoom) {
                    allSocket[i].socket.send(JSON.stringify({
                        type: "chat",
                        payload: {
                            sender: parsedMessage.payload.name, // Include sender's name
                            message: parsedMessage.payload.message,
                        },
                    }));
                }
            }
        }
    };
    socket.on("close", () => {
        // Remove the user from the list when they disconnect
        allSocket = allSocket.filter((user) => user.socket !== socket);
        console.log("User Disconnected");
    });
});
