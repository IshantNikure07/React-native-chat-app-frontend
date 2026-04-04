import { io } from "socket.io-client";

// Ensure we use the backend URL configured in environment variables
const SOCKET_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

let socket = null;

export const connectSocket = (token) => {
    if (socket) {
        socket.disconnect();
    }
    
    socket = io(SOCKET_URL, {
        auth: {
            token: token
        },
        transports: ["websocket"],
        reconnectionAttempts: 5
    });

    socket.on("connect", () => {
        console.log("Socket connected with id:", socket.id);
    });

    socket.on("connect_error", (error) => {
        console.log("Socket connection error:", error.message);
    });

    socket.on("messageError", (data) => {
        console.error("Message Error:", data.error);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });
    
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn("Socket accessed before initialization.");
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
