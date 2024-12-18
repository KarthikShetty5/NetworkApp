import React, { useEffect, useState,useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  TextInput, 
  Image, 
  Alert, 
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import * as Location from "expo-location";
import UpdateLocationApi from "@/app/api/UpdateLocationApi";
import GetUserApi from '@/app/api/GetUserApi';
import GetRecentApi from '@/app/api/GetRecentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotification, sendNotification } from '@/app/api/GetNotificationApi';
import getNearbyUsersApi, { NearbyUsersPayload } from '@/app/api/TrackApi';

// Color Palette
const COLORS = {
  light: {
    background: '#F4F7FE',
    text: '#2C3E50',
    card: '#FFFFFF',
    primary: '#4A6CF7',
    secondary: '#7987A1',
    accent: '#10B981'
  },
  dark: {
    background: '#121212',
    text: '#E0E0E0',
    card: '#1E1E1E',
    primary: '#6A7AE8',
    secondary: '#4A5568',
    accent: '#34D399'
  }
};

interface Message {
  userId: string;
  name: string;
  lastMessage: string;
  imageUrl: string;
  time: string;
  isActive: boolean;
}

interface HomeScreenProps {
  navigation: any; // You can replace `any` with your navigation type if you're using TypeScript with React Navigation
}

interface LocationProps {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
}

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const cardScale = useSharedValue(1);
  const [recentlyInteracted, setRecentlyInteracted] = useState<Message[]>([]);
  const [location, setLocation] = useState<LocationProps | null>(null);
  const previousLocationRef = useRef<LocationProps | null>(null);
  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null); 
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [notificationCount, setNotificationCount] = useState(0); // Set this dynamically

  const fetchNotifications = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await getNotification(userId); // Assuming getNotification fetches notifications
        const unreadNotifications = response.filter((notification: { viewed: any; }) => !notification.viewed); // Filter for `viewed: false`
        setNotificationCount(unreadNotifications.length); // Update state with count of unread notifications
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    let intervalId:any;
  
    const init = async () => {
      await fetchNotifications(); // Initial call when the app mounts
      intervalId = setInterval(fetchNotifications, 20000); // Call every 20 seconds
    };
  
    init();
  
    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, []);
  
  const fetchAndSendUserRequests = async (location: NearbyUsersPayload) => {
    if(!location) {
      Alert.alert("Warning", "Enable Location for user requests")
      return;
    }
    try {
      // Retrieve current userId from storage
      const currentUserId = await AsyncStorage.getItem("userId");
      if (!currentUserId) {
        throw new Error("Current user is not logged in.");
      }
  
      // Fetch nearby users
      const response = await getNearbyUsersApi(location);
      if (!response.success) {
        throw new Error(response.message || "Failed to retrieve users.");
      }
  
      const nearbyUsers = response.data;
      if (!Array.isArray(nearbyUsers)) {
        throw new Error("Invalid user data format.");
      }
  
      // Filter out the current user
      const filteredUsers = nearbyUsers.filter((user:any) => user.userId !== currentUserId);
  
      // Send requests for each remaining user
      for (const user of filteredUsers) {
        try {
          // Fetch existing notifications for the current user
          const notifications = await getNotification(currentUserId);
  
          // Check if a 'Connect' notification exists and was viewed
          const connectNotification = notifications.find(
            (notif: { tag: string; connectId: number; viewed: any; }) => notif.tag == "Connect" &&  notif.connectId === user.userId && !notif.viewed
          );
            
          if (!connectNotification) {
            // Send a new notification
            const requestResponse = await sendNotification(
              user.userId.toString(),
              `${user.name} is found nearby, want to connect :-)`,
              currentUserId,
              false,
              "Connect"
            );
            } else {
            console.log(`Notification for ${user.name} has already been sent and viewed.`);
          }
        } catch (error:any) {
          console.error(`Error processing user ${user.name}:`, error.message || error);
        }
      }
  
      // return filteredUsers; // Return the filtered list of users (excluding the current user)
    } catch (error:any) {
      console.error("Error in fetchAndSendUserRequests:", error.message || error);
      throw error;
    }
  };

  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permissions are required.");
        return;
      }

      // Start watching location changes
      locationWatcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // Higher accuracy for small movements
          timeInterval: 5000, // Check every 5 seconds
          distanceInterval: 1, // Minimum distance change of 1 meter
        },
        (newLocation) => {
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };

          setLocation((prevLocation) => {
            if (!prevLocation) {
              console.log("Setting initial location:", newCoords);
              return { coords: newCoords };
            }

            const latitudeDiff = Math.abs(prevLocation.coords.latitude - newCoords.latitude);
            const longitudeDiff = Math.abs(prevLocation.coords.longitude - newCoords.longitude);

            if (latitudeDiff > 0.00001 || longitudeDiff > 0.00001) { // Threshold for small changes
              console.log("Updating location:", newCoords);
              return { coords: newCoords };
            } else {
              console.log("Skipping location update. No significant change.");
              return prevLocation;
            }
          });
        }
      );
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  }, []);

  const updateLocation = useCallback(async () => {
    // const userId = await AsyncStorage.getItem("userId");
    const userId = '122345';
    if (!location) {
      console.log("No location to update.");
      return;
    }

    const prevLocation = previousLocationRef.current;
    const latitudeDiff = prevLocation
      ? Math.abs(prevLocation.coords.latitude - location.coords.latitude)
      : Infinity;
    const longitudeDiff = prevLocation
      ? Math.abs(prevLocation.coords.longitude - location.coords.longitude)
      : Infinity;

    if (latitudeDiff > 0.00001 || longitudeDiff > 0.00001) {
      console.log("Location changed significantly. Updating backend:", location.coords);
      previousLocationRef.current = location;

      // Update backend here
      try{
      // Fetch nearby users and send requests for connections
      await fetchAndSendUserRequests(location.coords);
    }catch(e){
      console.error(e);
    }

    try {
      console.log("Updating location to backend:", location.coords);
      await UpdateLocationApi(userId, location.coords);
      previousLocationRef.current = location; // Save the current location as the previous location
    } catch (error) {
      console.error("Failed to update location:", error);
    }
    } else {
      console.log("Location unchanged. Skipping backend update.");
    }

  }, [location]);

  const startLocationUpdates = useCallback(() => {
    if (locationUpdateTimeoutRef.current) {
      clearTimeout(locationUpdateTimeoutRef.current);
    }

    const updateLoop = async () => {
      try {
        await updateLocation();
      } catch (error) {
        console.error("Error in update loop:", error);
      }

      locationUpdateTimeoutRef.current = setTimeout(updateLoop, 50000); // Repeat every 5 seconds
    };

    updateLoop(); // Start the first update
  }, [updateLocation]);

  // useEffect(() => {
  //   fetchLocation();
  //   startLocationUpdates();
  
  //   return () => {
  //     // Stop the location watcher
  //     if (locationWatcherRef.current) {
  //       locationWatcherRef.current.remove();
  //       locationWatcherRef.current = null;
  //     }
  
  //     // Clear the timeout
  //     if (locationUpdateTimeoutRef.current) {
  //       clearTimeout(locationUpdateTimeoutRef.current);
  //       locationUpdateTimeoutRef.current = null;
  //     }
  //   };
  // }, [fetchLocation, startLocationUpdates]);
  
  const fadeAnim = useSharedValue(0);
   
  // Fetch User Data
  const fetchUserData = async () => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
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
          time: recentMessage ? recentMessage.time : null,
        };
      });

      const sortedData = mergedData
        .filter((item: { time: any; }) => item.time)
        .sort((a: { time: string | number | Date; }, b: { time: string | number | Date; }) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        )
        .slice(0, 2);

      setRecentlyInteracted(sortedData);
      
      // Animate the entries
      fadeAnim.value = withTiming(1, { duration: 500 });
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user data.");
    }
  };

  // Lifecycle
  useEffect(() => {
    let intervalId:any;
  
    const init = async () => {
      await fetchNotifications(); // Initial call when the app mounts
      intervalId = setInterval(fetchUserData, 20000); // Call every 20 seconds
    };
  
    init();
  
    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDarkMode(!isDarkMode);
  };

  const animatedFadeStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        {
          translateY: interpolate(
            fadeAnim.value,
            [0, 1],
            [50, 0],
            Extrapolate.CLAMP
          )
        }
      ]
    };
  });

  // Animated Card Style
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(cardScale.value) }]
    };
  });

  // Card Press Animation
  const handleCardPress = () => {
    cardScale.value = 0.95;
    setTimeout(() => {
      cardScale.value = 1;
    }, 100);
    setTimeout(() => {
      navigation.navigate('Map')
    }, 200);
  };

  const openMessage = async(contact:Message) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      navigation.navigate("Chat", { contact, userId});
    }
    catch (e){
      console.error(e);
    }
  };

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

  const handleClick = (tab: string) => {
    setSelectedTab(tab.toLowerCase())
    navigation.navigate(tab);
  }

  // Color Scheme
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  // Styles with Dynamic Theming
  const dynamicStyles = StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: theme.background,
    },
    cardContainer: {
      backgroundColor: theme.card,
      borderRadius: 20,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 10,
    },
    text: {
      color: theme.text,
      fontWeight: '600',
    },
    primaryText: {
      color: theme.primary,
      fontWeight: 'bold',
    }
  });

  const getRecentInteractionStyles = () => StyleSheet.create({
    recentInteractionSection: {
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 15,
    },
    recentInteractionContainer: {
      paddingHorizontal: 5,
    },
    recentActivityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderRadius: 15,
      marginRight: 15,
      width: width * 0.7,
      backgroundColor: theme.card,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    profileCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: theme.primary,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    interactionDetails: {
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    lastMessageText: {
      fontSize: 14,
      marginTop: 5,
      color: theme.secondary,
    },
    emptyInteractionContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.card,
      borderRadius: 15,
      width: width * 0.9,
    },
    emptyInteractionText: {
      fontSize: 16,
      fontStyle: 'italic',
      color: theme.secondary,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.accent,
      borderWidth: 2,
      borderColor: theme.card,
    },
  });

  // Dynamic styles based on theme
  const recentInteractionStyles = getRecentInteractionStyles();
  
  // Render Recently Interacted Section
  const renderRecentlyInteracted = () => (
    <Animated.View style={[recentInteractionStyles.recentInteractionSection, animatedFadeStyle]}>
      <Text style={recentInteractionStyles.sectionTitle}>
        Recently Interacted
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={recentInteractionStyles.recentInteractionContainer}
      >
        {recentlyInteracted.length > 0 ? (
          recentlyInteracted.map((interaction) => (
            <TouchableOpacity 
              key={interaction.userId}
              style={recentInteractionStyles.recentActivityCard}
              onPress={() => openMessage(interaction)}
            >
              <View style={recentInteractionStyles.profileCircle}>
                <Image 
                  source={{ uri: interaction.imageUrl ? interaction.imageUrl : "https://cdn2.iconfinder.com/data/icons/business-hr-and-recruitment/100/account_blank_face_dummy_human_mannequin_profile_user_-1024.png"}} 
                  style={recentInteractionStyles.profileImage} 
                />
                {interaction.isActive && (
                  <View style={recentInteractionStyles.activeIndicator} />
                )}
              </View>
              <View style={recentInteractionStyles.interactionDetails}>
                <Text style={recentInteractionStyles.profileName}>
                  {interaction.name}
                </Text>
                <Text 
                  style={recentInteractionStyles.lastMessageText}
                  numberOfLines={1}
                >
                  {interaction.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={recentInteractionStyles.emptyInteractionContainer}>
            <Text style={recentInteractionStyles.emptyInteractionText}>
              Start connecting with friends
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );


  return (
    <LinearGradient
      colors={isDarkMode 
        ? ['#121212', '#1E1E1E', '#121212'] 
        : ['#F4F7FE', '#FFFFFF', '#F4F7FE']}
      style={dynamicStyles.background}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Ionicons 
            name={isDarkMode ? 'moon' : 'sunny'} 
            size={24} 
            color={theme.text} 
          />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={theme.secondary} 
          />
          <TextInput 
            placeholder="Search..." 
            placeholderTextColor={theme.secondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Section */}
        <Animated.View 
          style={[dynamicStyles.cardContainer, animatedCardStyle]}
        >
          <TouchableOpacity 
            onPress={handleCardPress}
            activeOpacity={0.8} 
          >
            <LinearGradient
              colors={[theme.primary, theme.accent]}
              style={styles.featuredCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Text style={styles.featuredTitle}>
                Discover Connections
              </Text>
              <Text style={styles.featuredSubtitle}>
                Find friends nearby
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        {/* Recently Interacted Section */}
        {renderRecentlyInteracted()}
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {['Messages', 'Nearby', 'Profile'].map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={[dynamicStyles.cardContainer, styles.quickActionCard]}
              onPress={() => navigation.navigate(action)}
            >
              <Ionicons 
                name={
                  action === 'Messages' ? 'chatbubble' :
                  action === 'Nearby' ? 'location' : 
                  'person'
                } 
                size={24} 
                color={theme.primary} 
              />
              <Text style={[dynamicStyles.text, styles.quickActionText]}>
                {action}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
      {['Home', 'Notification', 'Connections', 'Profile'].map((tab, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.bottomNavItem}
          onPress={() => {
            handleClick(tab);
            setSelectedTab(tab.toLowerCase());
          }}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={
                tab === 'Home' ? 'home' :
                tab === 'Notification' ? 'notifications' :
                tab === 'Connections' ? 'people' :
                'person'
              } 
              size={24} 
              color={selectedTab === tab.toLowerCase() ? theme.primary : theme.secondary} 
            />
            {tab === 'Notification' && notificationCount >= 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
          <Text 
            style={{
              color: selectedTab === tab.toLowerCase() ? theme.primary : theme.secondary,
              fontSize: 10,
              marginTop: 5
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  bottomNavItem: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginLeft: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    height: 200,
    justifyContent: 'flex-end',
  },
  featuredTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  featuredSubtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  quickActionCard: {
    width: '30%',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    marginTop: 10,
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    alignItems: 'center'
  },
  recentInteractionSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  recentInteractionContainer: {
    paddingHorizontal: 5,
  },
  recentActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginRight: 15,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  interactionDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessageText: {
    fontSize: 14,
    marginTop: 5,
  },
  emptyInteractionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyInteractionText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default HomeScreen;