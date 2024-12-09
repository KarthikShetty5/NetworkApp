const expres = require("express");
const http = require("http"); // For creating a server
const { Server } = require("socket.io"); // For real-time communication
const path = require("path");
const dbConfig = require("../Backend/middleware/mongoose"); // Your existing DB config
const cloudinary = require('cloudinary').v2;
const bodyParser = require('body-parser');
const app = expres();
const server = http.createServer(app); // Create an HTTP server for Socket.IO
const io = new Server(server, { cors: { origin: "*" } }); // Enable CORS for Socket.IO

// Middleware
app.use(expres.json());

// Routes
const messageRoute = require("./routes/message.route"); // New: For messaging
const profileRoute = require("./routes/profile.route");
const getLocationRoute = require("./routes/getLocation.route");

app.use("/api/profile", profileRoute);
app.use("/api/track", getLocationRoute);
app.use("/api/messages", messageRoute); // New route

// Configure Cloudinary with credentials from .env
cloudinary.config({
    cloud_name: 'dhwipoxjo',
    api_key: '929858882875926',
    api_secret: 'Nt2FPq2C3vYthy4s7Br_nBGN7rA',
});

app.get('/api/images/cloudinarySign', (req: any, res: { json: (arg0: { uploadURL: string; apiKey: string | undefined; signature: any; timestamp: number; }) => void; }) => {
    const timestamp = Math.round(new Date().getTime() / 1000); // Current timestamp
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      'Nt2FPq2C3vYthy4s7Br_nBGN7rA'
    );
  
    res.json({
      uploadURL: `https://api.cloudinary.com/v1_1/dhwipoxjo/image/upload`,
      apiKey: '929858882875926',
      signature,
      timestamp,
    });
  });

// Socket.IO for Real-Time Messaging
io.on("connection", (socket:any) => {
  console.log("User connected:", socket.id);

  // Join user to their room (room = userId)
  socket.on("join", (userId: any) => {
    console.log(`User joined room: ${userId}`);
    socket.join(userId);
  });

  // Listen for messages from clients
  socket.on("send_message", (data: { receiver: any; }) => {
    console.log("Message received:", data);
    io.to(data.receiver).emit("receive_message", data); // Emit the message to the receiver
  });

  // Handle disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Default route
app.get("/", (req: any, res: { send: (arg0: string) => any; }) => res.send("Hello World!"));

// Start server
const port = 4000;
server.listen(port, () => console.log(`Node Express Server started on port ${port}!`));

