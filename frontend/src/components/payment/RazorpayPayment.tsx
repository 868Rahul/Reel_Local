import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RazorpayPaymentProps {
  amount: number; // Amount in rupees
  currency?: string;
  projectTitle: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  currency = 'INR',
  projectTitle,
  onSuccess,
  onFailure,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          projectTitle
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_9999999999', // Replace with your Razorpay key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ReelLocal',
        description: `Payment for ${projectTitle}`,
        order_id: orderData.id,
        image: '/logo.png', // Add your logo here
        handler: function (response: any) {
          // Payment successful
          console.log('Payment successful:', response);
          onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
            duration: 5000,
          });
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        notes: {
          project_title: projectTitle
        },
        theme: {
          color: '#0f766e' // Teal color to match your theme
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user.",
              variant: "destructive",
            });
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        onFailure(response.error);
        
        toast({
          title: "Payment Failed",
          description: response.error.description || "Payment failed. Please try again.",
          variant: "destructive",
        });
      });

      rzp.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      onFailure(error);
      
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span>Secure Payment</span>
        </CardTitle>
        <CardDescription>
          Complete your payment to start the project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Amount */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Project:</span>
            <span className="font-medium">{projectTitle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-2xl font-bold text-teal-600">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Accepted Payment Methods:</p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CreditCard className="h-4 w-4" />
              <span>Cards</span>
            </div>
            <div className="flex items-center space-x-1">
              <Smartphone className="h-4 w-4" />
              <span>UPI</span>
            </div>
            <div className="flex items-center space-x-1">
              <Banknote className="h-4 w-4" />
              <span>Net Banking</span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Secured by Razorpay</span>
          <Badge variant="secondary" className="text-xs">SSL</Badge>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={disabled || isLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Pay ₹{amount.toLocaleString('en-IN')}
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy. 
          Your payment is secured and encrypted.
        </p>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
