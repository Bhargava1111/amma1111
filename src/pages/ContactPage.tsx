import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EmailService } from '../services/EmailService';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Users } from
'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email to admin with contact form details
      const adminEmailResult = await EmailService.sendContactFormEmail(formData);
      
      // Send auto-reply confirmation to user
      const userEmailResult = await EmailService.sendContactConfirmationEmail(formData.email, formData.name);

      if (adminEmailResult.success && userEmailResult.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you soon. Check your email for confirmation."
        });

        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        // Handle partial success
        if (adminEmailResult.success) {
          toast({
            title: "Message Sent!",
            description: "Your message has been sent successfully. We'll get back to you soon."
          });
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
        } else {
          throw new Error(adminEmailResult.error || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-blue-500" />,
      title: 'Phone',
      details: '+91 98765 43210',
      description: 'Mon-Fri 9AM-6PM IST'
    },
    {
      icon: <Mail className="w-6 h-6 text-green-500" />,
      title: 'Email',
      details: 'support@manaeats.com',
      description: 'We reply within 24 hours'
    },
    {
      icon: <MapPin className="w-6 h-6 text-red-500" />,
      title: 'Office',
      details: 'MG Road, Bangalore',
      description: 'Karnataka, India - 560001'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: 'Business Hours',
      details: 'Mon-Fri: 9AM-6PM',
      description: 'Weekend: 10AM-4PM IST'
    }
  ];


  const supportCategories = [
  {
    icon: <MessageCircle className="w-8 h-8 text-blue-500" />,
    title: 'General Inquiry',
    description: 'Questions about our products or services'
  },
  {
    icon: <Headphones className="w-8 h-8 text-green-500" />,
    title: 'Technical Support',
    description: 'Help with orders, returns, or technical issues'
  },
  {
    icon: <Users className="w-8 h-8 text-purple-500" />,
    title: 'Business Partnership',
    description: 'Interested in partnering with us?'
  }];


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name" />

                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your@email.com" />

                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="What is this regarding?" />

                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help you..."
                      rows={6} />

                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}>

                    {isSubmitting ?
                    'Sending...' :

                    <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) =>
                <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {info.title}
                      </h3>
                      <p className="text-gray-700">
                        {info.details}
                      </p>
                      <p className="text-sm text-gray-500">
                        {info.description}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3160407371!2d77.4084988!3d12.953847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBangalore%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sus!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Visit us at our headquarters in the heart of Bangalore's business district.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Categories */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Can We Help?
            </h2>
            <p className="text-gray-600">
              Choose the category that best describes your inquiry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportCategories.map((category, index) =>
            <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What are your shipping options?
                </h3>
                <p className="text-gray-600 text-sm">
                  We offer free standard shipping on orders over ₹999, express shipping (1-2 days), 
                  and same-day delivery options within Bangalore.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  How can I track my order?
                </h3>
                <p className="text-gray-600 text-sm">
                  Once your order ships, you'll receive a tracking number via email. 
                  You can also track orders in your account dashboard.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What is your return policy?
                </h3>
                <p className="text-gray-600 text-sm">
                  We offer a 30-day return policy for unused items in original packaging. 
                  Returns are free for defective or damaged items.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default ContactPage;

