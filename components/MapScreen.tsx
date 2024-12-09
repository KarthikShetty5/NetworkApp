import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Alert, Image, Modal, TouchableOpacity } from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { getNearbyUsersApi } from "@/app/api/TrackApi";
import connectUser from "@/app/api/ConnectApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const dummyImage = "https://icon-library.com/images/generic-user-icon/generic-user-icon-9.jpg";

const Map: React.FC = () => {
  const [nearbyUsers, setNearbyUsers] = useState<
    { _id: string; name: string; location: { latitude: number; longitude: number } }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

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

  const handleMarkerPress = (user: any) => {
    setSelectedUser(user);
    setModalVisible(true); // Open modal on marker press
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue" />
          <Text>Loading nearby users...</Text>
        </View>
      )}

      {!loading && currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={currentLocation}
          showsUserLocation={true} // Highlight the user's current location
        >
          {nearbyUsers.map((user) => (
            <Marker
              key={user._id}
              coordinate={{
                latitude: user.location.latitude,
                longitude: user.location.longitude,
              }}
              title={user.name}
              onPress={() => handleMarkerPress(user)} // Show modal on marker press
            >
              <Image source={{ uri: dummyImage }} style={styles.profileImage} />
              <Circle
                center={{
                  latitude: user.location.latitude,
                  longitude: user.location.longitude,
                }}
                radius={10}
                strokeColor="rgba(255, 0, 0, 0.8)"
                fillColor="rgba(255, 0, 0, 0.3)"
              />
            </Marker>
          ))}
        </MapView>
      )}

      {!loading && nearbyUsers.length === 0 && (
        <Text style={styles.noUsersText}>No nearby users found.</Text>
      )}

      {/* Modal for displaying user details and connect button */}
      {selectedUser && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedUser.name}</Text>
              <Image source={{ uri: dummyImage }} style={styles.modalImage} />
              <Text style={styles.modalDescription}>This is {selectedUser.name}. Do you want to connect?</Text>

              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => handleConnect(selectedUser.userId)} // Log the user ID
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
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: "100%",
    width: "100%",
  },
  loadingContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 10,
    padding: 20,
  },
  noUsersText: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "red", // Set red border for user images
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "red",
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  connectButton: {
    backgroundColor: "blue",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
  },
  connectButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "gray",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Map;
