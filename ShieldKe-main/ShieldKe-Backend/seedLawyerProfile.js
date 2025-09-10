require('dotenv').config();
const mongoose = require('mongoose');
const LawyerProfile = require('./models/LawyerProfile');

(async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // 2️⃣ Set your existing lawyer's userId (from the Users collection)
    const userId = 'PUT_EXISTING_USER_ID_HERE'; // e.g., '66b8f7db66d7e9b1c1f3e8a1'

    // 3️⃣ Check if profile already exists
    let profile = await LawyerProfile.findOne({ user: userId });
    if (profile) {
      console.log('⚠️ Profile already exists:', profile);
      return mongoose.disconnect();
    }

    // 4️⃣ Create profile
    profile = new LawyerProfile({
      user: userId,
      licenseNumber: 'LK-12345',
      yearsOfExperience: 5,
      practiceAreas: ['Family Law', 'Corporate Law'],
      phone: '+254700123456',
      location: 'Nairobi, Kenya',
      bio: 'Dedicated lawyer specializing in family and corporate law with over 5 years of experience.'
    });

    await profile.save();
    console.log('✅ Lawyer profile created:', profile);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error seeding profile:', err);
    mongoose.disconnect();
  }
})();
