import axios from "axios";

interface SignupPayload {
  userId: number;
  name: string;
  phone: string;
  email: string;
  password: string;
  location: {
    longitude: string;
    latitude: string;
  };
}

const BASE_URL = "http://192.168.145.81:5000/api"; // Replace with your backend URL

const signupApi = async (payload: SignupPayload) => {
  try {
    const response = await axios.post(`${BASE_URL}/profile/signup`, payload);

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error:any) {
    console.error("Signup API Error:", error);
    return { success: false, error: error.message };
  }
};

export default signupApi;