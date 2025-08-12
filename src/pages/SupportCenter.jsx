import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LifeBuoy, CheckCircle, MessageCircle, Clock, Search, Book, CreditCard, Shield, Users } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const FAQ_DATA = [
  {
    category: "Booking & Payments",
    icon: <CreditCard className="w-5 h-5" />,
    questions: [
      {
        question: "How do I book a venue?",
        answer: "Browse venues on our platform, select your preferred venue, choose your date and time, fill out the booking form, and complete payment. You'll receive confirmation once the venue owner approves your request."
      },
      {
        question: "When will I be charged for my booking?",
        answer: "Payment is processed immediately after you submit your booking request. If your booking is rejected, you'll receive a full refund within 3-5 business days."
      },
      {
        question: "Can I cancel or modify my booking?",
        answer: "Yes, you can request changes or cancellations from your 'My Bookings' page. Cancellation policies vary by venue, and modifications may incur additional charges."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe."
      }
    ]
  },
  {
    category: "Account & Profile",
    icon: <Users className="w-5 h-5" />,
    questions: [
      {
        question: "How do I create an account?",
        answer: "Click 'Sign Up' and register using your Google account. You can then complete your profile with additional information."
      },
      {
        question: "How do I reset my password?",
        answer: "Since we use Google authentication, you can reset your password through your Google account settings."
      },
      {
        question: "Can I change my email address?",
        answer: "Your email is linked to your Google account. To change it, you'll need to contact our support team for assistance."
      }
    ]
  },
  {
    category: "Venue Owners",
    icon: <Book className="w-5 h-5" />,
    questions: [
      {
        question: "How do I list my venue?",
        answer: "Go to 'My Venues' dashboard and click 'Add New Venue'. Fill out all required information including photos, description, pricing, and amenities. Your listing will be reviewed before going live."
      },
      {
        question: "How long does venue approval take?",
        answer: "Most venues are reviewed and approved within 24-48 hours. We may contact you if additional information is needed."
      },
      {
        question: "When do I get paid?",
        answer: "Payments are processed weekly for all completed bookings. You'll receive your payout minus our platform fee directly to your specified bank account."
      }
    ]
  },
  {
    category: "Safety & Trust",
    icon: <Shield className="w-5 h-5" />,
    questions: [
      {
        question: "How do you ensure venue quality?",
        answer: "All venues undergo a verification process including photo verification, document checks, and quality standards review before being approved on our platform."
      },
      {
        question: "What if something goes wrong with my booking?",
        answer: "Contact us immediately through our support system. We have a 24/7 support team and comprehensive policies to protect both guests and venue owners."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, all payment information is processed through Stripe, a PCI-compliant payment processor. We never store your credit card information on our servers."
      }
    ]
  }
];

export default function SupportCenter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    description: '',
    booking_id: '',
    priority: 'medium'
  });
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Load user's existing support tickets
        const tickets = await SupportTicket.filter({ user_id: currentUser.id }, '-created_date', 20);
        setUserTickets(tickets);
      } catch (e) {
        // User not logged in, they can still browse FAQs
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.description) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await SupportTicket.create({
        ...formData,
        user_id: user?.id || 'guest_user',
        user_name: user?.full_name || 'Guest User',
        user_email: user?.email || 'not_provided',
      });
      setSubmitted(true);
      toast({ title: 'Support ticket submitted successfully!', variant: 'success' });
      
      // Reload tickets if user is logged in
      if (user) {
        const tickets = await SupportTicket.filter({ user_id: user.id }, '-created_date', 20);
        setUserTickets(tickets);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to submit ticket. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFAQs = FAQ_DATA.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      !searchQuery || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  if (loading) return <LoadingSpinner />;

  if (submitted && !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
        <p className="text-gray-600">Your support ticket has been submitted. Our team will get back to you shortly via email.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <LifeBuoy className="w-10 h-10 text-indigo-600 inline-block mr-3" />
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or get personalized help from our support team
          </p>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            {user && <TabsTrigger value="tickets">My Tickets</TabsTrigger>}
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search FAQs</CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {filteredFAQs.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {category.icon}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-indigo-600" />
                  Submit a Support Ticket
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Submit a detailed ticket and our team will help you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                        Subject *
                      </label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange} 
                        required 
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="text-sm font-medium mb-2 block">
                        Category *
                      </label>
                      <Select onValueChange={(value) => handleSelectChange('category', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking_issue">Booking Issue</SelectItem>
                          <SelectItem value="payment_problem">Payment Problem</SelectItem>
                          <SelectItem value="technical_support">Technical Support</SelectItem>
                          <SelectItem value="account_help">Account Help</SelectItem>
                          <SelectItem value="venue_inquiry">Venue Inquiry</SelectItem>
                          <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking_id" className="text-sm font-medium mb-2 block">
                        Booking ID (if applicable)
                      </label>
                      <Input 
                        id="booking_id" 
                        name="booking_id" 
                        value={formData.booking_id} 
                        onChange={handleChange}
                        placeholder="e.g., BK123456"
                      />
                    </div>
                    <div>
                      <label htmlFor="priority" className="text-sm font-medium mb-2 block">
                        Priority Level
                      </label>
                      <Select onValueChange={(value) => handleSelectChange('priority', value)} defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - General inquiry</SelectItem>
                          <SelectItem value="medium">Medium - Standard issue</SelectItem>
                          <SelectItem value="high">High - Affects upcoming event</SelectItem>
                          <SelectItem value="urgent">Urgent - Immediate attention needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="text-sm font-medium mb-2 block">
                      Description *
                    </label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required 
                      rows={6}
                      placeholder="Please provide as much detail as possible about your issue. Include any error messages, steps you've already tried, and what outcome you're expecting."
                    />
                  </div>
                  
                  <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {user && (
            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <CardTitle>My Support Tickets</CardTitle>
                  <CardDescription>Track the status of your submitted support requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {userTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
                      <p className="text-gray-600">You haven't submitted any support tickets yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userTickets.map((ticket) => (
                        <div key={ticket.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{ticket.subject}</h3>
                              <p className="text-sm text-gray-600">
                                Submitted {formatDistanceToNow(new Date(ticket.created_date))} ago
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                                {ticket.priority} priority
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Category:</span>
                              <span className="ml-2 capitalize">{ticket.category.replace('_', ' ')}</span>
                            </div>
                            {ticket.booking_id && (
                              <div>
                                <span className="font-medium text-gray-700">Booking ID:</span>
                                <span className="ml-2">{ticket.booking_id}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-gray-700 line-clamp-3">{ticket.description}</p>
                          </div>

                          {ticket.status === 'resolved' && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  This ticket has been resolved
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}