// server.js
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables trước
dotenv.config();

// Connect to database
connectDB();

// Import app sau khi đã load env
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
