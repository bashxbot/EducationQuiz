
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GraduationCap, 
  Sparkles, 
  Brain, 
  Trophy, 
  Users, 
  ChevronRight, 
  CheckCircle,
  AlertTriangle,
  School,
  Phone,
  Mail,
  User,
  BookOpen,
  Zap
} from 'lucide-react';
import { useUserProfile, isValidEmail, isValidPhone, detectFakeEmail, detectFakePhone } from '@/hooks/use-app-storage';

// Mock school API - in real app, this would be an actual API
const searchSchools = async (query: string): Promise<string[]> => {
  const schools = [
    'Delhi Public School',
    'Kendriya Vidyalaya',
    'St. Mary\'s School',
    'Modern School',
    'Ryan International School',
    'DAV Public School',
    'Mount Carmel School',
    'Bal Bharati Public School',
    'Amity International School',
    'The Heritage School',
    'Sardar Patel Vidyalaya',
    'Springdales School',
    'Blue Bells School',
    'Cambridge School',
    'La Martiniere College',
    'Bishop Cotton School',
    'The Doon School',
    'Mayo College',
    'Welham Girls School',
    'Woodstock School'
  ];
  
  if (!query) return schools.slice(0, 10);
  
  return schools.filter(school => 
    school.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);
};

const classes = [
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
  '11th Grade', '12th Grade', 'College 1st Year', 'College 2nd Year',
  'College 3rd Year', 'College 4th Year', 'Graduate', 'Other'
];

const TypingText = ({ text, speed = 50 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="font-bold text-gradient-primary">
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default function Welcome() {
  const { profile, updateProfile } = useUserProfile();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    school: ''
  });
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!isValidEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else if (detectFakeEmail(value)) {
          newErrors.email = 'Please use a real email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!isValidPhone(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else if (detectFakePhone(value)) {
          newErrors.phone = 'Please use a real phone number';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'class':
        if (!value.trim()) {
          newErrors.class = 'Class/Grade is required';
        } else {
          delete newErrors.class;
        }
        break;

      case 'school':
        if (!value.trim()) {
          newErrors.school = 'School/Institution is required';
        } else {
          delete newErrors.school;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);

    // Handle school search
    if (field === 'school') {
      if (value.length > 1) {
        searchSchools(value).then(schools => {
          setSchoolSuggestions(schools);
          setShowSchoolSuggestions(true);
        });
      } else {
        setShowSchoolSuggestions(false);
      }
    }
  };

  const selectSchool = (school: string) => {
    setFormData(prev => ({ ...prev, school }));
    setShowSchoolSuggestions(false);
    validateField('school', school);
  };

  const canProceed = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.phone.trim() && 
           formData.class.trim() && 
           formData.school.trim() &&
           Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    // Validate all fields
    const fieldsValid = ['name', 'email', 'phone', 'class', 'school']
      .every(field => validateField(field, formData[field]));

    if (!fieldsValid) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create user profile
      updateProfile({
        id: 'user-' + Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        class: formData.class,
        school: formData.school,
        totalPoints: 0,
        currentStreak: 0,
        joinDate: new Date().toISOString(),
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (profile?.isAuthenticated) {
    return null; // This component won't render if user is authenticated
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {step === 1 && (
          <Card className="premium-card glass-morphism animate-scale-in">
            <CardContent className="p-8 text-center space-y-8">
              {/* Logo and Brand */}
              <div className="space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="w-full h-full bg-gradient-to-br from-primary via-accent to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow">
                    <GraduationCap className="text-white h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">
                    Welcome to{' '}
                    <TypingText text="EduLearn" speed={150} />
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Your AI-powered learning companion
                  </p>
                </div>
              </div>

              {/* Features showcase */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface/30 rounded-xl border border-primary/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium">AI Tutoring</p>
                  </div>
                  <div className="p-4 bg-surface/30 rounded-xl border border-accent/20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <Trophy className="h-6 w-6 text-accent mx-auto mb-2" />
                    <p className="text-xs font-medium">Competitions</p>
                  </div>
                  <div className="p-4 bg-surface/30 rounded-xl border border-blue-500/20 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs font-medium">Smart Quizzes</p>
                  </div>
                  <div className="p-4 bg-surface/30 rounded-xl border border-orange-500/20 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                    <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-xs font-medium">Leaderboards</p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-2">Join thousands of students!</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>Interactive Learning</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>Achievements</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full premium-button text-lg h-14 animate-slide-up"
                  style={{ animationDelay: '1s' }}
                >
                  Get Started
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free to join • Instant access</span>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="premium-card glass-morphism animate-scale-in">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gradient-primary flex items-center justify-center gap-2">
                <User className="h-6 w-6" />
                Create Your Account
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tell us about yourself to get started
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`premium-input ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">Email Address</label>
                <Input
                  type="email"
                  placeholder="your.email@school.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`premium-input ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`premium-input ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Class Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">Class/Grade</label>
                <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                  <SelectTrigger className={`premium-input ${errors.class ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your class/grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.class && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.class}
                  </div>
                )}
              </div>

              {/* School Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">School/Institution</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Start typing your school name..."
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className={`premium-input ${errors.school ? 'border-destructive' : ''}`}
                    onFocus={() => formData.school.length > 1 && setShowSchoolSuggestions(true)}
                  />
                  {showSchoolSuggestions && schoolSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {schoolSuggestions.map((school, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-2 hover:bg-surface transition-colors flex items-center gap-2"
                          onClick={() => selectSchool(school)}
                        >
                          <School className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{school}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.school && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.school}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <Button
                  onClick={handleSignUp}
                  disabled={!canProceed() || isLoading}
                  className="w-full premium-button h-12"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <>
                      Create Account & Start Learning
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>

              {/* Terms and Privacy */}
              <p className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{' '}
                <span className="text-primary underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-primary underline cursor-pointer">Privacy Policy</span>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
