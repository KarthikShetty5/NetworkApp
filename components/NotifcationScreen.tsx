import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  useColorScheme
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { acceptNotification, declineNotification, getNotification } from '@/app/api/GetNotificationApi';
import connectUser from '@/app/api/ConnectApi';

// Color Palette
const COLORS = {
  light: {
    background: '#F4F7FE',
    text: '#2C3E50',
    card: '#FFFFFF',
    primary: '#4A6CF7',
    secondary: '#7987A1',
    accent: '#10B981',
    accept: '#4CAF50',
    decline: '#F44336',
    connect: '#FF6EC7'
  },
  dark: {
    background: '#121212',
    text: '#E0E0E0',
    card: '#1E1E1E',
    primary: '#6A7AE8',
    secondary: '#4A5568',
    accent: '#34D399',
    accept: '#2E7D32',
    decline: '#C62828',
    connect: '#FF6EC7'
  }
};

const { width, height } = Dimensions.get('window');

interface Notification {
  _id: string;
  message: string;
  viewed: boolean;
  connectId: string;
  tag: string;
}

type NotificationScreenProps = {
  navigation: any;
};

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  // Use color scheme to determine initial theme
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Animated values
  const notificationScale = useSharedValue(1);

  // Current theme based on dark mode state
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  // Toggle Theme
  const toggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDarkMode(!isDarkMode);
  };

  const handleConnect = async(notificationId: string, connectId:string)=>{
    const userId = await AsyncStorage.getItem('userId');

    if (!userId || !connectId) {
      Alert.alert("Error", "User not logged in.");
      return;
    }
    try{
      const result = await connectUser(userId,connectId);
      if (result.message === 'Successfully connected users') {
        // Remove the notification from the list
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        Alert.alert("Success!!", "Connected Successfully");
      }
      if (result.message === 'Already connected') {
        Alert.alert("Warning", "Already connected, Please decline your connection");
      }
    
    }catch(err){
      console.error('Failed',err)
    }
    console.log("Connect ID",connectId)
  }

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = await AsyncStorage.getItem('userId');
      // const userId="122345"
      if (!userId) {
        Alert.alert("Error", "User not logged in.");
        return;
      }
      try {
        const data = await getNotification(userId);
        const unreadNotifications = data.filter((notification: Notification) => !notification.viewed);
        setNotifications(unreadNotifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  // Handle accept action
  const handleAccept = async (notificationId: string, connectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const result = await acceptNotification(connectId, notificationId, userId);
      
      if (result.message === 'Notification accepted') {
        // Remove the notification from the list
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        Alert.alert('Success', 'Connection accepted');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to accept notification`);
    }
  };

  // Handle decline action
  const handleDecline = async (notificationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const result = await declineNotification(notificationId, userId);
      
      if (result.message === 'Notification declined') {
        // Remove the notification from the list
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        Alert.alert('Success', 'Connection declined');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to decline notification`);
    }
  };

  // Animated Notification Item Component
  const NotificationItem: React.FC<{ item: Notification }> = ({ item }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: withSpring(notificationScale.value) }]
      };
    });

    return (
      <Animated.View 
        style={[styles.notificationItem, { backgroundColor: theme.card, borderColor: theme.secondary }, animatedStyle]}
      >
        <Text style={[styles.message, { color: theme.text }]}>{item.message}</Text>
        <View style={styles.buttonsContainer}>
          {
            item.tag =='Accept' ? 
            <>
            <TouchableOpacity
              onPress={() => handleAccept(item._id, item.connectId)}
              style={[styles.button, { backgroundColor: theme.accept }]}
              onPressIn={() => {
                notificationScale.value = 0.95;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onPressOut={() => {
                notificationScale.value = 1;
              }}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            </>:<>
            <TouchableOpacity
            onPress={() => handleConnect(item._id,item.connectId)}
            style={[styles.button, { backgroundColor: theme.connect }]}
            onPressIn={() => {
              notificationScale.value = 0.95;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onPressOut={() => {
              notificationScale.value = 1;
            }}
          >
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
          </>
          }
            <TouchableOpacity
            onPress={() => handleDecline(item._id)}
            style={[styles.button, { backgroundColor: theme.decline }]}
            onPressIn={() => {
              notificationScale.value = 0.95;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onPressOut={() => {
              notificationScale.value = 1;
            }}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={
        isDarkMode 
          ? [COLORS.dark.background, '#0F0F0F', COLORS.dark.background]
          : [COLORS.light.background, '#FFFFFF', COLORS.light.background]
      }
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons 
            name="arrow-back" 
            size={30} 
            color={theme.text} 
          />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        
        <TouchableOpacity 
          onPress={toggleTheme} 
          style={styles.themeToggle}
        >
          <Ionicons 
            name={isDarkMode ? "sunny" : "moon"} 
            size={24} 
            color={theme.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem item={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="bell-outline" 
              size={64} 
              color={theme.secondary} 
            />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No new notifications
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {},
  listContainer: {
    padding: 20,
  },
  notificationItem: {
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 20,
    opacity: 0.7,
  },
});

export default NotificationScreen;
