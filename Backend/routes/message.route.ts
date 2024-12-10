const exp = require('express');
const Message = require('../model/Message.model');
const rout = exp.Router();
import Connection from "../model/Connection.model";

// Fetch messages between two users
rout.get('/', async (req: { query: { sender: any; receiver: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  const { sender, receiver } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
rout.post('/send', async (req: { body: { sender: any; receiver: any; content: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; newMessage?: any; error?: any; }): void; new(): any; }; }; }) => {
  const { sender, receiver, content } = req.body;
  try {
    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();

    res.status(201).json({ message: 'Message sent', newMessage });
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
});

rout.post('/recent', async (req: { body: { userId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; recentMessages?: any[]; }): void; new(): any; }; }; }) => {
  try {
    const { userId } = req.body;

    const connections = await Connection.find({ userId: userId });

    if (!connections.length) {
      return res.status(404).json({ message: 'No connections found' });
    }

    // Step 2: Fetch the most recent message for each connection
    const recentMessages = await Promise.all(
      connections[0].userConnection.map(async (connection: { connectionId: any }) => {
        // Fetch all messages between the user and the connection
        const allMessages = await Message.find({
          $or: [
            { sender: userId, receiver: connection },
            { sender: connection, receiver: userId },
          ],
        })
          .lean(); // Convert documents to plain JavaScript objects for easier manipulation

        // If there are messages, sort them by the timestamp in descending order (latest message first)
        if (allMessages.length > 0) {
          allMessages.sort((a: { timestamp: string | number | Date }, b: { timestamp: string | number | Date }) => {
            const timeA = new Date(a.timestamp).getTime(); // Convert timestamp to milliseconds
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA; // Sort in descending order (most recent first)
          });

          // Get the most recent message
          const recentMessageContent = allMessages[0].content;
          const recentMessageTime = allMessages[0].timestamp;

          return {
            connectionId: connection,
            recentMessage: recentMessageContent, // Safely return message content
            time: recentMessageTime, // Attach the timestamp
          };
        } else {
          // If no messages, return a default message
          return {
            connectionId: connection,
            recentMessage: "Start the conversation now...", // Default message if no conversation
            time: null,
          };
        }
      })
    );

    // Return the recent messages for each connection (most recent message for each receiver)
    res.status(200).json({ recentMessages });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = rout;
