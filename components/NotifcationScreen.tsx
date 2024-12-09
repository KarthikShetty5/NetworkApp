import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getNotification, acceptNotification, declineNotification } from '@/app/api/GetNotificationApi'; // Import API helper

interface Notification {
  _id: string;
  message: string;
  viewed: boolean;
  connectId: string; // Add the connectId for handling acceptance
}

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications on component mount
  useEffect(() => {
    const userId = '11223345'
    const fetchNotifications = async () => {
      try {
        const data = await getNotification(userId); // Get notifications using the helper
        const unreadNotifications = data.filter((notification: Notification) => !notification.viewed);
        setNotifications(unreadNotifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  },[]);

  // Handle accept action for the notification
  const handleAccept = async (notificationId: string, connectId: string) => {
    console.log(`Accepted notification: ${connectId}`);
    const userId = '11223345'
    try {
      const result = await acceptNotification(connectId, notificationId, userId); // Accept the notification
      if (result.message === 'Notification accepted') {
        Alert.alert('Accepted', `Notification ${notificationId} accepted`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to accept notification: ${error}`);
    }
  };

  // Handle decline action for the notification
  const handleDecline = async (notificationId: string) => {
    console.log(`Declined notification: ${notificationId}`);
    const userId = '11223345'
    try {
      const result = await declineNotification(notificationId, userId); // Decline the notification
      if (result.message === 'Notification declined') {
        Alert.alert('Declined', `Notification ${notificationId} declined`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to decline notification: ${error}`);
    }
  };

  // Render each notification item
  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.message}>{item.message}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => handleAccept(item._id, item.connectId)} // Pass connectId along with notificationId
          style={[styles.button, styles.acceptButton]}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDecline(item._id)}
          style={[styles.button, styles.declineButton]}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No new notifications</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NotificationScreen;
