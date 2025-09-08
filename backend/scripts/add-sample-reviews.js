// Script to add sample reviews to existing projects
const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('../models/Project');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reel-local-spark';

async function addSampleReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a business user and editor user
    const businessUser = await User.findOne({ role: 'business' });
    const editorUser = await User.findOne({ role: 'editor' });

    if (!businessUser || !editorUser) {
      console.log('Business user or editor user not found. Please run seed-data.js first.');
      return;
    }

    // Find completed projects where the business user is owner and editor user is collaborator
    const projects = await Project.find({
      owner: businessUser._id,
      'collaborators.user': editorUser._id,
      status: 'completed'
    });

    if (projects.length === 0) {
      console.log('No completed projects found with business owner and editor collaborator.');
      console.log('Creating a sample completed project...');
      
      // Create a sample completed project
      const sampleProject = new Project({
        title: 'Sample Completed Project',
        description: 'A sample project for testing ratings',
        owner: businessUser._id,
        collaborators: [{
          user: editorUser._id,
          role: 'editor',
          addedAt: new Date()
        }],
        status: 'completed',
        category: 'marketing',
        tags: ['sample', 'test'],
        isPublic: false,
        views: 0,
        likes: [],
        comments: [],
        finalVideoFile: {
          filename: 'sample-video.mp4',
          originalName: 'sample-video.mp4',
          mimeType: 'video/mp4',
          size: 1024000,
          path: '/uploads/sample-video.mp4',
          uploadedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await sampleProject.save();
      projects.push(sampleProject);
      console.log('Created sample completed project');
    }

    // Add reviews to each project
    for (const project of projects) {
      // Check if project already has reviews
      if (project.reviews && project.reviews.length > 0) {
        console.log(`Project "${project.title}" already has reviews, skipping...`);
        continue;
      }

      // Add a sample review
      const sampleReview = {
        user: businessUser._id,
        rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
        comment: 'Great work on this project! The final video exceeded my expectations.',
        createdAt: new Date()
      };

      project.reviews = [sampleReview];
      await project.save();
      
      console.log(`✓ Added review to project: "${project.title}" (Rating: ${sampleReview.rating}/5)`);
    }

    console.log('\n✅ Sample reviews added successfully!');
    console.log(`Total projects with reviews: ${projects.length}`);

  } catch (error) {
    console.error('Error adding sample reviews:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleReviews(); 