import axios from "axios";

const BASE_URL = "http://192.168.95.81:5000/api/messages"; // Replace with your backend URL

// Connect User API function
const GetRecentApi = async (userId: string) => {
  try {
    // Sending a POST request to the backend to connect the users
    const response = await axios.post(`${BASE_URL}/recent`, { userId});
    // Returning the response from the backend
    return response.data;
  } catch (error) {
    console.error("Error connecting users", error);
    throw error;
  }
};

export default GetRecentApi;