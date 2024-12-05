import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import BluetoothManager from './BluetoothManager'; // Adjust the import path as needed
// import Broadcaster from './Broadcaster'; // Adjust the import path as needed

const { width, height } = Dimensions.get('window');

type HomeScreenProps = {
  navigation: any;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
//   const { initializeBluetooth, startScan } = BluetoothManager();
//   const { startBroadcasting } = Broadcaster();

  const toggleSwitch = () => setIsDarkMode((previousState) => !previousState);

  const scanNearby = () => {
    console.log('Scanning for nearby devices...');
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    navigation.navigate(tab.charAt(0).toUpperCase() + tab.slice(1)); // dynamically navigate based on tab
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fafafa' }]}>
      {/* Dark Mode Toggle and Search Bar */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={toggleSwitch} style={styles.switchButton}>
          <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={30} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>

        {/* Search bar with search icon */}
        <View style={[styles.searchBarContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
          <Ionicons name="search-outline" size={20} color={isDarkMode ? '#fff' : '#000'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchBar, { color: isDarkMode ? '#fff' : '#000' }]}
            placeholder="Search for friends or topics..."
            placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
          />
        </View>

        {/* Message Icon */}
        <TouchableOpacity onPress={() => navigation.navigate('Messages')} style={styles.messageIcon}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Recently Interacted</Text>
        <View style={styles.recentInteractionContainer}>
          <View style={styles.recentActivityCard}>
            <View style={styles.profileCircle}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/10.jpg' }} // Placeholder image
                style={styles.profileImage}
              />
            </View>
            <Text style={[styles.profileName, { color: isDarkMode ? '#fff' : '#333' }]}>John Doe</Text>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={isDarkMode ? '#ccc' : '#555'} style={styles.interactionIcon} />
          </View>
          <View style={styles.recentActivityCard}>
            <View style={styles.profileCircle}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/10.jpg' }} // Placeholder image
                style={styles.profileImage}
              />
            </View>
            <Text style={[styles.profileName, { color: isDarkMode ? '#fff' : '#333' }]}>Jane Smith</Text>
            <Ionicons name="videocam-outline" size={24} color={isDarkMode ? '#ccc' : '#555'} style={styles.interactionIcon} />
          </View>
        </View>

        {/* Featured Activities Section */}
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Featured Activities</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityCard}>
            <Ionicons name="fitness-outline" size={40} color={isDarkMode ? '#fff' : '#000'} />
            <Text style={[styles.activityText, { color: isDarkMode ? '#fff' : '#000' }]}>Morning Workout</Text>
          </View>
          <View style={styles.activityCard}>
            <Ionicons name="videocam-outline" size={40} color={isDarkMode ? '#fff' : '#000'} />
            <Text style={[styles.activityText, { color: isDarkMode ? '#fff' : '#000' }]}>Online Course</Text>
          </View>
        </View>

        <TouchableOpacity onPress={scanNearby} style={styles.scanNearbyButton}>
          <Text style={styles.scanNearbyText}>Scan Nearby</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={initializeBluetooth} style={styles.scanNearbyButton}>
          <Text style={styles.scanNearbyText}>Initialize Bluetooth</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={startBroadcasting} style={styles.scanNearbyButton}>
          <Text style={styles.scanNearbyText}>Start Broadcasting</Text>
        </TouchableOpacity> */}

        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Friend Suggestions</Text>
        <View style={styles.friendSuggestionContainer}>
          <View style={[styles.friendCard, { backgroundColor: isDarkMode ? '#444' : '#4F83CC' }]}>
            <MaterialCommunityIcons name="account-circle" size={50} color="white" />
            <Text style={styles.friendName}>Alice Johnson</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.friendCard, { backgroundColor: isDarkMode ? '#444' : '#4F83CC' }]}>
            <MaterialCommunityIcons name="account-circle" size={50} color="white" />
            <Text style={styles.friendName}>Bob Taylor</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNavBar, { backgroundColor: isDarkMode ? '#333' : '#4F83CC' }]}>
        <TouchableOpacity onPress={() => handleTabChange('home')} style={[styles.navItem, selectedTab === 'home' && styles.selectedTab]}>
          <Ionicons name="home-outline" size={30} color={selectedTab === 'home' ? '#fff' : isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.navLabel, { color: selectedTab === 'home' ? '#fff' : isDarkMode ? '#fff' : '#000' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabChange('messages')} style={[styles.navItem, selectedTab === 'messages' && styles.selectedTab]}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color={selectedTab === 'messages' ? '#fff' : isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.navLabel, { color: selectedTab === 'messages' ? '#fff' : isDarkMode ? '#fff' : '#000' }]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabChange('profile')} style={[styles.navItem, selectedTab === 'profile' && styles.selectedTab]}>
          <Ionicons name="person-circle-outline" size={30} color={selectedTab === 'profile' ? '#fff' : isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.navLabel, { color: selectedTab === 'profile' ? '#fff' : isDarkMode ? '#fff' : '#000' }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  switchButton: {
    padding: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 15,
    width: '80%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  messageIcon: {
    padding: 10,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  recentInteractionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  recentActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: width * 0.4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  interactionIcon: {
    marginLeft: 'auto',
  },
  timeText: {
    fontSize: 12,
  },
  activityContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  activityCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
  },
  activityText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanNearbyButton: {
    backgroundColor: '#4F83CC',
    paddingVertical: 15,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
  },
  scanNearbyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendSuggestionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  friendCard: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: width * 0.4,
    backgroundColor: '#4F83CC',
    justifyContent: 'center',
  },
  friendName: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  addButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  addButtonText: {
    color: '#4F83CC',
    fontSize: 14,
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  navLabel: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default HomeScreen;
