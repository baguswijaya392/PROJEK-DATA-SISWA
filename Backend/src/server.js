
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/database");
const siswaRoutes = require("./routes/siswaRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "ONLINE",
        application: "Student Management System",
        version: "1.0.0"
    });
});

app.use("/api/siswa", siswaRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const connection = await db.getConnection();
        connection.release();

        console.log("DATABASE CONNECTED");

        app.listen(PORT, () => {
            console.log(`SERVER RUNNING: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED:", error.message);
        process.exit(1);
    }
}

startServer();
