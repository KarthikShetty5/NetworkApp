import axios from 'axios';

const BASE_URL = "https://network-backend-7dxw.onrender.com/api/notifications"; // Replace with your backend URL

const getNotification = async (userId:string) =>{
    try {
        // Sending a POST request to the backend to accept the notification
        const response = await axios.post(`${BASE_URL}/notification`, {userId});
        // Returning the response from the backend
        return response.data;
      } catch (error) {
        console.error("Error accepting notification", error);
        throw error;
      }
}

// Accept Notification API function
const acceptNotification = async (connectId:string, notificationId: string, userId: string) => {
  try {
    // Sending a POST request to the backend to accept the notification
    const response = await axios.post(`${BASE_URL}/accept`, { connectId, notificationId, userId });

    // Returning the response from the backend
    return response.data;
  } catch (error) {
    console.error("Error accepting notification", error);
    throw error;
  }
};

// Decline Notification API function
const declineNotification = async (notificationId:string, userId:string) => {
  try {
    // Sending a POST request to the backend to decline the notification
    const response = await axios.post(`${BASE_URL}/decline`, { notificationId, userId });

    // Returning the response from the backend
    return response.data;
  } catch (error) {
    console.error("Error declining notification", error);
    throw error;
  }
};

// Send Notification API function
const sendNotification = async (connectId:string, message: string, userId: string, viewed:boolean, tag:string) => {
  try {
    // Sending a POST request to the backend to accept the notification
    const response = await axios.post(`${BASE_URL}/send`, { connectId, userId, message, viewed, tag });

    // Returning the response from the backend
    return response.data;
  } catch (error) {
    console.error("Error accepting notification", error);
    throw error;
  }
};

export { acceptNotification, declineNotification, getNotification, sendNotification };
