import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
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

  const navigateToChat = async (contact: Connections) => {
    const userId = await AsyncStorage.getItem("userId");
    navigation.navigate("Chat", { contact, userId });
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
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

  const UserCard = ({ user }: { user: Connections }) => (
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
        <View style={styles.contactRow}>
          <FontAwesome
            name="instagram"
            size={16}
            color={isDarkMode ? "white" : "#555"}
          />
          <Text
            style={[styles.contactText, { color: isDarkMode ? "white" : "#555" }]}
            onPress={() =>
              user.instagram
                ? Linking.openURL(`https://instagram.com/${user.instagram}`)
                : Alert.alert("Not Available")
            }
          >
            {user.instagram || "Not available"}
          </Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons
            name="call-outline"
            size={16}
            color={isDarkMode ? "white" : "#555"}
          />
          <Text
            style={[styles.contactText, { color: isDarkMode ? "white" : "#555" }]}
            onPress={() =>
              user.phone
                ? Linking.openURL(`tel:${user.phone}`)
                : Alert.alert("Not Available")
            }
          >
            {user.phone || "Not available"}
          </Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons
            name="mail-outline"
            size={16}
            color={isDarkMode ? "white" : "#555"}
          />
          <Text style={[styles.contactText, { color: isDarkMode ? "white" : "#555" }]}>
            {user.email || "Not available"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => navigateToChat(user)}
        style={styles.chatIconContainer}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={24}
          color={isDarkMode ? "#a77bf1" : "#333"}
        />
      </TouchableOpacity>
    </View>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
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
  details: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  contactRow: { flexDirection: "row", alignItems: "center", marginVertical: 3 },
  contactText: { fontSize: 14, marginLeft: 8 },
  chatIconContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#E6E6E6",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ConnectionScreen;
