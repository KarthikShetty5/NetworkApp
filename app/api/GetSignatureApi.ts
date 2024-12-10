import axios from "axios";

const GetSignatureApi = async () => {
    try {
      const BASE_URL = "http://192.168.95.81:5000/api/images/cloudinarySign"; // Replace with your backend URL
      const response = await fetch(BASE_URL);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch Cloudinary signature:", error);
      throw new Error("Unable to fetch upload credentials.");
    }
  };

  export default GetSignatureApi