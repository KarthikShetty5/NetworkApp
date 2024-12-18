import axios from "axios";

const BASE_URL = "https://network-backend-7dxw.onrender.com/api/profile"; // Replace with your backend URL

// Update Location API function
const UpdateLocationApi = async (userId: any, location: { latitude: number, longitude: number }) => {
  try {
    // Sending a POST request to the backend to update the user's location
    // console.log(userId, location)
    const response = await axios.put(`${BASE_URL}/update`, { userId, location });
    // Returning the response from the backend
    // console.log(response)
    return response.data;
  } catch (error) {
    console.error("Error updating location", error);
    throw error;
  }
};

export default UpdateLocationApi;
