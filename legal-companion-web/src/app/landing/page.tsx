'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Shield,
  Calendar,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Bell,
  Lock,
  Users,
  Zap,
  Clock,
  Award,
  ArrowRight,
  Menu,
  X,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: 'Smart Document Management',
      description: 'Upload, organize, and access all your legal documents in one secure place. AI-powered extraction identifies key information automatically.',
    },
    {
      icon: Calendar,
      title: 'Intelligent Reminders',
      description: 'Never miss important deadlines. Get automatic notifications for contract renewals, payments, and critical dates.',
    },
    {
      icon: MessageSquare,
      title: 'AI Legal Assistant',
      description: 'Ask questions about your documents in plain language. Get instant answers powered by advanced AI technology.',
    },
    {
      icon: Shield,
      title: 'Insurance Tracking',
      description: 'Keep track of all your insurance policies, premiums, and coverage details in one place with renewal alerts.',
    },
    {
      icon: TrendingUp,
      title: 'Legal Health Score',
      description: 'Get insights into your legal document health with our proprietary scoring system and recommendations.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Receive timely alerts about expiring contracts, upcoming obligations, and important legal milestones.',
    },
  ];

  const problems = [
    {
      icon: AlertTriangle,
      title: 'Missed Renewal Deadlines',
      problem: 'Without tracking, contracts and insurance policies expire unnoticed',
      solution: 'Automatic reminders ensure you never miss critical deadlines',
    },
    {
      icon: AlertCircle,
      title: 'Financial Penalties & Legal Issues',
      problem: 'Late compliance can result in penalties of ₹10,000 - ₹5 lakhs or more',
      solution: 'Proactive alerts help you stay compliant and avoid costly fines',
    },
    {
      icon: Clock,
      title: 'Hours Wasted Searching Documents',
      problem: 'Finding the right document in piles of paperwork wastes precious time',
      solution: 'AI-powered search finds any document instantly',
    },
    {
      icon: Lock,
      title: 'Security & Privacy Risks',
      problem: 'Physical documents can be lost, damaged, or accessed by unauthorized persons',
      solution: 'Bank-level encryption protects your sensitive legal documents 24/7',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Small Business Owner',
      content: 'Legal Companion transformed how I manage my business contracts. The AI assistant helped me understand complex clauses I would have missed.',
      rating: 5,
    },
    {
      name: 'Rajesh Kumar',
      role: 'Property Owner',
      content: 'Finally, all my rental agreements and property documents in one place. The renewal reminders have saved me from costly missed deadlines.',
      rating: 5,
    },
    {
      name: 'Anjali Patel',
      role: 'Freelance Consultant',
      content: 'As a freelancer juggling multiple contracts, this app is a game-changer. I always know what I agreed to and when payments are due.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Legal Companion</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-primary transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-primary transition-colors">
                Pricing
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </Button>
              <Button onClick={() => setShowSignupModal(true)}>
                Sign Up Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#benefits"
                  className="text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Benefits
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <a
                  href="#pricing"
                  className="text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLoginModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSignupModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Award className="h-4 w-4" />
                Trusted by 10,000+ Users in India
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Personal Legal Document Assistant
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Stop drowning in paperwork. Legal Companion uses AI to help you organize, understand, and manage all your legal documents effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => setShowSignupModal(true)}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required • Free forever for personal use
              </p>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Employment Contract</p>
                        <p className="text-sm text-gray-600">Expires in 45 days</p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Health Insurance</p>
                        <p className="text-sm text-gray-600">Renewal due soon</p>
                      </div>
                    </div>
                    <Bell className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Rent Agreement</p>
                        <p className="text-sm text-gray-600">All good</p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Promise Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Your Privacy & Security is Our Promise
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We understand the sensitive nature of your legal documents. That's why we've built Legal Companion with security and privacy at its core.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-white rounded-lg border border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bank-Level Encryption</h3>
                  <p className="text-sm text-gray-600">256-bit AES encryption protects your documents at rest and in transit</p>
                </div>

                <div className="text-center p-6 bg-white rounded-lg border border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Zero Data Sharing</h3>
                  <p className="text-sm text-gray-600">We never sell, share, or use your data for marketing purposes</p>
                </div>

                <div className="text-center p-6 bg-white rounded-lg border border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your Data, Your Control</h3>
                  <p className="text-sm text-gray-600">Full control over your documents - download or delete anytime</p>
                </div>

                <div className="text-center p-6 bg-white rounded-lg border border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
                  <p className="text-sm text-gray-600">No third-party tracking, no unauthorized access, ever</p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Our Privacy Guarantee</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>We promise:</strong> Your documents and personal information are stored securely and privately. We do not access, read, analyze, or share your documents with anyone - including third parties, advertisers, or AI training systems. Your data belongs to you, and only you. We're committed to Indian data protection laws and international privacy standards.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Legal Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make legal document management simple, secure, and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problems & Solutions Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Don't Let Poor Legal Compliance Cost You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Managing legal documents manually leads to costly mistakes. See the common problems people face and how Legal Companion solves them.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              {problems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="border-2 border-critical-100 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-critical/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-critical" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <X className="h-4 w-4 text-critical flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700">
                                <span className="font-medium text-critical">Problem:</span> {item.problem}
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700">
                                <span className="font-medium text-success">Solution:</span> {item.solution}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-6">
              <Card className="border-2 border-critical-200 bg-critical-50/30">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-critical flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">The Cost of Non-Compliance</h3>
                      <p className="text-sm text-gray-600">Real statistics from India</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-critical-200">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-critical">₹2.5L</span>
                        <span className="text-sm text-gray-600">avg penalty</span>
                      </div>
                      <p className="text-sm text-gray-700">Average penalty for missed insurance renewals</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-critical-200">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-critical">67%</span>
                      </div>
                      <p className="text-sm text-gray-700">of Indians have missed a contract deadline at least once</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-critical-200">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-critical">12 hrs</span>
                        <span className="text-sm text-gray-600">per month</span>
                      </div>
                      <p className="text-sm text-gray-700">Average time wasted searching for documents</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-critical-200">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-critical">₹50K+</span>
                      </div>
                      <p className="text-sm text-gray-700">Average loss from untracked legal obligations</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-critical-200">
                    <Button
                      className="w-full"
                      onClick={() => setShowSignupModal(true)}
                    >
                      Protect Yourself - Start Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Users Across India
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about Legal Companion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">₹0</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">Perfect for individuals</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Up to 10 documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Basic AI assistant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Renewal reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Calendar integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Email support</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSignupModal(true)}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary shadow-lg relative flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-primary text-white px-4 py-1.5 text-sm font-semibold">Most Popular</Badge>
              </div>
              <CardContent className="p-6 pt-8 flex flex-col flex-1">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">₹499</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">For professionals & small teams</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Unlimited documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Advanced AI analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Smart notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Document templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Team collaboration (up to 3)</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => setShowSignupModal(true)}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="border-2 flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Business</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">₹1,999</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">For growing businesses</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Everything in Professional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Unlimited team members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Custom workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">24/7 phone support</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSignupModal(true)}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Take Control of Your Legal Documents?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of Indians managing their legal matters with confidence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              onClick={() => setShowSignupModal(true)}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Legal Companion</span>
              </div>
              <p className="text-sm">
                Your trusted partner in managing legal documents with intelligence and ease.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-sm text-center">
            <p>&copy; 2024 Legal Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </Link>

                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Button>
                </Link>

                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#00A4EF"
                        d="M0 0h11.377v11.372H0z"
                      />
                      <path
                        fill="#FFB900"
                        d="M12.623 0H24v11.372H12.623z"
                      />
                      <path
                        fill="#05A6F0"
                        d="M0 12.628h11.377V24H0z"
                      />
                      <path
                        fill="#FFBB00"
                        d="M12.623 12.628H24V24H12.623z"
                      />
                    </svg>
                    Continue with Microsoft
                  </Button>
                </Link>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Link href="/">
                  <Button type="button" className="w-full">
                    Login
                  </Button>
                </Link>
              </form>
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </Link>

                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Button>
                </Link>

                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#00A4EF"
                        d="M0 0h11.377v11.372H0z"
                      />
                      <path
                        fill="#FFB900"
                        d="M12.623 0H24v11.372H12.623z"
                      />
                      <path
                        fill="#05A6F0"
                        d="M0 12.628h11.377V24H0z"
                      />
                      <path
                        fill="#FFBB00"
                        d="M12.623 12.628H24V24H12.623z"
                      />
                    </svg>
                    Continue with Microsoft
                  </Button>
                </Link>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="rounded border-gray-300 mt-1" required />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
                <Link href="/">
                  <Button type="button" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </form>
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
