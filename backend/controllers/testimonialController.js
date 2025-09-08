const Testimonial = require('../models/Testimonial');

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
}; 