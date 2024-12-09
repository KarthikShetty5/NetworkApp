const exp = require('express');
const Message = require('../model/Message.model');
const rout = exp.Router();

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

module.exports = rout;
