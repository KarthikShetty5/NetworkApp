const expres = require("express");
const app = expres();
const dbConfig = require("../Backend/middleware/mongoose");
app.use(expres.json());
const path = require("path");

const profileRoute = require("./routes/profile.route");
const getLocationRoute = require("./routes/getLocation.route");

app.use("/api/profile", profileRoute);
app.use("/api/track", getLocationRoute);

const port = 5000;

app.get("/", (req:any, res:any) => res.send("Hello World!"));
app.listen(port, () => console.log(`Node Express Server Started at ${port}!`));