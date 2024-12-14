import loginApi from "@/app/api/LoginApi";
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
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const LoginScreen: React.FC = ({ navigation }: any) => {
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  // Animated values
  const inputScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const handleLogin = async () => {
    if (!phone || !password) {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Error);
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await loginApi(phone, password);
      
      if (response.success) {
        // Store user ID
        await AsyncStorage.setItem(
          'userId',
          response.data?.userId || "dummy"
        );

        // Haptic feedback for success
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
        
        // Navigate to home or next screen
        navigation.navigate("Home");
        
        Alert.alert("Success", `Welcome, ${response.data?.name}`);
      } else {
        // Haptic feedback for error
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Error);
        Alert.alert("Error", response.message);
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>
        
        {/* Phone Input */}
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
            value={phone}
            onChangeText={setPhone}
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
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Button */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
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
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Login */}
        <View style={styles.socialLoginContainer}>
          <TouchableOpacity style={styles.socialLoginButton}>
            <Ionicons 
              name="logo-google" 
              size={24} 
              color={COLORS.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialLoginButton}>
            <Ionicons 
              name="logo-facebook" 
              size={24} 
              color={COLORS.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialLoginButton}>
            <Ionicons 
              name="logo-apple" 
              size={24} 
              color={COLORS.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Signup Navigation */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("SignUp")}
            onPressIn={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 30,
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
  forgotPasswordButton: {
    padding: 10,
  },
  forgotPasswordText: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  loginButton: {
    width: width * 0.9,
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.text,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.text,
    opacity: 0.7,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.6,
    marginBottom: 20,
  },
  socialLoginButton: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 15,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: COLORS.text,
    fontSize: 16,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;