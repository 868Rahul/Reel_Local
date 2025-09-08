// MongoDB Setup Script for Reel Local Spark
// This script sets up indexes and initial configuration for the database

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reel-local-spark';

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Create indexes for Users collection
    console.log('Creating indexes for users collection...');
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: -1 } },
      { key: { lastLogin: -1 } }
    ]);
    
    // Create indexes for Projects collection
    console.log('Creating indexes for projects collection...');
    await db.collection('projects').createIndexes([
      { key: { owner: 1 } },
      { key: { 'collaborators.user': 1 } },
      { key: { status: 1 } },
      { key: { category: 1 } },
      { key: { isPublic: 1 } },
      { key: { createdAt: -1 } },
      { key: { updatedAt: -1 } },
      { key: { views: -1 } },
      { key: { tags: 1 } },
      { key: { title: 'text', description: 'text', tags: 'text' }, name: 'search_index' },
      // Compound indexes for common queries
      { key: { owner: 1, status: 1 } },
      { key: { isPublic: 1, status: 1 } },
      { key: { category: 1, isPublic: 1 } }
    ]);
    
    // Create collection for file uploads metadata (optional)
    console.log('Setting up uploads collection...');
    await db.createCollection('uploads');
    await db.collection('uploads').createIndexes([
      { key: { projectId: 1 } },
      { key: { uploadedBy: 1 } },
      { key: { uploadedAt: -1 } },
      { key: { fileType: 1 } }
    ]);
    
    // Create collection for user sessions (optional)
    console.log('Setting up sessions collection...');
    await db.createCollection('sessions');
    await db.collection('sessions').createIndexes([
      { key: { userId: 1 } },
      { key: { createdAt: 1 }, expireAfterSeconds: 86400 } // Expire after 24 hours
    ]);
    
    console.log('Database setup completed successfully!');
    console.log('\nCreated collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => console.log(`- ${col.name}`));
    
    console.log('\nDatabase statistics:');
    const stats = await db.stats();
    console.log(`- Database: ${stats.db}`);
    console.log(`- Collections: ${stats.collections}`);
    console.log(`- Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`- Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the setup
setupDatabase();
