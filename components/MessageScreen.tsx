import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  name: string;
  lastMessage: string;
  profilePic: string;
  time: string;
}

const MessagesScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', name: 'John Doe', lastMessage: 'Hey, what\'s up?', profilePic: 'https://randomuser.me/api/portraits/men/10.jpg', time: '10:30 AM' },
    { id: '2', name: 'Jane Smith', lastMessage: 'Are you free tomorrow?', profilePic: 'https://randomuser.me/api/portraits/women/10.jpg', time: 'Yesterday' },
    { id: '3', name: 'Mike Johnson', lastMessage: 'Got the file you sent!', profilePic: 'https://randomuser.me/api/portraits/men/11.jpg', time: '2:00 PM' },
  ]);

  const [selectedContact, setSelectedContact] = useState<Message | null>(null);
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const openChat = (contact: Message): void => {
    setSelectedContact(contact);
    setChatVisible(true);
  };

  const closeChat = (): void => {
    setChatVisible(false);
    setSelectedContact(null);
    setChatMessages([]);
  };

  const toggleMinimize = (): void => {
    Animated.timing(animation, {
      toValue: isMinimized ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsMinimized(!isMinimized);
  };

  const sendMessage = (): void => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, newMessage]);
      setNewMessage('');
    }
  };

  const chatHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 50], // Adjust dimensions between minimized and maximized states
  });

  const renderItem = ({ item }: { item: Message }) => (
    <TouchableOpacity style={styles.messageItem} onPress={() => openChat(item)}>
      <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
      <View style={styles.messageInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.messageTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      {/* Embedded Chat Window */}
      {chatVisible && selectedContact && (
        <Animated.View style={[styles.chatContainer, { height: chatHeight }]}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={toggleMinimize} style={styles.iconButton}>
              <Ionicons
                name={isMinimized ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
            <Text style={styles.chatContactName}>{selectedContact.name}</Text>
            <TouchableOpacity onPress={closeChat} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {!isMinimized && (
            <>
              <FlatList
                data={chatMessages}
                renderItem={({ item }) => <Text style={styles.chatMessage}>{item}</Text>}
                keyExtractor={(item, index) => index.toString()}
                style={styles.chatMessagesList}
              />
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type a message"
                  value={newMessage}
                  onChangeText={setNewMessage}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                  <Ionicons name="send" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  messageItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
  profilePic: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  messageInfo: { flex: 1 },
  contactName: { fontWeight: 'bold' },
  lastMessage: { color: '#888' },
  messageTime: { fontSize: 12, color: '#888' },
  chatContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 400, 
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    overflow: 'hidden', 
  },
  
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#f4f4f4' },
  chatContactName: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  chatMessagesList: { flex: 1, padding: 10 },
  chatMessage: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 10, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' },
  chatInput: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 25 },
  sendButton: { backgroundColor: '#4CAF50', borderRadius: 25, padding: 10, marginLeft: 10 },
  iconButton: { padding: 5 },
});

export default MessagesScreen;
