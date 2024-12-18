import axios from "axios";

const BASE_URL = "https://network-backend-7dxw.onrender.com/api/track"; // Replace with your backend URL

export interface NearbyUsersPayload {
  latitude: number;
  longitude: number;
}

export interface User {
  userId: number;
  name: string;
  phone: string;
  email: string;
  location: {
    latitude: string;
    longitude: string;
  };
}

export interface NearbyUsersResponse {
  success: boolean;
  message: string;
  data?: User[];
  error?: string;
}

export const getNearbyUsersApi = async (
  payload: NearbyUsersPayload
): Promise<NearbyUsersResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/getAll`, payload);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to fetch nearby users.",
      error: error.message || "Unknown error occurred.",
    };
  }
};

export default getNearbyUsersApi;