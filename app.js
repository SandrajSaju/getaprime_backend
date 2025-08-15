const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { AppDataSource } = require("./config/dataSource");
const errorHandler = require("./utils/errorHandler");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.use(errorHandler);

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("Error connecting to DB", err));
