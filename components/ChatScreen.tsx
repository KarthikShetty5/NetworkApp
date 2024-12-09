import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import io from "socket.io-client";

const SOCKET_URL = "http://192.168.54.81:5000"; // Update with your backend URL

const ChatScreen = ({ route, navigation }: any) => {
  const { contact, userId } = route.params;
  interface Message {
    sender: string;
    receiver: string;
    content: string;
  }
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(SOCKET_URL, { query: { userId } });
    setSocket(newSocket);

    // Join the room for this chat
    newSocket.emit("join", { sender: userId, receiver: contact.userId });

    // Listen for incoming messages
    newSocket.on("receive_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, contact.id]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${SOCKET_URL}/api/messages?sender=${userId}&receiver=${contact.userId}`
      );
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      sender: userId,
      receiver: contact.userId,
      content: newMessage.trim(),
    };

    try {
      // Save the message to the backend
      const response = await fetch(`${SOCKET_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error("Failed to send message:", await response.text());
        return;
      }

      const savedMessage = await response.json();

      // Emit the message through Socket.IO
      socket.emit("send_message", savedMessage.newMessage);

      // Update local state
      setMessages((prevMessages) => [...prevMessages, savedMessage.newMessage]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const renderMessage = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === userId ? styles.outgoingMessage : styles.incomingMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <Image source={{ uri: contact.imageUrl }} style={styles.profilePic} />
        <Text style={styles.title}>{contact.name}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:30,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 20,
    marginLeft:10
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messageList: {
    flex: 1,
    marginTop:10,
    paddingHorizontal: 15,
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  outgoingMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
  },
  incomingMessage: {
    alignSelf: "flex-start",
    backgroundColor: "purple",
  },
  messageText: {
    color: "#FFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#FFF",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom:10
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 20,
    marginBottom:10
  },
});

export default ChatScreen;
