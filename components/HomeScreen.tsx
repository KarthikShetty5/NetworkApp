import React, { useEffect, useState } from 'react';
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
import GetUserApi from '@/app/api/GetUserApi';
import GetRecentApi from '@/app/api/GetRecentApi';

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

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const cardScale = useSharedValue(1);
  const [recentlyInteracted, setRecentlyInteracted] = useState<Message[]>([]);
  
   // Animated values
   const fadeAnim = useSharedValue(0);
  // Fetch User Data
  const fetchUserData = async () => {
    const userId = '122345';
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
    fetchUserData();
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
    // const userId = '11223345'
    const userId = '122345'
    navigation.navigate("Chat", { contact, userId});
  };

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
                  source={{ uri: interaction.imageUrl }} 
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
        {['Home', 'Explore', 'Connections', 'Profile'].map((tab, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.bottomNavItem}
            onPress={() => setSelectedTab(tab.toLowerCase())}
          >
            <Ionicons 
              name={
                tab === 'Home' ? 'home' :
                tab === 'Explore' ? 'compass' :
                tab === 'Connections' ? 'people' :
                'person'
              } 
              size={24} 
              color={selectedTab === tab.toLowerCase() ? theme.primary : theme.secondary} 
            />
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
  },
  bottomNavItem: {
    alignItems: 'center',
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