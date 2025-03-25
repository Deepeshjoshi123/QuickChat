import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";

const wss = new WebSocketServer({ port: 8000 });

interface User {
    socket: WebSocket;
    room: string;
    name: string;
}

let allSocket: User[] = [];

wss.on("connection", (socket) => {
    console.log("User connected");

    socket.onmessage = (message) => {
 
        const parsedMessage = JSON.parse(message.data.toString()); 

        if (parsedMessage.type === "join") {
            allSocket.push({
                socket,
                room: parsedMessage.payload.room,
                name: parsedMessage.payload.name,
            });
        }

        if (parsedMessage.type === "generateRoom") {
            const roomId = uuid().slice(0, 6); 
            socket.send(
                JSON.stringify({
                    type: "roomGenerated",
                    payload: { roomId },
                })
            );
        }

        if (parsedMessage.type === "joinRoom") {
            const roomId = parsedMessage.payload.roomId;
            allSocket.push({
                socket,
                room: roomId,
                name: parsedMessage.payload.name,
            });
            socket.send(
                JSON.stringify({
                    type: "joinRoom",
                    payload: { roomId },
                })
            );
        }

        if (parsedMessage.type === "chat") {
            let currentUserRoom = null;

            for (let i = 0; i < allSocket.length; i++) {
                if (allSocket[i].socket === socket) {
                    currentUserRoom = allSocket[i].room;
                    break;
                }
            }

            for (let i = 0; i < allSocket.length; i++) {
                if (allSocket[i].room === currentUserRoom) {
                    allSocket[i].socket.send(
                        JSON.stringify({
                            type: "chat",
                            payload: {
                                sender: parsedMessage.payload.name, 
                                message: parsedMessage.payload.message,
                            },
                        })
                    );
                }
            }
        }
    };

    socket.on("close", () => {
        allSocket = allSocket.filter((user) => user.socket !== socket);
        console.log("User Disconnected");
    });
});