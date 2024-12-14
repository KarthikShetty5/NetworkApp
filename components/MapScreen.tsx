import React, { useEffect, useState } from "react";
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Alert, 
  Image, 
  Modal, 
  TouchableOpacity, 
  Dimensions 
} from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import connectUser from "@/app/api/ConnectApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getNearbyUsersApi from "@/app/api/TrackApi";

// Color Palette
const COLORS = {
  background: '#121212',
  primary: '#6A7AE8',
  secondary: '#34D399',
  text: '#E0E0E0',
  card: '#1E1E1E',
  accent: '#FF6B6B'
};

interface MapScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const Map: React.FC<MapScreenProps> = ({ navigation }) => {
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Animated values
  const modalScale = useSharedValue(1);
  const markerScale = useSharedValue(1);

  const fetchNearbyUsers = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required to find nearby users.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const payload = {
        latitude: 12.9715987,
        longitude: 77.5945627,
      };

      setCurrentLocation({
        latitude: 12.9715987,
        longitude: 77.5945627,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const result = await getNearbyUsersApi(payload);

      if (result.success && result.data) {
        setNearbyUsers(
          result.data.map((user: any) => ({
            _id: user._id,
            userId:user.userId,
            name: user.name,
            location: user.location,
            imageUrl:user.imageUrl
          }))
        );
      } else {
        Alert.alert("Error", result.message || "Unable to fetch nearby users.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while fetching nearby users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyUsers();
  }, []);

  const handleConnect = async(connectId: string) => {
    const userId = await AsyncStorage.getItem("userId");

    if(!userId){
      Alert.alert("Error", "User not logged in.");
      return;
    }

    try {
      const result = await connectUser(userId, connectId);
      Alert.alert(result.message);
    } catch (error) {
      Alert.alert("Error", "Unable to connect users.");
    }
    setModalVisible(false); // Close modal after connecting
  };

  // Marker Press Handler
  const handleMarkerPress = (user: any) => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate marker
    // markerScale.value = withSpring(1.2);
    // setTimeout(() => {
    //   markerScale.value = withSpring(1);
    // }, 300);
    
    // Set selected user and show modal
    setModalVisible(true);
    setSelectedUser(user);
  };

  // Animated Modal Style
  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(modalScale.value) }
      ]
    };
  });

  // Animated Marker Style
  const animatedMarkerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(markerScale.value) }
      ]
    };
  });

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#121212']}
      style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={30} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nearby Connections</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons 
            name="filter-variant" 
            size={24} 
            color={COLORS.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Scanning nearby users...</Text>
        </View>
      )}

      {/* Map View */}
      {!loading && currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={currentLocation}
          showsUserLocation={true}
          customMapStyle={mapStyle} // Custom dark map style
        >
          {nearbyUsers.map((user) => (
            <Marker
              key={user._id}
              coordinate={{
                latitude: user.location.latitude,
                longitude: user.location.longitude,
              }}
              onPress={() => handleMarkerPress(user)}
            >
              <Animated.View style={animatedMarkerStyle}>
                <Image 
                  source={{ uri: user.imageUrl }} 
                  style={styles.profileImage} 
                />
                <Circle
                  center={{
                    latitude: user.location.latitude,
                    longitude: user.location.longitude,
                  }}
                  radius={50}
                  strokeColor="rgba(106, 122, 232, 0.5)"
                  fillColor="rgba(106, 122, 232, 0.2)"
                />
              </Animated.View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* User Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent, 
              animatedModalStyle
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.modalGradient}
            >
              <Image 
                source={{ uri: selectedUser?.imageUrl }} 
                style={styles.modalImage} 
              />
              <Text style={styles.modalTitle}>{selectedUser?.name}</Text>
              <Text style={styles.modalSubtitle}>
                {selectedUser?.location ? 
                  `${Math.round(selectedUser.location.latitude)}, ${Math.round(selectedUser.location.longitude)}` 
                  : 'Location Unknown'}
              </Text>
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleConnect(selectedUser?.userId);
                  }}
                >
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// Custom Dark Map Style
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  // Add more custom styling as needed
];

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
    backgroundColor: 'rgba(30,30,30,0.8)',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterButton: {
    padding: 10,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.text,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  connectButton: {
    flex: 1,
    backgroundColor: COLORS.text,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  connectButtonText: {
    color: COLORS.background,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text,
    padding: 15,
    borderRadius: 10,
  },
  closeButtonText: {
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Map;