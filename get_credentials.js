const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    let user = await User.findOne();
    if (!user) {
        user = new User({
            username: 'admin',
            password: 'AxisPassword123!',
            email: 'admin@axis-store.com'
        });
        await user.save();
        console.log("New User created:");
    } else {
        user.password = 'AxisPassword123!';
        await user.save();
        console.log("Existing user password reset to defaults:");
    }

    console.log("------------------------");
    console.log("Username: " + user.username);
    console.log("Password: AxisPassword123!");
    console.log("------------------------");

    process.exit(0);
}).catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
});
