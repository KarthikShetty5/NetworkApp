import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Alert, 
  Dimensions, 
  Appearance, 
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GetUserApi from '@/app/api/GetUserApi';
import GetRecentApi from '@/app/api/GetRecentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Light and Dark Mode Colors
const LightTheme = {
  background: '#FFFFFF',
  primary: '#6A7AE8',
  secondary: '#34D399',
  text: '#121212',
  card: '#F0F0F0',
  accent: '#FF6B6B',
};

const DarkTheme = {
  background: '#121212',
  primary: '#6A7AE8',
  secondary: '#34D399',
  text: '#E0E0E0',
  card: '#1E1E1E',
  accent: '#FF6B6B',
};

const { width } = Dimensions.get('window');

interface Message {
  userId: string;
  name: string;
  lastMessage: string;
  imageUrl: string;
  time: string;
}

interface MessagesScreenProps {
  navigation: any;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Message | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(
    Appearance.getColorScheme() === 'dark'
  );

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

  const COLORS = isDarkMode ? DarkTheme : LightTheme;

  // Animated values
  const modalScale = useSharedValue(1);
  const messageScale = useSharedValue(1);

  const fetchUserData = async () => {
    const userId = await AsyncStorage.getItem("userId");

    if(!userId){
          Alert.alert("Error", "User not logged in.");
          return;
    }

    try {
      const userResult = await GetUserApi(userId);
      const connections = userResult.data;

      const recentResult = await GetRecentApi(userId);
      const recentMessages = recentResult.recentMessages;

      const mergedData = connections.map((connection: any) => {
        const recentMessage = recentMessages.find(
          (message: any) => message.connectionId === connection.userId
        );

        return {
          userId: connection.userId,
          name: connection.name,
          imageUrl: connection.imageUrl,
          lastMessage: recentMessage ? recentMessage.recentMessage : "Start the conversation now...",
          time: recentMessage ? recentMessage.time : "Just now",
        };
      });

      setMessages(mergedData);
      setLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const openMessage = (contact: Message) => {
    const userId = AsyncStorage.getItem('userId');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Chat", { contact, userId});
  };

  const handleMenuPress = (contact: Message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedContact(contact);
    setModalVisible(true);
    modalScale.value = withSpring(1.1);
  };

  // Animated Modal Style
  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: modalScale.value }],
    };
  });

  // Animated Message Item Style
  const animatedMessageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(messageScale.value) }],
    };
  });

  const renderItem = ({ item }: { item: Message }) => (
    <Animated.View style={animatedMessageStyle}>
      <TouchableOpacity
        onPress={() => openMessage(item)}
        onPressIn={() => {
          messageScale.value = 0.95;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          messageScale.value = 1;
        }}
        style={[styles.messageItem, { backgroundColor: COLORS.card }]}
      >
        <LinearGradient
          colors={[COLORS.card, COLORS.background]}
          style={styles.messageGradient}
        >
          <View style={styles.profileContainer}>
            <Image source={{ uri: item.imageUrl ? item.imageUrl : "https://cdn2.iconfinder.com/data/icons/business-hr-and-recruitment/100/account_blank_face_dummy_human_mannequin_profile_user_-1024.png" }} style={styles.profilePic} />
            <View style={[styles.onlineIndicator, { backgroundColor: COLORS.secondary }]} />
          </View>

          <View style={styles.messageInfo}>
            <Text style={[styles.contactName, { color: COLORS.text }]}>{item.name}</Text>
            <Text style={[styles.lastMessage, { color: COLORS.text }]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="call-outline" size={24} color='red' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="videocam" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMenuPress(item)} style={styles.iconButton}>
              <Ionicons name="ellipsis-vertical-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* <Text style={[styles.messageTime, { color: COLORS.text }]}>{item.time}</Text> */}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.background, COLORS.background]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: COLORS.text }]}>Messages</Text>

        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {loading ? (
        <ActivityIndicator size="large" color="#a77bf1" />
      ) : (
        <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      )}
      
      {
        !loading && messages.length === 0 && (
          <View style={{ flex: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: COLORS.secondary }}>No messages found</Text>
            <Text style={{ color: COLORS.primary }}>Start Connecting with Friends.....</Text>
            <Ionicons style={{ color: COLORS.text, marginTop:20 }} name="map-sharp" size={100} onPress={()=>navigation.navigate('Map')} />
          </View>
        )
      }

      {/* Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalGradient}>
              <Text style={[styles.modalTitle, { color: COLORS.text }]}>
                Options for {selectedContact?.name}
              </Text>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalButton}>
                  <MaterialCommunityIcons name="block-helper" size={24} color={COLORS.text} />
                  <Text style={[styles.modalButtonText, { color: COLORS.text }]}>Block</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton}>
                  <MaterialCommunityIcons name="delete" size={24} color={COLORS.text} />
                  <Text style={[styles.modalButtonText, { color: COLORS.text }]}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
                  <Text style={[styles.modalButtonText, { color: COLORS.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  messageItem: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  messageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profileContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
  },
  messageInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 5,
  },
  messageTime: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 12,
    opacity: 0.5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: width * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    alignItems: 'center',
    padding: 10,
  },
  modalButtonText: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default MessagesScreen;
