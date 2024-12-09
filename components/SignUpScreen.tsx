import React, { useEffect, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import axios from "axios";
import signupApi  from "@/app/api/SignupApi";
import * as Location from "expo-location";

const SignupScreen: React.FC = ({ navigation }: any) => {
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to use this feature.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    };

    getLocation();
  }, []);

    const generateRandomId = (length: number = 10): string => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomId = "";
    
        for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomId += characters[randomIndex];
        }
    
        return randomId;
    };

    const handleSignup = async () => {
        if (!name || !phoneNumber || !email || !password) {
          Alert.alert("Error", "Please fill in all fields.");
          return;
        }

        if (!location) {
            Alert.alert("Error", "Location not available. Please allow location access.");
            return;
        }
    
        const payload = {
          userId: Math.floor(Math.random() * 10000), // Generate a random userId
          name,
          phone: phoneNumber,
          email,
          password,
          location: {
            longitude: location.longitude.toString(), // Convert to string
            latitude: location.latitude.toString(),   // Convert to string
          },
        };
    
        const result = await signupApi(payload);
    
        if (result.success) {
          Alert.alert("Success", `Signed up successfully: ${name}`);
          navigation.navigate("Login"); // Navigate to login on success
        } else {
          Alert.alert("Error", result.error || "Signup failed. Please try again.");
        }
      };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Sign Up" onPress={handleSignup} />

      <Text style={styles.text}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
          Log In
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
  },
  text: {
    marginTop: 20,
  },
  link: {
    color: "blue",
  },
});

export default SignupScreen;
