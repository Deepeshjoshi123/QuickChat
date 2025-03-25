import { useEffect, useRef, useState } from "react";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [sendMessage, setSendMessage] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      if (parsedMessage.type === "chat") {
        setMessages((m) => [
          ...m,
          `${parsedMessage.payload.sender}: ${parsedMessage.payload.message}`,
        ]);
      } else if (parsedMessage.type === "roomGenerated") {
        setRoom(parsedMessage.payload.roomId);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const generateRoom = () => {
    wsRef.current?.send(JSON.stringify({ type: "generateRoom" }));
  };

  const joinRoom = () => {
    if (!room.trim() || !name.trim()) return;
    wsRef.current?.send(
      JSON.stringify({
        type: "joinRoom",
        payload: {
          roomId: room,
          name: name,
        },
      })
    );
    setJoined(true);
  };

  const sendMessageHandler = () => {
    if (!sendMessage.trim()) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        payload: {
          name: name,
          message: sendMessage,
        },
      })
    );

    setSendMessage("");
  };

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="border-2 flex flex-col items-center justify-center border-indigo-700 w-full md:w-3/4 lg:w-2/4 h-auto md:h-3/4 p-4 rounded-lg shadow-lg bg-gray-800">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-4">
          🗨️ QuickChat
        </h1>

        {!joined ? (
          // Room Join Section
          <div className="w-full flex flex-col space-y-4">
            <div className="w-full">
              <label className="block text-white text-sm font-bold mb-2">
                Your Name
              </label>
              <input
                value={name}
                type="text"
                placeholder="Enter your name..."
                className="w-full border border-gray-600 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-full">
              <label className="block text-white text-sm font-bold mb-2">
                Room ID
              </label>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <input
                  value={room}
                  type="text"
                  placeholder="Enter Room ID..."
                  className="w-full border border-gray-600 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  onChange={(e) => setRoom(e.target.value)}
                />
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none"
                  onClick={generateRoom}
                >
                  Generate Room
                </button>
              </div>
            </div>
            <button
              className="w-full bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
        ) : (
          <>
            {/* Room Info */}
            <div className="w-full bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-white text-lg">
                Room Code: <span className="font-semibold">{room}</span>
              </p>
              <p className="text-white text-lg">
                Your Name: <span className="font-semibold">{name}</span>
              </p>
            </div>

            {/* Chat Messages */}
            <div className="w-full h-48 md:h-64 bg-gray-700 rounded-lg p-4 mb-4 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div key={idx} className="text-white mb-2">
                  {msg}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="w-full flex flex-col md:flex-row">
              <input
                value={sendMessage}
                type="text"
                placeholder="Type a message..."
                className="w-full border border-gray-600 px-4 py-2 rounded-md md:rounded-l-md md:rounded-r-none bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 mb-2 md:mb-0"
                onChange={(e) => setSendMessage(e.target.value)}
              />
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded-md md:rounded-r-md md:rounded-l-none hover:bg-indigo-700 focus:outline-none"
                onClick={sendMessageHandler}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
