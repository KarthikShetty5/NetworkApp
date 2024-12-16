import axios from "axios";

const BASE_URL = "https://network-backend-7dxw.onrender.com/api/track"; // Replace with your backend URL

// Connect User API function
const connectUser = async (userId: string, connectId: string) => {
  try {
    // Sending a POST request to the backend to connect the users
    const response = await axios.post(`${BASE_URL}/connect`, { userId, connectId });

    // Returning the response from the backend
    return response.data;
  } catch (error) {
    console.error("Error connecting users", error);
    throw error;
  }
};

export default connectUser;