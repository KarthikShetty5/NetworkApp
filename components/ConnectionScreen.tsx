import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import GetUserApi from "@/app/api/GetUserApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Connections {
  _id: string;
  userId: string;
  name: string;
  imageUrl: string;
  instagram: string;
  phone: string;
  email: string;
}

const ConnectionScreen = ({ navigation }: { navigation: any }) => {
  const [connections, setConnections] = useState<Connections[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [selectedUser, setSelectedUser] = useState<Connections | null>(null); // Store the selected user

  // Fetch connections from API
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not logged in.");
          return;
        }

        const response = await GetUserApi(userId);
        const filteredConnections = response.data.filter(
          (connection: any) => connection.userId !== userId
        );

        setConnections(filteredConnections);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching connections:", error);
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const navigateToChat = async (contact: any) => {
    const userId = await AsyncStorage.getItem("userId");
    navigation.navigate("Chat", { contact, userId });
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Handle card click to show the modal with user details
  const handleCardClick = (user: Connections) => {
    setSelectedUser(user);
    setIsModalVisible(true); // Open the modal when a card is clicked
  };

  // Close the modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedUser(null); // Reset the selected user
  };

  // Animated touch effect
  const AnimatedTouchable = ({ children, onPress }: any) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withTiming(1, { duration: 100 });
    };

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const UserCard = ({ user }: { user: any }) => (
    <AnimatedTouchable onPress={() => handleCardClick(user)}>
      <View
        style={[
          styles.card,
          { backgroundColor: isDarkMode ? "#1E2A3A" : "#F5F5F5" },
        ]}
      >
        <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
        <View style={styles.details}>
          <Text
            style={[styles.name, { color: isDarkMode ? "#a77bf1" : "#333" }]}
          >
            {user.name}
          </Text>
        </View>
      </View>
    </AnimatedTouchable>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#0D1117" : "#FFFFFF" },
      ]}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 4 }}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={isDarkMode ? "#a77bf1" : "#333"}
          />
        </TouchableOpacity>

        <Text style={[styles.header, { color: isDarkMode ? "white" : "#333" }]}>
          Connections
        </Text>

        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={isDarkMode ? "sunny-outline" : "moon-outline"}
            size={28}
            color={isDarkMode ? "#a77bf1" : "#333"}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a77bf1" />
      ) : (
        <FlatList
          data={connections}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <UserCard user={item} />}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modal}>
          {selectedUser ? (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedUser.imageUrl }}
                style={styles.modalProfileImage}
              />
              <Text
                style={[
                  styles.modalName,
                  { color: isDarkMode ? "#a77bf1" : "#333" },
                ]}
              >
                {selectedUser.name}
              </Text>
              <View style={styles.modalRow}>
                <FontAwesome
                  name="instagram"
                  size={20}
                  color={isDarkMode ? "white" : "#555"}
                />
                <Text
                  style={[
                    styles.modalText,
                    { color: isDarkMode ? "white" : "#555" },
                  ]}
                  onPress={() =>
                    selectedUser.instagram
                      ? Linking.openURL(
                          `https://instagram.com/${selectedUser.instagram}`
                        )
                      : Alert.alert("Not Available")
                  }
                >
                  {selectedUser.instagram || "Not available"}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={isDarkMode ? "white" : "#555"}
                />
                <Text
                  style={[
                    styles.modalText,
                    { color: isDarkMode ? "white" : "#555" },
                  ]}
                  onPress={() =>
                    selectedUser.phone
                      ? Linking.openURL(`tel:${selectedUser.phone}`)
                      : Alert.alert("Not Available")
                  }
                >
                  {selectedUser.phone || "Not available"}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={isDarkMode ? "white" : "#555"}
                />
                <Text
                  style={[
                    styles.modalText,
                    { color: isDarkMode ? "white" : "#555" },
                  ]}
                >
                  {selectedUser.email || "Not available"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigateToChat(selectedUser)}
                style={styles.chatButton}
              >
                <Text
                  style={[
                    styles.chatButtonText,
                    { color: isDarkMode ? "#fff" : "#333" },
                  ]}
                >
                  Chat Now
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#a77bf1" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  header: { fontSize: 22, fontWeight: "bold" },
  list: { padding: 10 },
  card: {
    borderRadius: 10,
    marginVertical: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#a77bf1",
  },
  details: { marginLeft: 15, flex: 1 },
  name: { fontSize: 18, fontWeight: "bold" },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 8,
  },
  modalProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#a77bf1",
  },
  modalName: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  modalRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  modalText: { fontSize: 16, marginLeft: 10 },
  chatButton: {
    marginTop: 20,
    backgroundColor: "#a77bf1",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  chatButtonText: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
});

export default ConnectionScreen;
