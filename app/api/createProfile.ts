// import express, { Request, Response, NextFunction } from "express";
// import Profile from "../../Backend/model/Profile.model"; // Your mongoose Profile model
// import connectDb from "../../Backend/middleware/mongoose"; // Middleware to connect to MongoDB

// const router = express.Router();

// // Middleware to connect to the database
// router.use("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//   try {
//     await connectDb();
//     next();
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Database connection failed",
//     });
//   }
// });


// // POST /createProfile endpoint
// router.post("/createProfile", async (req: Request, res: Response) => {
//   try {
//     const { userId, name, instagram, phone, email, location } = req.body;

//     if (!userId || !name || !location?.longitude || !location?.latitude) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: userId, name, longitude, or latitude",
//       });
//     }

//     const newProfile = new Profile({
//       userId,
//       name,
//       instagram,
//       phone,
//       email,
//       location,
//     });

//     const savedProfile = await newProfile.save();

//     return res.status(200).json({
//       success: true,
//       message: "Profile created successfully",
//       data: savedProfile,
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: "Error creating profile",
//       error: error.message,
//     });
//   }
// });

// export default router;