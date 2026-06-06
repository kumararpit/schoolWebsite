const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/schoolWebsite';

// Disable buffering so failed queries fail fast with a clear error
// instead of hanging silently for 10 seconds
mongoose.set('bufferCommands', false);

async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,  // give Atlas 10s to respond
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      });
      console.log('Connected to MongoDB at', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
      checkAndSeed();
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i}/${retries} failed:`, err.message);
      if (i < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        delay = Math.min(delay * 1.5, 15000); // exponential backoff, max 15s
      } else {
        console.error('All MongoDB connection attempts failed. Dynamic features will be unavailable.');
      }
    }
  }
}

connectWithRetry();

// Define schemas
const inquirySchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  childName: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  date: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Number }
});

// Compile models
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const News = mongoose.model('News', newsSchema);
const Setting = mongoose.model('Setting', settingSchema);
const Admin = mongoose.model('Admin', adminSchema);

async function checkAndSeed() {
  try {
    const initialized = await Setting.findOne({ key: 'db_initialized' });
    if (initialized && initialized.value === 'true') {
      console.log('Database already initialized. Skipping default seeding.');
      return;
    }

    console.log('First-time setup: Seeding default database values...');

    // Seed Admin
    const adminUsername = 'arpitkumar1101@gmail.com';
    const rawPassword = 'Gauradevi@123';
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    await Admin.findOneAndUpdate(
      { username: adminUsername },
      { username: adminUsername, password: hashedPassword },
      { upsert: true }
    );
    console.log(`Seeded default admin account: ${adminUsername}`);

    // Seed Settings
    const defaultSettings = [
      { key: 'phone', value: '+91 94502 62541' },
      { key: 'email', value: 'gauracitymontessori@gmail.com' },
      { key: 'address', value: 'Civil Lines, Near District Hospital, Hamirpur, Uttar Pradesh 210301' },
      { key: 'announcement', value: 'Admissions Open for playground to Class 8! Estd. 2022. Experience premium Montessori education.' },
      { key: 'map_link', value: 'https://www.google.com/maps/place/Gaura+City+Montessori/@25.9652814,80.1351464,17z/data=!3m1!4b1!4m6!3m5!1s0x399cfdc88671e34f:0x729d6f315a3fd9b7!8m2!3d25.9652814!4d80.1351464!16s%2Fg%2F11s8zf99yz!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D' },
      { key: 'announcement_enabled', value: 'true' },
      { key: 'db_initialized', value: 'true' }
    ];

    for (const s of defaultSettings) {
      await Setting.findOneAndUpdate({ key: s.key }, { value: s.value }, { upsert: true });
    }
    console.log('Seeded default settings.');

    // Seed News items
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      const newsItems = [
        {
          title: "Annual Cultural Fest 'Sanskriti' Celebrated",
          content: "Our students showcased incredible talent through traditional dance, music, and dramatic performances. The event was graced by leading educationists and local dignitaries who lauded the children's confidence.",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAT8GTO0HRv6ArvO0WCMbNLwQpU4zpBRGlHD6d5xdN-lLE0ufoLR09gGZ929dF8CZi4WNeZrqZBxauEueqB6B8F9TV7fPKagjhgJlq0TFh24v0mGDMbmJMWEIBFGpf96nJOCcwJaUFck8B3U9GGZ2asaXVc3Ih6ULUdP678OVLx9NmKQVSAL3LJonSB4yVxyC-eCH3qDaC_IC6ecEh9O7Nl1MvTZACQG8SHBtheI7G1iCpxe4bCa2YVBCw111taRptciNgmBZbKkSsk",
          date: "January 15, 2024",
          category: "Event"
        },
        {
          title: "Open Admissions for Academic Year 2024-25",
          content: "Join our vibrant community. Limited seats available for Pre-Primary and Primary levels. Contact the office today to learn about our child-led learning model and tour our campus.",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdx70OTTtMZ8YmmBiv-8sNov1KOEx3CFVIR3rRrNqBpwpPcmaCuDw5gjGlAT-ODoiLBf1pX5JtNlPx-VhLcpNsZ3J_zI_dlXiPRbLNFVZ9oxneL3PK8UOevzQfgOhNzFu1VxqPlJxqU-K_nr33UbyKoLB6l1NiXVOOUNA6kzhHpJCHSTDTu09IaBSYt_hJVYMyKlbZAVl-t2x4MZDSRbiZlg-E_WUZ3Tsd2oZcc-Bh-hJ5T4bMPaMNvkdVyduNkYjJqcAF1exHDNQO",
          date: "January 02, 2024",
          category: "Admissions"
        }
      ];
      await News.insertMany(newsItems);
      console.log('Seeded initial news items.');
    }
  } catch (err) {
    console.error('Error during seeding database:', err);
  }
}

module.exports = {
  mongoose,
  Inquiry,
  News,
  Setting,
  Admin
};
