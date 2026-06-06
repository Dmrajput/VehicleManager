const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_manager';

  // Some networks (mobile hotspots, certain ISPs/corporate DNS) refuse DNS SRV
  // queries, which breaks "mongodb+srv://" Atlas connections with
  // "querySrv ECONNREFUSED". Point Node's resolver at a public DNS server so the
  // SRV/TXT lookups succeed. Override the list via DNS_SERVERS in .env if needed.
  if (uri.startsWith('mongodb+srv')) {
    const servers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      dns.setServers(servers);
    } catch (e) {
      console.warn('Could not set custom DNS servers:', e.message);
    }
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
