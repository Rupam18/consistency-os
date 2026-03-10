
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// rudimentary env loader
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const index = line.indexOf('=');
        if (index > -1) {
            const key = line.substring(0, index).trim();
            const value = line.substring(index + 1).trim();
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI not found in .env.local');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
