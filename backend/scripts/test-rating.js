// Test script to check project statuses and test rating system
const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('../models/Project');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reel-local-spark';

async function testRating() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all projects
    const projects = await Project.find({}).populate('owner', 'name email role').populate('collaborators.user', 'name email role');
    
    console.log('\n=== All Projects ===');
    projects.forEach(project => {
      console.log(`ID: ${project._id}`);
      console.log(`Title: ${project.title}`);
      console.log(`Status: ${project.status}`);
      console.log(`Owner: ${project.owner?.name} (${project.owner?.role})`);
      console.log(`Collaborators: ${project.collaborators.map(c => `${c.user?.name} (${c.role})`).join(', ')}`);
      console.log(`Reviews: ${project.reviews?.length || 0}`);
      console.log('---');
    });

    // Get business and editor users
    const businessUser = await User.findOne({ role: 'business' });
    const editorUser = await User.findOne({ role: 'editor' });

    console.log('\n=== Users ===');
    console.log(`Business User: ${businessUser?.name} (${businessUser?._id})`);
    console.log(`Editor User: ${editorUser?.name} (${editorUser?._id})`);

    // Find projects that can be rated
    const rateableProjects = projects.filter(p => 
      (p.status === 'completed' || p.status === 'delivered') && 
      p.owner?._id.toString() === businessUser?._id.toString()
    );

    console.log('\n=== Rateable Projects ===');
    rateableProjects.forEach(project => {
      console.log(`ID: ${project._id}`);
      console.log(`Title: ${project.title}`);
      console.log(`Status: ${project.status}`);
      console.log(`Has Reviews: ${project.reviews?.length > 0}`);
      if (project.reviews?.length > 0) {
        project.reviews.forEach(review => {
          console.log(`  - Rating: ${review.rating}/5, Comment: ${review.comment}`);
        });
      }
      console.log('---');
    });

    // Test rating submission
    if (rateableProjects.length > 0) {
      const testProject = rateableProjects[0];
      console.log(`\n=== Testing Rating for Project: ${testProject.title} ===`);
      
      // Check if already rated
      const hasRated = testProject.reviews?.some(r => r.user.toString() === businessUser._id.toString());
      if (hasRated) {
        console.log('Project already rated by business user');
      } else {
        console.log('Project can be rated by business user');
      }
    }

  } catch (error) {
    console.error('Error testing rating:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testRating(); 