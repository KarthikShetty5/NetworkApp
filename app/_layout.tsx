import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { createStackNavigator } from '@react-navigation/stack'; // Correct import for Stack.Navigator
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import HomeScreen from '@/components/HomeScreen';
import MessagesScreen from '@/components/MessageScreen';
import ProfileScreen from '@/components/ProfileScreen';
import MapScreen from '@/components/MapScreen';
import SignupScreen from '@/components/SignUpScreen';
import LoginScreen from '@/components/LoginScreen';
import ChatScreen from '@/components/ChatScreen';
import NotFoundScreen from './+not-found';
import NotificationScreen from '@/components/NotifcationScreen';
import TestScreen from '@/components/TestScreen';
import ConnectionScreen from '@/components/ConnectionScreen';
import Test from '@/components/Test';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator(); // Correct use of createStackNavigator

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
        <Stack.Screen name="Home" component={Test} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="SignUp" component={SignupScreen} />
        <Stack.Screen name="Connections" component={ConnectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
