import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  name: string;
  lastMessage: string;
  profilePic: string;
  time: string;
}

interface MessagesScreenProps {
  navigation: any; // You can replace `any` with your navigation type if you're using TypeScript with React Navigation
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', name: 'John Doe', lastMessage: 'Hey, what\'s up?', profilePic: 'https://randomuser.me/api/portraits/men/10.jpg', time: '10:30 AM' },
    { id: '2', name: 'Jane Smith', lastMessage: 'Are you free tomorrow?', profilePic: 'https://randomuser.me/api/portraits/women/10.jpg', time: 'Yesterday' },
    { id: '3', name: 'Mike Johnson', lastMessage: 'Got the file you sent!', profilePic: 'https://randomuser.me/api/portraits/men/11.jpg', time: '2:00 PM' },
  ]);
  
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Message | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleTheme = (): void => {
    setIsDarkMode(!isDarkMode);
  };

  const openMessage = (contact: Message): void => {
    console.log('Open message with:', contact);
    // navigation.navigate('MessageDetail', { contact }); // Uncomment if using navigation
  };

  const handleMenuPress = (contact: Message): void => {
    setSelectedContact(contact);
    setModalVisible(true);
  };

  const handleBlock = (): void => {
    console.log('Block contact:', selectedContact?.name);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <TouchableOpacity onPress={() => openMessage(item)} style={[styles.messageItem, isDarkMode && styles.darkMessageItem]}>
      <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
      <View style={styles.messageInfo}>
        <Text style={[styles.contactName, isDarkMode && styles.darkText]}>{item.name}</Text>
        <Text style={[styles.lastMessage, isDarkMode && styles.darkText]}>{item.lastMessage}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call-outline" size={24} color={isDarkMode ? "#FFF" : "#4CAF50"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.videoCallButton}>
          <Ionicons name="videocam-outline" size={24} color={isDarkMode ? "#FFF" : "#4CAF50"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleMenuPress(item)} style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={isDarkMode ? "#FFF" : "#333"} />
        </TouchableOpacity>
      </View>

      {/* Time on the top-right corner */}
      <Text style={[styles.messageTime, isDarkMode && styles.darkText]}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Messages</Text>
        
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={30} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      {/* Modal for blocking contact */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Options for {selectedContact?.name}</Text>
            <TouchableOpacity onPress={handleBlock} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Block</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  darkText: {
    color: '#FFF',
  },
  themeButton: {
    position: 'absolute',
    right: 10,
    top: 5,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative', // To position the time on the top-right
  },
  darkMessageItem: {
    backgroundColor: '#333',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    marginRight: 15,
  },
  videoCallButton: {
    marginRight: 15,
  },
  menuButton: {},
  messageTime: {
    position: 'absolute',
    top: 10,
    right: 15,
    fontSize: 12,
    color: '#999',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MessagesScreen;
