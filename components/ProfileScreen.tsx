// import React, { useState, useCallback, useEffect } from 'react';
// import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import GetSignatureApi from '@/app/api/GetSignatureApi';

// const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [profilePic, setProfilePic] = useState<string | null>(null);

//   useEffect(() => {
//     const checkUserId = async () => {
//       try {
//         const userId = await AsyncStorage.getItem('userId');
//         if (!userId) {
//           navigation.replace('SignUp');
//         }
//       } catch (error) {
//         console.error('Error checking userId:', error);
//       }
//     };
//     checkUserId();
//   }, [navigation]);

//   const uploadFile = async (file: any) => {
//     try {
//       const { uploadURL, apiKey, signature, timestamp } = await GetSignatureApi();

//       const formData = new FormData();
//       formData.append('file', {
//         uri: file.uri,
//         type: file.type || 'image/jpeg',
//         name: file.name || `image_${Date.now()}.jpg`,
//       });
//       formData.append('api_key', apiKey);
//       formData.append('timestamp', timestamp.toString());
//       formData.append('signature', signature);

//       const response = await fetch(uploadURL, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorText = await response.text(); // Capture server error details
//         console.error('Server error:', errorText);
//         throw new Error(`Upload failed: ${response.statusText}`);
//       }

//       const result = await response.json();
//       if (result.secure_url) {
//         return result.secure_url;
//       } else {
//         console.error('Cloudinary response error:', result);
//         throw new Error('Image upload failed.');
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       throw new Error('Error during image upload.');
//     }
//   };

//   const selectProfilePic = useCallback(async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission Denied', 'You need to allow access to your photos.');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled && result.assets) {
//       const selectedImage = result.assets[0];
//       const file = {
//         uri: selectedImage.uri,
//         type: selectedImage.type,
//         name: `image_${Date.now()}.jpg`,
//       };

//       try {
//         const uploadedUrl = await uploadFile(file);
//         if (uploadedUrl) {
//           setProfilePic(uploadedUrl);
//           Alert.alert('Success', 'Profile picture uploaded successfully!');
//         }
//       } catch (error: any) {
//         Alert.alert('Upload Failed', error.message);
//       }
//     }
//   }, []);

//   return (
//     <View style={styles.container}>
//       <View style={styles.profilePicContainer}>
//         {profilePic ? (
//           <Image source={{ uri: profilePic }} style={styles.profilePic} />
//         ) : (
//           <TouchableOpacity onPress={selectProfilePic} style={styles.uploadButton}>
//             <Ionicons name="cloud-upload-outline" size={40} color="#4CAF50" />
//             <Text style={styles.uploadText}>Upload Image</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//   },
//   profilePicContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   profilePic: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     borderWidth: 2,
//     borderColor: '#4CAF50',
//   },
//   uploadButton: {
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#FFF',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#DDD',
//   },
//   uploadText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#4CAF50',
//   },
// });

// export default ProfileScreen;

import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'


const ProfileScreen: React.FC<{ navigation: any }> = ({navigation}) => {

  useEffect(() => {
    const checkUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId'); // Fetch userId from AsyncStorage
        if (!userId) {
          navigation.replace('SignUp'); 
        }
      } catch (error) {
        console.error('Error checking userId:', error);
      }
    };

    checkUserId();
  }, [navigation]);

  const handleClcik = async()=>{
    const val = await AsyncStorage.removeItem('userId');
    Alert.alert('Success', 'Logged Out Successfully!');
    navigation.replace('SignUp');
    // console.log(val)
  }
  return (
    <View>
      <TouchableOpacity onPress={handleClcik} style={styles.scanNearbyButton}>
          <Text style={styles.scanNearbyText}>LogOut</Text>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  scanNearbyButton: {
    backgroundColor: '#4F83CC',
    paddingVertical: 15,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    top:400
  },
  scanNearbyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ProfileScreen

