import mongoose from 'mongoose';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

let mongoBootAttempted = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findMongodPath = () => {
  const candidates = [
    process.env.MONGOD_PATH,
    'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const canAutoStartMongo = () => {
  // Opt-in only. Prevent silently switching to a new local dbPath.
  if (process.env.MONGO_AUTOSTART !== 'true') return false;
  if (process.platform !== 'win32') return false;

  const uri = process.env.MONGO_URI || '';
  return uri.includes('127.0.0.1:27017') || uri.includes('localhost:27017');
};

const tryStartLocalMongo = async () => {
  if (mongoBootAttempted || !canAutoStartMongo()) return false;

  mongoBootAttempted = true;

  const mongodPath = findMongodPath();
  if (!mongodPath) {
    console.error('Auto-start skipped: mongod.exe not found. Set MONGOD_PATH or start MongoDB manually.');
    return false;
  }

  const mongoRoot = path.resolve(process.cwd(), '.mongodb');
  const dbPath = path.join(mongoRoot, 'data');
  const logPath = path.join(mongoRoot, 'log', 'mongod.log');

  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.mkdirSync(dbPath, { recursive: true });

  const args = [
    '--dbpath',
    dbPath,
    '--logpath',
    logPath,
    '--bind_ip',
    '127.0.0.1',
    '--port',
    '27017',
    '--wiredTigerCacheSizeGB',
    process.env.MONGOD_WT_CACHE_GB || '0.25',
  ];

  console.log(`MongoDB not reachable. Attempting auto-start using: ${mongodPath}`);
  const child = spawn(mongodPath, args, { detached: true, stdio: 'ignore', windowsHide: true });
  child.unref();
  await sleep(3000);
  return true;
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in server/.env');
  }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      const message = error?.message || String(error);
      console.error(`MongoDB connection failed: ${message}`);

      const isConnRefused = message.includes('ECONNREFUSED');
      if (attempt === 1 && isConnRefused) {
        const autoStarted = await tryStartLocalMongo();
        if (autoStarted) {
          console.log('Retrying MongoDB connection...');
          continue;
        }
      }

      if (isConnRefused) {
        console.error(
          'Connection refused. Make sure MongoDB is running locally or update MONGO_URI to a valid Atlas/local URI.'
        );
      }

      throw error;
    }
  }
};

export default connectDB;
