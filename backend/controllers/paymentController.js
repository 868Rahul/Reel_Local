const Razorpay = require('razorpay');
const crypto = require('crypto');
const Project = require('../models/Project');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId, amount } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  const generated_signature = crypto
    .createHmac('sha256', key_secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Save payment/order info to DB
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        project.payments.push({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount,
          status: 'paid',
          date: new Date()
        });
        await project.save();
      }
    }
    return res.json({ success: true, message: 'Payment verified' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }
}; 