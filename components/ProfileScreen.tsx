import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface Profile {
  name: string;
  email: string;
  phoneNumber: string;
  instagramId: string;
  profilePic: string;
  coins: number;
  monthlyCoins: number[];
  emailPublic: boolean;
  phonePublic: boolean;
  instagramPublic: boolean;
}

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    instagramId: 'john_doe_123',
    profilePic: 'https://randomuser.me/api/portraits/men/10.jpg',
    coins: 450, // Example coins
    monthlyCoins: [100, 150, 120, 140, 180, 200], // Sample data for coins earned per month
    emailPublic: true,
    phonePublic: false,
    instagramPublic: true,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(profile.profilePic);
  const [newName, setNewName] = useState(profile.name);
  const [newEmail, setNewEmail] = useState(profile.email);
  const [newPhoneNumber, setNewPhoneNumber] = useState(profile.phoneNumber);
  const [newInstagramId, setNewInstagramId] = useState(profile.instagramId);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSaveProfile = () => {
    setProfile({
      ...profile,
      name: newName,
      email: newEmail,
      phoneNumber: newPhoneNumber,
      instagramId: newInstagramId,
      profilePic: newProfilePic,
    });
    setModalVisible(false);
  };

  const handleVisibilityChange = (field: keyof Profile) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      [field]: !prevProfile[field],
    }));
  };

  // Graph data
  const screenWidth = Dimensions.get('window').width;
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: profile.monthlyCoins,
        color: (opacity = 1) => `rgba(0, 204, 255, ${opacity})`, // Line color
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Profile</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={30} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profilePicContainer}>
        <Image source={{ uri: profile.profilePic }} style={styles.profilePic} />
        <Ionicons name="add-circle" size={30} color="#4CAF50" style={styles.editIcon} />
      </TouchableOpacity>

      {/* Profile Info */}
      <ScrollView style={styles.infoContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={newName}
          onChangeText={setNewName}
          placeholder="Full Name"
          placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={newPhoneNumber}
          onChangeText={setNewPhoneNumber}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={newInstagramId}
          onChangeText={setNewInstagramId}
          placeholder="Instagram ID"
          placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
        />

        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkFieldLabel]}>Email:</Text>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldValue, isDarkMode && styles.darkFieldValue]}>{profile.email}</Text>
            <TouchableOpacity onPress={() => handleVisibilityChange('emailPublic')} style={styles.visibilityButton}>
              <Ionicons
                name={profile.emailPublic ? 'earth' : 'lock-closed'}
                size={30}
                color={profile.emailPublic ? 'green' : 'red'}
              />
              <Text style={[styles.visibilityText, isDarkMode && styles.darkVisibilityText]}>
                {profile.emailPublic ? 'Public' : 'Private'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkFieldLabel]}>Phone Number:</Text>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldValue, isDarkMode && styles.darkFieldValue]}>{profile.phoneNumber}</Text>
            <TouchableOpacity onPress={() => handleVisibilityChange('phonePublic')} style={styles.visibilityButton}>
              <Ionicons
                name={profile.phonePublic ? 'earth' : 'lock-closed'}
                size={30}
                color={profile.phonePublic ? 'green' : 'red'}
              />
              <Text style={[styles.visibilityText, isDarkMode && styles.darkVisibilityText]}>
                {profile.phonePublic ? 'Public' : 'Private'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkFieldLabel]}>Instagram ID:</Text>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldValue, isDarkMode && styles.darkFieldValue]}>{profile.instagramId}</Text>
            <TouchableOpacity onPress={() => handleVisibilityChange('instagramPublic')} style={styles.visibilityButton}>
              <Ionicons
                name={profile.instagramPublic ? 'earth' : 'lock-closed'}
                size={30}
                color={profile.instagramPublic ? 'green' : 'red'}
              />
              <Text style={[styles.visibilityText, isDarkMode && styles.darkVisibilityText]}>
                {profile.instagramPublic ? 'Public' : 'Private'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Coins Section with Graph */}
      <View style={styles.coinsContainer}>
        <Text style={[styles.coinsTitle, isDarkMode && styles.darkCoinsTitle]}>Coins Earned</Text>
        <LineChart
          data={data}
          width={screenWidth - 40} // Margin for padding
          height={220}
          chartConfig={{
            backgroundColor: isDarkMode ? '#121212' : '#fff',
            backgroundGradientFrom: '#121212',
            backgroundGradientTo: '#121212',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 204, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: isDarkMode ? '#121212' : '#fff',
            },
          }}
          bezier
        />
        <Text style={[styles.coinsSubtitle, isDarkMode && styles.darkText]}>Coins Earned This Year</Text>
      </View>

      {/* Modal for updating profile */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Edit Profile</Text>
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkInput]}
              value={newProfilePic}
              onChangeText={setNewProfilePic}
              placeholder="Profile Picture URL"
              placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
            />
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkInput]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Full Name"
              placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
            />
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkInput]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
            />
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkInput]}
              value={newPhoneNumber}
              onChangeText={setNewPhoneNumber}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
            />
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkInput]}
              value={newInstagramId}
              onChangeText={setNewInstagramId}
              placeholder="Instagram ID"
              placeholderTextColor={isDarkMode ? '#CCC' : '#888'}
            />
            <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.saveButton, styles.cancelButton]}
            >
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  darkTitle: {
    color: '#fff',
  },
  themeButton: {
    padding: 5,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  infoContainer: {
    marginBottom: 30,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  darkFieldLabel: {
    color: '#fff',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 16,
  },
  darkFieldValue: {
    color: '#ccc',
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 16,
    marginLeft: 5,
  },
  darkVisibilityText: {
    color: '#ccc',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    marginTop: 10,
  },
  coinsContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  coinsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  darkCoinsTitle: {
    color: '#fff',
  },
  coinsSubtitle: {
    marginTop: 10,
    fontSize: 16,
  },
  darkText: {
    color: '#fff',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  modalInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default ProfileScreen;
