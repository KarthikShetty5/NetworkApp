import { getNotification, sendNotification } from '@/app/api/GetNotificationApi';
import GetRecentApi from '@/app/api/GetRecentApi'
import GetUserApi from '@/app/api/GetUserApi';
import getNearbyUsersApi from '@/app/api/TrackApi';
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

interface Message {
    userId: string;
    name: string;
    instagram: string; // Optional field
    imageUrl: string; // Optional field
    phone: string; // Optional field
    email: string; // Optional field
    password: string; //
    location: {
      longitude: number;
      latitude: number;
    };
}

const Test = () => {
    
    const fetchAndSendUserRequests = async () => {
        const location = {
          latitude: 13.6489184,
          longitude: 74.7262083,
        };
      
        try {
          // Retrieve current userId from storage
          const currentUserId = "122345";
          if (!currentUserId) {
            throw new Error("Current user is not logged in.");
          }
      
          // Fetch nearby users
          const response = await getNearbyUsersApi(location);
          if (!response.success) {
            throw new Error(response.message || "Failed to retrieve users.");
          }
      
          const nearbyUsers = response.data;
          if (!Array.isArray(nearbyUsers)) {
            throw new Error("Invalid user data format.");
          }
      
          // Filter out the current user
          const filteredUsers = nearbyUsers.filter((user:any) => user.userId !== currentUserId);
      
          // Send requests for each remaining user
          for (const user of filteredUsers) {
            try {
              // Fetch existing notifications for the current user
              const notifications = await getNotification(currentUserId);
      
              // Check if a 'Connect' notification exists and was viewed
              const connectNotification = notifications.find(
                (notif: { tag: string; connectId: number; viewed: any; }) => notif.tag == "Connect" &&  notif.connectId === user.userId && !notif.viewed
              );
              
              console.log("connectNotification", connectNotification);
      
              if (!connectNotification) {
                // Send a new notification
                const requestResponse = await sendNotification(
                  user.userId.toString(),
                  `${user.name} is found nearby, want to connect :-)`,
                  currentUserId,
                  false,
                  "Connect"
                );
      
                console.log(`Request sent for ${user.name}:`, requestResponse.message || "Success");
              } else {
                console.log(`Notification for ${user.name} has already been sent and viewed.`);
              }
            } catch (error:any) {
              console.error(`Error processing user ${user.name}:`, error.message || error);
            }
          }
      
          return filteredUsers; // Return the filtered list of users (excluding the current user)
        } catch (error:any) {
          console.error("Error in fetchAndSendUserRequests:", error.message || error);
          throw error;
        }
      };
      

    useEffect(()=>{
        fetchAndSendUserRequests()
    },[])

  return (
    <View style={{backgroundColor:'white'}}>
        <Text>hello</Text>
    </View>
  )
}

export default Test
