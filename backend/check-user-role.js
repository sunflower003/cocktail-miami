require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUserRole = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Find all users and their roles
        const users = await User.find({}, 'name email role isEmailVerified');
        console.log('All users:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}): role=${user.role}, verified=${user.isEmailVerified}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUserRole();