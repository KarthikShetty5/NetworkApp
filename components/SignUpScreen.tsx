import React, { useEffect, useState } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import * as Location from "expo-location";
import * as Haptics from 'expo-haptics';
import signupApi from "@/app/api/SignupApi";

// Color Palette
const COLORS = {
  background: '#121212',
  primary: '#6A7AE8',
  secondary: '#34D399',
  text: '#E0E0E0',
  card: '#1E1E1E',
  accent: '#FF6B6B'
};

const { width, height } = Dimensions.get('window');

const SignupScreen: React.FC = ({ navigation }: any) => {
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Animated values
  const inputScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

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

  const handleSignup = async () => {
    // Existing signup logic
    if (!name || !phoneNumber || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!location) {
      Alert.alert("Error", "Location not available. Please allow location access.");
      return;
    }

    const payload = {
      userId: Math.floor(Math.random() * 10000),
      name,
      phone: phoneNumber,
      email,
      password,
      location: {
        longitude: location.longitude.toString(),
        latitude: location.latitude.toString(),
      },
    };

    try {
      const result = await signupApi(payload);

      if (result.success) {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
        Alert.alert("Success", `Signed up successfully: ${name}`);
        navigation.navigate("Login");
      } else {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Error);
        Alert.alert("Error", result.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  // Animated Input Style
  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(inputScale.value) }]
    };
  });

  // Animated Button Style
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(buttonScale.value) }]
    };
  });

  return (
    <LinearGradient
      colors={[COLORS.background, '#0F0F0F', COLORS.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <Text style={styles.title}>Create Account</Text>
        
        {/* Name Input */}
        <Animated.View 
          style={[styles.inputContainer, animatedInputStyle]}
        >
          <MaterialCommunityIcons 
            name="account" 
            size={24} 
            color={COLORS.secondary} 
          />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={COLORS.text}
            value={name}
            onChangeText={setName}
            onFocus={() => {
              inputScale.value = 1.05;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onBlur={() => {
              inputScale.value = 1;
            }}
          />
        </Animated.View>

        {/* Phone Number Input */}
        <Animated.View 
          style={[styles.inputContainer, animatedInputStyle]}
        >
          <MaterialCommunityIcons 
            name="phone" 
            size={24} 
            color={COLORS.secondary} 
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={COLORS.text}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onFocus={() => {
              inputScale.value = 1.05;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onBlur={() => {
              inputScale.value = 1;
            }}
          />
        </Animated.View>

        {/* Email Input */}
        <Animated.View 
          style={[styles.inputContainer, animatedInputStyle]}
        >
          <MaterialCommunityIcons 
            name="email" 
            size={24} 
            color={COLORS.secondary} 
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.text}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => {
              inputScale.value = 1.05;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onBlur={() => {
              inputScale.value = 1;
            }}
          />
        </Animated.View>

        {/* Password Input */}
        <Animated.View 
          style={[styles.inputContainer, animatedInputStyle]}
        >
          <MaterialCommunityIcons 
            name="lock" 
            size={24} 
            color={COLORS.secondary} 
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.text}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={() => {
              inputScale.value = 1.05;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onBlur={() => {
              inputScale.value = 1;
            }}
          />
        </Animated.View>

        {/* Signup Button */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={handleSignup}
            onPressIn={() => {
              buttonScale.value = 0.95;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onPressOut={() => {
              buttonScale.value = 1;
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.signupButtonGradient}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Navigation */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Login")}
            onPressIn={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 30,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: width * 0.9,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    marginLeft: 10,
  },
  signupButton: {
    width: width * 0.9,
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  signupButtonGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.text,
    fontSize: 16,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupScreen;