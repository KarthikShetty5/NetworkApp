import Connection from "../model/Connection.model";

const expre = require("express");
const route = expre.Router();
const { getDistance } = require("geolib");
const Profil = require("../model/Profile.model").default;

route.post("/getAll", async (req: { body: { latitude: any; longitude: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; data?: any; error?: any; }): void; new(): any; }; }; }) => {
    try {
      const { latitude, longitude } = req.body;
  
      // Validate input
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required.",
        });
      }
  
      const currentPosition = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
  
      // Fetch all profiles from the database
      const allUsers = await Profil.find();
  
      // Filter nearby users within 2 meters
      const nearbyUsers = allUsers.filter((user: { location: { latitude: string; longitude: string; }; name: any; }) => {
        if (
          user.location &&
          user.location.latitude &&
          user.location.longitude
        ) {
          const userLocation = {
            latitude: parseFloat(user.location.latitude),
            longitude: parseFloat(user.location.longitude),
          };
  
          const distance = getDistance(currentPosition, userLocation);
  
          console.log(`Distance to ${user.name}: ${distance} meters`); // Debugging
  
          return distance <= 20; // Users within 2 meters
        }
        return false; // Exclude users without valid location
      });
  
      res.status(200).json({
        success: true,
        message: "Nearby users retrieved successfully.",
        data: nearbyUsers,
      });
    } catch (error:any) {
      console.error("Error fetching nearby users:", error.message);
      res.status(500).json({
        success: false,
        message: "Error fetching nearby users.",
        error: error.message,
      });
    }
  });


route.post('/connect', async (req: { body: { userId: any; connectId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; userId?: any; connectedTo?: any; }): void; new(): any; }; }; }) => {
    const { userId, connectId } = req.body;
  
    // Ensure both userId and connectId are provided
    if (!userId || !connectId) {
      return res.status(400).json({ message: 'userId and connectId are required' });
    }
  
    try {
      // Find or create a connection document for the user
      let userConnection = await Connection.findOne({ userId });

      if (userConnection && userConnection.userConnection.includes(connectId)) {
        return res.status(200).json({ message: 'Already connected' });
      }      
      
      if (!userConnection) {
        userConnection = new Connection({ userId, userConnection: [] });
      }
  
      // Add connectId to the user's userConnection array if not already added
      if (!userConnection.userConnection.includes(connectId)) {
        userConnection.userConnection.push(connectId);
      }
  
      // Save both connection documents
      await userConnection.save();
  
      // Return a success message
      res.status(200).json({
        message: 'Successfully connected users',
        userId,
        connectedTo: connectId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while connecting users' });
    }
  });
module.exports = route;
