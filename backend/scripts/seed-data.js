// Sample Data Seed Script for Reel Local Spark
// This script creates sample users and projects for testing

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Testimonial = require('../models/Testimonial');
const Template = require('../models/Template');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reel-local-spark';

async function seedData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if data already exists
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seed...');
      return;
    }
    
    console.log('Seeding sample data...');
    
    // Create sample users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const sampleUsers = [
      {
        name: 'Admin User',
        email: 'admin@reellocalspark.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Business Owner',
        email: 'business@example.com',
        password: hashedPassword,
        role: 'business',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Video Editor',
        email: 'editor@example.com',
        password: hashedPassword,
        role: 'editor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const insertedUsers = await db.collection('users').insertMany(sampleUsers);
    console.log(`✓ Created ${insertedUsers.insertedCount} sample users`);
    
    // Get user IDs for creating projects
    const users = await db.collection('users').find({}).toArray();
    const adminUser = users.find(u => u.role === 'admin');
    const businessUser = users.find(u => u.role === 'business');
    const editorUser = users.find(u => u.role === 'editor');
    
    // Create sample projects
    const sampleProjects = [
      {
        title: 'Marketing Campaign Video',
        description: 'A promotional video for our new product launch',
        owner: businessUser._id,
        collaborators: [
          {
            user: editorUser._id,
            role: 'editor',
            addedAt: new Date()
          }
        ],
        status: 'in-progress',
        category: 'marketing',
        tags: ['promotion', 'product-launch', 'marketing'],
        isPublic: false,
        views: 0,
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Educational Tutorial',
        description: 'How to use our platform - beginner guide',
        owner: adminUser._id,
        collaborators: [],
        status: 'completed',
        category: 'educational',
        tags: ['tutorial', 'guide', 'beginner'],
        isPublic: true,
        views: 125,
        likes: [],
        comments: [],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date()
      },
      {
        title: 'Company Introduction',
        description: 'Introduction video for our company website',
        owner: businessUser._id,
        collaborators: [],
        status: 'draft',
        category: 'corporate',
        tags: ['introduction', 'company', 'about-us'],
        isPublic: false,
        views: 0,
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const insertedProjects = await db.collection('projects').insertMany(sampleProjects);
    console.log(`✓ Created ${insertedProjects.insertedCount} sample projects`);
    
    console.log('\n✅ Sample data seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@reellocalspark.com / password123');
    console.log('Business: business@example.com / password123');
    console.log('Editor: editor@example.com / password123');
    console.log('User: user@example.com / password123');
    
    await seedTestimonials();
    await seedTemplates();
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function seedTestimonials() {
  const testimonials = [
    { name: "Priya's Bakery", content: "Got 3 amazing Valentine's Day reels that boosted our sales by 40%!", rating: 5 },
    { name: "StyleHub Fashion", content: "The editors understand our brand perfectly. Consistent quality every time.", rating: 5 },
    { name: "FitZone Gym", content: "From raw workout footage to viral reels - these guys are pros!", rating: 5 }
  ];
  await Testimonial.deleteMany({});
  await Testimonial.insertMany(testimonials);
  console.log('Seeded testimonials');
}

async function seedTemplates() {
  const templates = [
    { name: "Food Promo", category: "Food & Beverage", duration: "15s", price: "₹500", thumbnail: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop&crop=center" },
    { name: "Fashion Trendy", category: "Fashion", duration: "30s", price: "₹800", thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop&crop=center" },
    { name: "Sale Announcement", category: "Retail", duration: "15s", price: "₹400", thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center" },
    { name: "Workout Motivation", category: "Fitness", duration: "30s", price: "₹600", thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center" },
    { name: "Tech Product Launch", category: "Technology", duration: "30s", price: "₹700", thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop&crop=center" },
    { name: "Beauty & Cosmetics", category: "Beauty", duration: "20s", price: "₹650", thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop&crop=center" }
  ];
  await Template.deleteMany({});
  await Template.insertMany(templates);
  console.log('Seeded templates');
}

// Run the seed
seedData();
