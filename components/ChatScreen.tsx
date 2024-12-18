import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Image, 
  Platform,
  Animated as RNAnimated,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Color Palette
const COLORS = {
  background: '#121212',
  primary: '#6A7AE8',
  secondary: '#34D399',
  text: '#E0E0E0',
  messageBackground: '#1E1E1E',
  inputBackground: '#2C2C2C'
};

const SOCKET_URL = "https://network-backend-7dxw.onrender.com";

interface Message {
  sender: string;
  receiver: string;
  content: string;
}

const ChatScreen = ({ route, navigation }: any) => {
  const { contact, userId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);
  
  // Animated values
  const messageInputScale = useSharedValue(1);
  const scrollY = useRef(new RNAnimated.Value(0)).current;

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

  // Memoized render message function
  const renderMessage = useMemo(() => {
    return ({ item, index }: { item: Message, index: number }) => {
      const isOutgoing = item.sender === userId;

      return (
        <View 
          style={[
            styles.messageBubble, 
            isOutgoing ? styles.outgoingMessage : styles.incomingMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.content}</Text>
        </View>
      );
    };
  }, [userId]);

  // Animated input style
  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        scale: withSpring(messageInputScale.value) 
      }]
    };
  });

  useEffect(() => {
    const checkUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId'); // Fetch userId from AsyncStorage
        if (!userId) {
          navigation.replace('SignUp'); 
        }
      } catch (error) {
        console.error('Error checking userId:', error);
      }
    };

    checkUserId();
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#121212']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={30} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: contact.imageUrl }} 
            style={styles.profilePic} 
          />
          <View>
            <Text style={styles.title}>{contact.name}</Text>
            <Text style={styles.subtitle}>Active now</Text>
          </View>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <MaterialCommunityIcons 
              name="phone" 
              size={24} 
              color={COLORS.secondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons 
              name="video" 
              size={24} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Encryption Message */}
      <View style={styles.encryptionMessageContainer}>
        <Ionicons name="lock-closed-outline" size={14} color="white" />
        <Text style={styles.encryptionMessage}>
          {" "}Chat is end-to-end encrypted{" "}
        </Text>
        <Ionicons name="lock-closed-outline" size={14} color="white" />
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messageList}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Message Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <Animated.View 
          style={[styles.inputWrapper, animatedInputStyle]}
        >
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons 
              name="attach" 
              size={24} 
              color={COLORS.secondary} 
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.text}
            value={newMessage}
            onChangeText={setNewMessage}
            onFocus={() => {
              messageInputScale.value = 1.05;
            }}
            onBlur={() => {
              messageInputScale.value = 1;
            }}
          />
          
          <TouchableOpacity 
            onPress={sendMessage} 
            style={styles.sendButton}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  encryptionMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(30,30,30,0.8)", // Light theme background
    borderTopWidth: 1,
    borderColor: "#E0E0E0", // Border for separation
  },
  encryptionMessage: {
    fontSize: 12,
    color: "white", // Subtle text color
    fontStyle: "italic", // Optional: make it look elegant
  },  
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 40,
    backgroundColor: 'rgba(30,30,30,0.8)',
  },
  backButton: {
    marginRight: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
    maxWidth: "75%",
  },
  outgoingMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  incomingMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.messageBackground,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 16,
  },
  inputContainer: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 30,
    paddingHorizontal: 10,
  },
  attachButton: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    paddingHorizontal: 10,
  },
  sendButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;