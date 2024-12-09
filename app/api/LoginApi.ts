import axios from "axios";

const BASE_URL = "http://192.168.99.81:5000/api"; // Replace with your backend base URL

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    name: string;
    phone: string;
    email: string;
    location: {
      longitude: string;
      latitude: string;
    };
  };
  error?: string;
}

const loginApi = async (phone: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/profile/login`, {
      phone,
      password,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Handle error response from the server
      return {
        success: false,
        message: error.response.data.message || "Login failed",
        error: error.response.data.error,
      };
    } else {
      // Handle network or other errors
      return {
        success: false,
        message: "Network Error",
        error: error.message,
      };
    }
  }
};

export default loginApi;