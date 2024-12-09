import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen: React.FC = () => {
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Fetch Cloudinary signature and upload URL
  const getSignatureData = async () => {
    try {
      const BASE_URL = "http://192.168.54.81:4000/api/images/cloudinarySign"; // Replace with your backend URL
      const response = await fetch(BASE_URL);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch Cloudinary signature:", error);
      throw new Error("Unable to fetch upload credentials.");
    }
  };

  const uploadFile = async (file: any) => {
    try {
      const { uploadURL, apiKey, signature, timestamp } = await getSignatureData();
      const formData = new FormData();
      const respons = await fetch(file.uri);
      const blob = await respons.blob();
      formData.append('file', blob, file.name || `image_${Date.now()}.jpg`);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
  
      console.log('Uploading file to Cloudinary...', uploadURL);
  
      const response = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
      });
  
      // Debugging response
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
  
      const result = await response.json();
  
      if (result.secure_url) {
        console.log('Upload successful', result.secure_url);
        return result.secure_url;
      } else {
        console.error('Failed to upload image:', result);
        throw new Error('Image upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Error during image upload.');
    }
  };
  

  const selectProfilePic = useCallback(async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to allow access to your photos.');
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const selectedImage = result.assets[0];
      const file = {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: `image_${Date.now()}.jpg`,
      };

      try {
        const uploadedUrl = await uploadFile(file);
        if (uploadedUrl) {
          setProfilePic(uploadedUrl);
          Alert.alert('Success', 'Profile picture uploaded successfully!');
        }
      } catch (error:any) {
        Alert.alert('Upload Failed', error.message);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profilePicContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <TouchableOpacity onPress={selectProfilePic} style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={40} color="#4CAF50" />
            <Text style={styles.uploadText}>Upload Image</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  profilePicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  uploadButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
});

export default ProfileScreen;
