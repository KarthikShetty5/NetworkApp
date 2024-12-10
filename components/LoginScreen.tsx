import  loginApi  from "@/app/api/LoginApi";
import React, { useEffect, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen: React.FC = ({ navigation }: any) => {
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const response = await loginApi(phone, password);
    console.log(response.data?.userId)
    try {
        await AsyncStorage.setItem(
          'userId',
          response.data?response.data?.userId:"dummy",
        );
      } catch (error) {
        console.log(error);
    }

    if (response.success) {
      Alert.alert("Success", `Welcome, ${response.data?.name}`);
    } else {
      Alert.alert("Error", response.message);
    }
  };

   const retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('userId');
      if (value !== null) {
        console.log(value);
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  useEffect(()=>{
    retrieveData();
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone "
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.text}>
        Don't have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
          Sign Up
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
    backgroundColor:"white"
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

export default LoginScreen;
