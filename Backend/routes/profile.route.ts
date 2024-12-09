const express = require("express");
const router = express.Router();
const Profile = require("../model/Profile.model"); // Import the Profile model

// POST /create-profile
router.post("/create", async (req: { body: { userId: any; name: any; instagram: any; phone: any; email: any; location: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; data?: any; error?: any; }): void; new(): any; }; }; }) => {
  try {
    const { userId, name, instagram, phone, email, location } = req.body;
    const Profile = require("../model/Profile.model").default;

    // Validate required fields
    if (!userId || !name || !location?.longitude || !location?.latitude) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, name, longitude, or latitude",
      });
    }

    // Check if a profile already exists for the userId
    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists for this userId",
      });
    }

    // Create a new profile
    const newProfile = new Profile({
      userId,
      name,
      instagram,
      phone,
      email,
      location,
    });

    // Save the profile to the database
    const savedProfile = await newProfile.save();

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: savedProfile,
    }); 
  } catch (error:any) {
    console.error("Error creating profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating profile",
      error: error.message,
    });
  }
});

router.get("/getprofile",async (req:any, res:any) => {
    try {
      const Profile = require("../model/Profile.model").default;
      const profile = await Profile.find();
      res.status(200).send({
        message: "Profile fetched successfully",
        success: true,
        data: profile,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error fetching Profile account",
        success: false,
        error,
      });
    }
  });

router.post("/signup", async (req: { body: { userId: any; password: any; name:any; phone: any; email: any; location: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; data?: any; error?: any; }): void; new(): any; }; }; }) => {
   console.log(req.body)
    try {
      const { name, userId, phone, email, location, password } = req.body;
      const Profile = require("../model/Profile.model").default;
  
      // Validate required fields
      if (!userId || !name || !password || !location?.longitude || !location?.latitude) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, longitude, or latitude",
        });
      }
  
      // Check if a profile already exists for the userId
      const existingProfile = await Profile.findOne({ userId });
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "Profile already exists for this userId",
        });
      }
  
      // Create a new profile
      const newProfile = new Profile({
        userId,
        name,
        password,
        phone,
        email,
        location,
      });
  
      // Save the profile to the database
      const savedProfile = await newProfile.save();
  
      res.status(201).json({
        success: true,
        message: "Profile created successfully",
        data: savedProfile,
      }); 
    } catch (error:any) {
      console.error("Error creating profile:", error.message);
      res.status(500).json({
        success: false,
        message: "Error creating profile",
        error: error.message,
      });
    }
  });

router.post("/login", async (req: { body: { phone: any; password: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; data?: { userId: any; name: any; phone: any; email: any; location: any; }; error?: any; }): void; new(): any; }; }; }) => {
    const { phone, password } = req.body;
  
    try {
      const Profile = require("../model/Profile.model").default;
  
      // Check if the phone and password are provided
      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          message: "Phone number and password are required",
        });
      }
  
      // Find the user profile based on phone number
      const userProfile = await Profile.findOne({ phone });
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: "No user found with this phone number",
        });
      }
      console.log(userProfile)
  
      // Compare the provided password with the hashed password in the database
      // const isPasswordValid = await bcrypt.compare(password, userProfile.password);
      if (!password) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }
  
      // Login successful
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          userId: userProfile.userId,
          name: userProfile.name,
          phone: userProfile.phone,
          email: userProfile.email,
          location: userProfile.location,
        },
      });
    } catch (error:any) {
      console.error("Error during login:", error.message);
      res.status(500).json({
        success: false,
        message: "Error during login",
        error: error.message,
      });
    }
  });


router.post("/getconnections", async (req: any, res: any) => {
    const { userId } = req.body;
  
    try {
      const Connect = require("../model/Connection.model").default;
      const Profile = require("../model/Profile.model").default;
  
      // Find the connection for the provided userId
      const connections = await Connect.findOne({ userId });
  
      if (!connections || !connections.userConnection || connections.userConnection.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No connections found for this userId",
        });
      }
  
      // Fetch profiles for all connected userIds
      const connectedProfiles = await Profile.find({
        userId: { $in: connections.userConnection },
      });
  
      res.status(200).send({
        message: "Connections fetched successfully",
        success: true,
        data: connectedProfiles,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Error fetching connection profiles",
        success: false,
        error,
      });
    }
  });
  


module.exports = router;
