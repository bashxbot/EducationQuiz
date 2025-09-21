import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  School,
  Phone,
  Mail,
  User,
  BookOpen,
  LogOut,
  Lightbulb,
  Award,
  Globe,
  Heart,
  Rocket,
  Coffee,
  Code,
  Cpu,
  Database,
  Wifi,
  Search,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Layers,
  Settings,
  Download,
  Upload,
  Share2,
  Link,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  FileText,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  Camera,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  CloudLightning,
  Sun,
  Moon,
  Rainbow,
  Flame,
  Snowflake,
  Leaf,
  Trees,
  Mountain,
  Waves,
  Wind,
  Compass,
  Map,
  Navigation,
  MapPin,
  Route,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  Home,
  Building,
  Factory,
  Store,
  Coffee as CoffeeIcon,
  UtensilsCrossed,
  Pizza,
  IceCream,
  Cookie,
  Gamepad2,
  Dice1,
  Puzzle,
  Paintbrush,
  Palette,
  Brush,
  Scissors,
  Ruler,
  Calculator,
  Beaker,
  Microscope,
  Telescope,
  Atom,
  Dna,
  FlaskConical,
  Star,
  ChevronDown,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useUserProfile, isValidEmail, isValidPhone, detectFakeEmail, detectFakePhone } from '@/hooks/use-app-storage';
import { useLocation } from 'wouter';

// Advanced Loading Components
const LoadingSpinner = () => (
  <div className="relative">
    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-b-pink-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
  </div>
);

const LoadingBars = () => (
  <div className="flex space-x-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-2 h-8 bg-gradient-to-t from-primary to-accent rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.1}s`, animationDuration: '1s' }}
      ></div>
    ))}
  </div>
);

const LoadingDots = () => (
  <div className="flex space-x-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-3 h-3 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      ></div>
    ))}
  </div>
);

const LoadingPulse = () => (
  <div className="relative w-20 h-20">
    <div className="absolute inset-0 w-20 h-20 bg-primary rounded-full animate-ping opacity-20"></div>
    <div className="absolute inset-2 w-16 h-16 bg-accent rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }}></div>
    <div className="absolute inset-4 w-12 h-12 bg-pink-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
    <div className="absolute inset-6 w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full"></div>
  </div>
);

const GeometricLoader = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 w-16 h-16 border-4 border-primary/30 rotate-45 animate-spin"></div>
    <div className="absolute inset-2 w-12 h-12 border-4 border-accent/50 rotate-12 animate-spin" style={{ animationDirection: 'reverse' }}></div>
    <div className="absolute inset-4 w-8 h-8 bg-gradient-to-br from-primary to-pink-500 rounded-full animate-pulse"></div>
  </div>
);

// Advanced Typing Effect Component
const AdvancedTypingText = ({ 
  texts, 
  speed = 150, 
  deleteSpeed = 75, 
  pauseDuration = 3000,
  className = ""
}: { 
  texts: string[]; 
  speed?: number; 
  deleteSpeed?: number; 
  pauseDuration?: number;
  className?: string;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentText.length) {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        } else {
          setIsComplete(true);
          setTimeout(() => {
            setIsDeleting(true);
            setIsComplete(false);
          }, pauseDuration);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [displayedText, currentIndex, isDeleting, texts, speed, deleteSpeed, pauseDuration]);

  return (
    <span className={`font-bold text-gradient-primary ${className}`}>
      {displayedText}
      <span className="animate-pulse text-accent">|</span>
    </span>
  );
};

// Particle Animation Component
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Draw connections
        particles.forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `${particle.color}${Math.floor((1 - distance / 100) * 50).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

// Floating Icons Component
const FloatingIcons = () => {
  const icons = [
    Brain, BookOpen, Trophy, Star, Lightbulb, Rocket, 
    Calculator, Beaker, Atom, Cpu, Code, Globe
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((Icon, index) => (
        <div
          key={index}
          className="absolute animate-float opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        >
          <Icon className="h-6 w-6 text-primary" />
        </div>
      ))}
    </div>
  );
};

// Stats Counter Component
const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startCount = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCount(Math.floor(startCount + (end - startCount) * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span className="font-bold text-2xl text-gradient-primary">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Mock school API with more realistic data
const searchSchools = (query: string): string[] => {
  const schools = [
    'Delhi Public School, R.K. Puram',
    'Delhi Public School, Vasant Kunj',
    'Delhi Public School, Dwarka',
    'Kendriya Vidyalaya No. 1, Delhi Cantt',
    'Kendriya Vidyalaya, JNU',
    'St. Mary\'s School, Delhi',
    'Modern School, Barakhamba Road',
    'Modern School, Vasant Vihar',
    'Ryan International School, Vasant Kunj',
    'Ryan International School, Mayur Vihar',
    'DAV Public School, Pushpanjali',
    'DAV Public School, Sector 14',
    'Mount Carmel School, Anand Niketan',
    'Bal Bharati Public School, Pitampura',
    'Amity International School, Saket',
    'Amity International School, Pushp Vihar',
    'The Heritage School, Gurgaon',
    'Sardar Patel Vidyalaya, Lodi Estate',
    'Springdales School, Pusa Road',
    'Blue Bells School, Kailash',
    'Cambridge School, Srinivaspuri',
    'La Martiniere College, Lucknow',
    'Bishop Cotton School, Shimla',
    'The Doon School, Dehradun',
    'Mayo College, Ajmer',
    'Welham Girls School, Dehradun',
    'Woodstock School, Mussoorie',
    'Ecole Mondiale World School, Mumbai',
    'Cathedral & John Connon School, Mumbai',
    'Bombay Scottish School, Mumbai',
    'St. Xavier\'s High School, Mumbai',
    'Loyola High School, Chennai',
    'P.S. Senior Secondary School, Chennai',
    'Chinmaya Vidyalaya, Chennai',
    'National Public School, Bangalore',
    'Bishop Cotton Boys School, Bangalore',
    'Mallya Aditi International School, Bangalore',
    'The International School Bangalore',
    'Inventure Academy, Bangalore',
    'Oakridge International School, Hyderabad',
    'Jubilee Hills Public School, Hyderabad',
    'Delhi World Public School, Hyderabad',
    'Chirec International School, Hyderabad',
    'Narayana e-Techno School, Hyderabad',
    'Little Flower High School, Hyderabad',
    'St. Patrick\'s High School, Secunderabad',
    'Gitanjali Devashray, Hyderabad',
    'Sancta Maria International School, Hyderabad',
    'Emerald Heights School, Indore'
  ];

  if (!query) return schools.slice(0, 15);

  return schools.filter(school => 
    school.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 15);
};

const classes = [
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
  { value: 'college-1', label: 'College 1st Year' },
  { value: 'college-2', label: 'College 2nd Year' },
  { value: 'college-3', label: 'College 3rd Year' },
  { value: 'college-4', label: 'College 4th Year' },
  { value: 'graduate', label: 'Graduate Student' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'professional', label: 'Working Professional' },
  { value: 'other', label: 'Other' }
];

export default function Welcome() {
  const { profile, updateProfile, loginUser, logoutUser } = useUserProfile();
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState<'landing' | 'about' | 'features' | 'signup' | 'login' | 'loading' | 'profile'>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    school: '',
    password: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [profileFormErrors, setProfileFormErrors] = useState<Record<string, string>>({});
  const [profileFormData, setProfileFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    class: profile?.class || '',
    school: profile?.school || '',
  });

  // Handler functions - logoutUser is now from the hook

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'school' && value.length > 2) {
      const suggestions = searchSchools(value);
      setSchoolSuggestions(suggestions);
      setShowSchoolSuggestions(suggestions.length > 0);
    } else if (field === 'school') {
      setShowSchoolSuggestions(false);
    }
    
    // Real-time validation for email and phone
    if (field === 'email' && value.length > 5) {
      checkEmailAvailability(value);
    }
    if (field === 'phone' && value.length > 8) {
      checkPhoneAvailability(value);
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const checkEmailAvailability = async (email: string) => {
    if (!isValidEmail(email)) return;
    
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (data.taken) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
      }
    } catch (error) {
      console.error('Email check failed:', error);
    }
  };

  const checkPhoneAvailability = async (phone: string) => {
    if (!isValidPhone(phone)) return;
    
    try {
      const response = await fetch('/api/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      
      if (data.taken) {
        setErrors(prev => ({ ...prev, phone: 'This phone number is already registered' }));
      }
    } catch (error) {
      console.error('Phone check failed:', error);
    }
  };

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (loginErrors[field]) {
      setLoginErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectSchool = (school: string) => {
    setFormData(prev => ({ ...prev, school }));
    setShowSchoolSuggestions(false);
    if (errors.school) {
      setErrors(prev => ({ ...prev, school: '' }));
    }
  };

  const canProceed = () => {
    return formData.name && formData.email && formData.phone && formData.class && formData.school && formData.password;
  };

  const canLogin = () => {
    return loginData.email && loginData.password;
  };

  const handleLogin = async () => {
    // Validate login data
    const emailValid = validateLoginField('email', loginData.email);
    const passwordValid = validateLoginField('password', loginData.password);
    
    if (!emailValid || !passwordValid || !canLogin()) return;

    setIsLoading(true);
    setCurrentSection('loading');

    // Simulate login process with stages
    const stages = [
      'Verifying credentials...',
      'Loading your profile...',
      'Preparing your dashboard...',
      'Almost ready...'
    ];

    try {
      for (let i = 0; i < stages.length; i++) {
        setLoadingStage(i);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Check stored credentials with password validation
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = storedUsers.find((u: any) => u.email === loginData.email && u.password === loginData.password);

      if (user) {
        // Login user with stored credentials
        loginUser({
          id: user.id || Date.now().toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          class: user.class,
          school: user.school,
          totalPoints: user.totalPoints || 0,
          currentStreak: user.currentStreak || 0,
          joinDate: user.joinDate || new Date().toISOString()
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        setLocation('/dashboard');
      } else {
        // For demo purposes, allow login with demo credentials
        if (loginData.email === 'demo@student.com' && loginData.password === 'password123') {
          loginUser({
            id: 'demo-user',
            name: 'Demo Student',
            email: 'demo@student.com',
            phone: '+1234567890',
            class: '10',
            school: 'Demo High School',
            totalPoints: 1250,
            currentStreak: 7,
            joinDate: new Date().toISOString()
          });
          await new Promise(resolve => setTimeout(resolve, 500));
          setLocation('/dashboard');
        } else {
          setLoginErrors({ general: 'Invalid credentials. Please check your email and password.' });
          setIsLoading(false);
          setCurrentSection('login');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginErrors({ general: 'An unexpected error occurred during login.' });
      setIsLoading(false);
      setCurrentSection('login');
    }
  };

  // Sample data
  const appStats = [
    { label: 'Active Students', value: 25000, prefix: '', suffix: '+' },
    { label: 'Questions Answered', value: 2500000, prefix: '', suffix: '+' },
    { label: 'Countries', value: 45, prefix: '', suffix: '+' },
    { label: 'Success Rate', value: 94, prefix: '', suffix: '%' }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      class: "Class 12",
      school: "Delhi Public School",
      text: "EduLearn helped me improve my physics scores by 40% in just 3 months!",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Arjun Patel",
      class: "Class 10",
      school: "Kendriya Vidyalaya",
      text: "The AI tutor explains concepts better than my teachers. Amazing platform!",
      rating: 5,
      avatar: "AP"
    },
    {
      name: "Sneha Reddy",
      class: "Class 11",
      school: "Narayana School",
      text: "Interactive quizzes make learning fun. I'm addicted to this app!",
      rating: 5,
      avatar: "SR"
    },
    {
      name: "Rahul Kumar",
      class: "College 1st Year",
      school: "IIT Delhi",
      text: "Perfect for competitive exam preparation. Highly recommended!",
      rating: 5,
      avatar: "RK"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Advanced artificial intelligence that adapts to your learning style and provides personalized explanations.",
      details: [
        "Personalized learning paths",
        "Adaptive difficulty adjustment",
        "Real-time performance analysis",
        "Smart content recommendations"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Learn through engaging competitions, achievements, and rewards that keep you motivated.",
      details: [
        "Weekly competitions",
        "Achievement badges",
        "Leaderboards",
        "Point-based rewards"
      ],
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Content",
      description: "Extensive curriculum coverage across all subjects with regular updates and new content.",
      details: [
        "NCERT aligned content",
        "Board exam preparation",
        "Competitive exam prep",
        "Concept visualization"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Connect with peers, share knowledge, and learn together in a supportive community.",
      details: [
        "Study groups",
        "Peer discussions",
        "Expert mentorship",
        "Community challenges"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set learning goals, track progress, and achieve academic milestones with detailed analytics.",
      details: [
        "Custom goal setting",
        "Progress visualization",
        "Performance insights",
        "Milestone celebrations"
      ],
      color: "from-red-500 to-rose-500"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your data is protected with industry-standard security measures and privacy controls.",
      details: [
        "End-to-end encryption",
        "Privacy first approach",
        "Secure authentication",
        "Data transparency"
      ],
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const subjects = [
    { name: "Mathematics", icon: Calculator, topics: 150, color: "text-blue-500" },
    { name: "Physics", icon: Atom, topics: 120, color: "text-purple-500" },
    { name: "Chemistry", icon: FlaskConical, topics: 110, color: "text-green-500" },
    { name: "Biology", icon: Dna, topics: 90, color: "text-red-500" },
    { name: "English", icon: BookOpen, topics: 80, color: "text-yellow-500" },
    { name: "History", icon: BookOpen, topics: 70, color: "text-amber-500" },
    { name: "Geography", icon: Globe, topics: 65, color: "text-cyan-500" },
    { name: "Computer Science", icon: Code, topics: 100, color: "text-indigo-500" }
  ];

  // Auto-cycle testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Loading simulation
  const simulateLoading = async () => {
    setIsLoading(true);
    setCurrentSection('loading');

    const stages = [
      'Initializing AI Engine...',
      'Loading Learning Algorithms...',
      'Preparing Personalized Content...',
      'Setting Up Your Profile...',
      'Almost Ready...'
    ];

    for (let i = 0; i < stages.length; i++) {
      setLoadingStage(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newUser = {
        id: userId,
        email: formData.email,
        password: formData.password, // In real app, this would be hashed
        name: formData.name,
        phone: formData.phone,
        class: formData.class,
        school: formData.school,
        totalPoints: 0,
        currentStreak: 0,
        joinDate: new Date().toISOString()
      };

      // Store user data (in a real app, this would be saved to backend)
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      localStorage.setItem('registeredUsers', JSON.stringify([...existingUsers, newUser]));

      // Use loginUser to properly authenticate
      loginUser({
        id: userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        class: formData.class,
        school: formData.school,
        totalPoints: 0,
        currentStreak: 0,
        joinDate: new Date().toISOString()
      });

      setLocation('/dashboard');
    } catch (error) {
      console.error('Setup error:', error);
      setIsLoading(false);
      setCurrentSection('signup'); // Go back to signup if error
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.name = 'Name can only contain letters and spaces';
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
        } else if (value.trim().length < 3) {
          newErrors.school = 'School name must be at least 3 characters';
        } else {
          delete newErrors.school;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const validateLoginField = (field: string, value: string) => {
    const newErrors = { ...loginErrors };

    switch (field) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!isValidEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setLoginErrors(newErrors);
    return !newErrors[field];
  };

  const validateProfileField = (field: string, value: string) => {
    const newErrors = { ...profileFormErrors };
    switch (field) {
      case 'name':
        if (!value.trim()) newErrors.name = 'Name is required';
        else if (value.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
        else if (!/^[a-zA-Z\s]+$/.test(value.trim())) newErrors.name = 'Name can only contain letters and spaces';
        else delete newErrors.name;
        break;
      case 'email':
        if (!value.trim()) newErrors.email = 'Email is required';
        else if (!isValidEmail(value)) newErrors.email = 'Please enter a valid email address';
        else if (detectFakeEmail(value)) newErrors.email = 'Please use a real email address';
        else delete newErrors.email;
        break;
      case 'phone':
        if (!value.trim()) newErrors.phone = 'Phone number is required';
        else if (!isValidPhone(value)) newErrors.phone = 'Please enter a valid phone number';
        else if (detectFakePhone(value)) newErrors.phone = 'Please use a real phone number';
        else delete newErrors.phone;
        break;
      case 'class':
        if (!value.trim()) newErrors.class = 'Class/Grade is required';
        else delete newErrors.class;
        break;
      case 'school':
        if (!value.trim()) newErrors.school = 'School/Institution is required';
        else if (value.trim().length < 3) newErrors.school = 'School name must be at least 3 characters';
        else delete newErrors.school;
        break;
    }
    setProfileFormErrors(newErrors);
    return !newErrors[field];
  };

  const canUpdateProfile = () => {
    return profileFormData.name.trim() &&
           profileFormData.email.trim() &&
           profileFormData.phone.trim() &&
           profileFormData.class.trim() &&
           profileFormData.school.trim() &&
           Object.keys(profileFormErrors).length === 0;
  };

  const handleLoginForProfile = async () => {
    if (!canLogin()) return;

    setIsLoading(true);
    setCurrentSection('loading');

    // Simulate login process
    const stages = [
      'Verifying credentials...',
      'Loading your profile...',
      'Preparing your dashboard...',
      'Almost ready...'
    ];

    for (let i = 0; i < stages.length; i++) {
      setLoadingStage(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      // Here you would normally verify credentials against stored user data
      // For demo purposes, we'll simulate successful login
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate fetching user data
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = storedUsers.find((u: any) => u.email === loginData.email && u.password === loginData.password);

      if (user) {
        updateProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          class: user.class,
          school: user.school,
          totalPoints: user.totalPoints || 0,
          currentStreak: user.currentStreak || 0,
          joinDate: user.joinDate || new Date().toISOString(),
          isAuthenticated: true
        });
        setLocation('/dashboard');
      } else {
        setLoginErrors({ general: 'Invalid email or password. Please try again.' });
        setIsLoading(false);
        setCurrentSection('login');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginErrors({ general: 'An unexpected error occurred during login.' });
      setIsLoading(false);
      setCurrentSection('login');
    }
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (profile?.isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [profile?.isAuthenticated, setLocation]);

  if (profile?.isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  if (currentSection === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4 relative overflow-hidden">
        <ParticleField />
        <div className="relative z-10 max-w-4xl mx-auto py-8">
          <Card className="premium-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl text-gradient-primary">Profile Settings</CardTitle>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
              <Button variant="destructive" onClick={logoutUser} className="h-12 px-6">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="text-center text-muted-foreground">
                You are already logged in. Redirecting to dashboard...
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setLocation('/dashboard')} className="premium-button">
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }


  // Login Section
  if (currentSection === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4 relative overflow-hidden">
        <ParticleField />

        <div className="relative z-10 max-w-md mx-auto py-8">
          <Card className="premium-card">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-gradient-primary">Welcome Back</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Login to continue your learning journey
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {loginErrors.general && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <AlertTriangle className="h-4 w-4" />
                  {loginErrors.general}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your.email@school.edu"
                  value={loginData.email}
                  onChange={(e) => handleLoginInputChange('email', e.target.value)}
                  className={`premium-input ${loginErrors.email ? 'border-destructive' : ''}`}
                />
                {loginErrors.email && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {loginErrors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => handleLoginInputChange('password', e.target.value)}
                  className={`premium-input ${loginErrors.password ? 'border-destructive' : ''}`}
                />
                {loginErrors.password && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {loginErrors.password}
                  </div>
                )}
              </div>

              {/* Login Button */}
              <div className="space-y-4">
                <Button
                  onClick={handleLogin}
                  disabled={!canLogin() || isLoading}
                  className="w-full premium-button h-14 text-lg"
                  variant="premium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <LoadingSpinner />
                      Logging in...
                    </div>
                  ) : (
                    <>
                      Login to Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection('signup')}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Create Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection('landing')}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Demo Account:
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>Email:</strong> demo@student.com</p>
                  <p><strong>Password:</strong> password123</p>
                </div>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  By logging in, you agree to our{' '}
                  <span className="text-primary underline cursor-pointer hover:text-primary/80">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-primary underline cursor-pointer hover:text-primary/80">Privacy Policy</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (currentSection === 'loading') {
    const loadingStages = profile.isAuthenticated ? [
      'Verifying credentials...',
      'Loading your profile...',
      'Preparing your dashboard...',
      'Almost ready...'
    ] : [
      'Initializing AI Engine...',
      'Loading Learning Algorithms...',
      'Preparing Personalized Content...',
      'Setting Up Your Profile...',
      'Almost Ready...'
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField />

        <div className="relative z-10 text-center space-y-8 max-w-lg mx-auto">
          <div className="space-y-6">
            <div className="relative mx-auto w-32 h-32">
              <LoadingPulse />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gradient-primary">
                Setting Up Your Learning Experience
              </h1>

              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">
                  {loadingStages[loadingStage]}
                </p>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round(((loadingStage + 1) / loadingStages.length) * 100)}% Complete
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-8">
            <LoadingBars />
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🚀 Powered by Advanced AI Technology</p>
            <p>🔒 Your data is secure and encrypted</p>
            <p>⚡ Optimizing for your learning style</p>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page
  if (currentSection === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background relative overflow-hidden">
        <ParticleField />
        <FloatingIcons />

        {/* Hero Section */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo and Brand */}
            <div className="space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="w-full h-full bg-gradient-to-br from-primary via-accent to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow transform rotate-12">
                  <GraduationCap className="text-white h-12 w-12" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="absolute -bottom-2 -left-2 animate-pulse">
                  <Star className="h-6 w-6 text-pink-400" />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Welcome to{' '}
                  <AdvancedTypingText 
                    texts={['EduLearn', 'Your AI Tutor', 'Smart Learning', 'Future Education']}
                    className="text-6xl md:text-8xl"
                  />
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Transform your learning journey with AI-powered education, 
                  interactive quizzes, and personalized study experiences
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {appStats.map((stat, index) => (
                <Card key={index} className="premium-card text-center p-4">
                  <div className="space-y-2">
                    <AnimatedCounter 
                      end={stat.value} 
                      prefix={stat.prefix} 
                      suffix={stat.suffix}
                    />
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => setCurrentSection('about')} 
                  className="premium-button text-lg h-14 px-8 group"
                  variant="premium"
                >
                  Discover Features
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  onClick={() => setCurrentSection('signup')} 
                  className="premium-button text-lg h-14 px-8"
                  variant="accent"
                >
                  Start Learning Now
                  <Rocket className="h-5 w-5 ml-2" />
                </Button>
              </div>

              <div className="flex items-center justify-center">
                <Button 
                  onClick={() => setCurrentSection('login')} 
                  variant="outline"
                  className="h-12 px-6"
                >
                  Already have an account? Login
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No ads</span>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // About/Features Section
  if (currentSection === 'about') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4 relative overflow-hidden">
        <ParticleField />

        <div className="relative z-10 max-w-6xl mx-auto space-y-12 py-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-primary to-accent">
              ✨ Powered by AI Technology
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-primary">
              Everything You Need to Excel
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with proven educational methods 
              to deliver personalized learning experiences that adapt to your unique style.
            </p>
          </div>

          {/* Interactive Features Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`premium-card p-6 cursor-pointer transition-all duration-300 ${
                  activeFeature === index ? 'ring-2 ring-primary scale-105' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Subjects Grid */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gradient-primary">
              Master Every Subject
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.map((subject, index) => (
                <Card key={index} className="premium-card p-4 text-center group hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className={`mx-auto w-12 h-12 rounded-xl bg-surface flex items-center justify-center ${subject.color}`}>
                      <subject.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">{subject.topics} topics</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-gradient-primary">
              What Students Say
            </h2>
            <div className="relative max-w-4xl mx-auto">
              <Card className="premium-card p-8 text-center">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xl italic text-muted-foreground">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[currentTestimonial].class} • {testimonials[currentTestimonial].school}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Testimonial Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentTestimonial ? 'bg-primary' : 'bg-surface'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setCurrentSection('landing')} 
              variant="outline"
              className="h-12 px-6"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => setCurrentSection('features')} 
              className="premium-button h-12 px-6"
            >
              Explore More Features
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              onClick={() => setCurrentSection('signup')} 
              className="premium-button h-12 px-6"
              variant="accent"
            >
              Join Now
              <Rocket className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Features Deep Dive Section
  if (currentSection === 'features') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4 relative overflow-hidden">
        <ParticleField />

        <div className="relative z-10 max-w-6xl mx-auto space-y-16 py-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-primary">
              Advanced Learning Technology
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Discover how our cutting-edge platform leverages artificial intelligence, 
              machine learning, and advanced analytics to create the perfect learning environment for you.
            </p>
          </div>

          {/* AI Technology Showcase */}
          <div className="space-y-12">
            <Card className="premium-card p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gradient-primary">AI-Powered Tutoring</h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Our advanced AI engine understands your learning patterns, identifies knowledge gaps, 
                    and provides real-time assistance tailored to your individual needs.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Natural language processing for better understanding",
                      "Adaptive learning algorithms that evolve with you",
                      "Real-time doubt resolution and explanations",
                      "Personalized study recommendations"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-surface rounded-xl p-6 border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">You</span>
                    </div>
                    <p className="text-sm">"Can you explain photosynthesis in simple terms?"</p>
                  </div>
                  <div className="bg-surface rounded-xl p-6 border-l-4 border-accent">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">AI Tutor</span>
                    </div>
                    <p className="text-sm">
                      "Think of photosynthesis as nature's way of cooking! Plants use sunlight as energy, 
                      carbon dioxide as ingredients, and water to create glucose (food) and oxygen..."
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="premium-card p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-surface rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Weekly Progress</h3>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { subject: "Mathematics", progress: 85, color: "bg-blue-500" },
                        { subject: "Physics", progress: 72, color: "bg-purple-500" },
                        { subject: "Chemistry", progress: 90, color: "bg-green-500" },
                        { subject: "Biology", progress: 68, color: "bg-red-500" }
                      ].map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.subject}</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6 order-1 md:order-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gradient-primary">Smart Analytics</h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Get detailed insights into your learning journey with comprehensive analytics 
                    that help you understand your strengths and areas for improvement.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Detailed performance tracking across all subjects",
                      "Strength and weakness identification",
                      "Time spent analysis and optimization",
                      "Predictive insights for exam preparation"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="premium-card p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gradient-primary">Gamified Learning</h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Turn learning into an exciting adventure with our gamification system that 
                    rewards progress, encourages consistency, and makes education fun.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Achievement badges for milestones",
                      "Daily and weekly challenges",
                      "Leaderboards and competitions",
                      "Reward points and unlockables"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Star, label: "Scholar", desc: "Complete 10 quizzes", color: "from-yellow-400 to-yellow-600" },
                    { icon: Flame, label: "Streak Master", desc: "7 day streak", color: "from-orange-400 to-red-500" },
                    { icon: Target, label: "Perfectionist", desc: "100% accuracy", color: "from-green-400 to-green-600" },
                    { icon: Rocket, label: "Speed Runner", desc: "Fast completion", color: "from-blue-400 to-blue-600" }
                  ].map((badge, index) => (
                    <div key={index} className="bg-surface rounded-xl p-4 text-center space-y-2">
                      <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center`}>
                        <badge.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm">{badge.label}</h3>
                      <p className="text-xs text-muted-foreground">{badge.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Technology Stack */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-gradient-primary">
              Built with Cutting-Edge Technology
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Brain, label: "Machine Learning", desc: "Advanced algorithms" },
                { icon: Shield, label: "Security", desc: "End-to-end encryption" },
                { icon: Cpu, label: "Cloud Computing", desc: "Scalable infrastructure" },
                { icon: Database, label: "Big Data", desc: "Intelligent insights" }
              ].map((tech, index) => (
                <Card key={index} className="premium-card p-6 text-center group hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <tech.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tech.label}</h3>
                      <p className="text-sm text-muted-foreground">{tech.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setCurrentSection('about')} 
              variant="outline"
              className="h-12 px-6"
            >
              Back to Overview
            </Button>
            <Button 
              onClick={() => setCurrentSection('signup')} 
              className="premium-button h-12 px-6"
              variant="accent"
            >
              Experience It Yourself
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Signup Section
  if (currentSection === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4 relative overflow-hidden">
        <ParticleField />

        <div className="relative z-10 max-w-2xl mx-auto py-8">
          <Card className="premium-card">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-gradient-primary">Join EduLearn Today</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Create your account and start your personalized learning journey
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
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
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
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
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
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

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`premium-input ${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Class Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Class/Grade
                </label>
                <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                  <SelectTrigger className={`premium-input ${errors.class ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your class/grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
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
                <label className="text-sm font-medium flex items-center gap-2">
                  <School className="h-4 w-4" />
                  School/Institution
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Start typing your school name..."
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className={`premium-input ${errors.school ? 'border-destructive' : ''}`}
                    onFocus={() => formData.school.length > 2 && setShowSchoolSuggestions(true)}
                  />
                  {showSchoolSuggestions && schoolSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {schoolSuggestions.map((school, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 hover:bg-surface transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                          onClick={() => selectSchool(school)}
                        >
                          <School className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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

              {/* Benefits reminder */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  What you'll get:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {[
                    "Personalized AI tutoring",
                    "Interactive quiz system",
                    "Progress tracking",
                    "Achievement badges",
                    "Study groups",
                    "Expert support",
                    "Mobile access",
                    "Regular updates"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={simulateLoading}
                  disabled={!canProceed() || isLoading}
                  className="w-full premium-button h-14 text-lg"
                  variant="premium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <LoadingSpinner />
                      Setting up your account...
                    </div>
                  ) : (
                    <>
                      Create Account & Start Learning
                      <Rocket className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection('login')}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Login Instead
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection('landing')}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <span className="text-primary underline cursor-pointer hover:text-primary/80">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-primary underline cursor-pointer hover:text-primary/80">Privacy Policy</span>
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Data Protected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>GDPR Compliant</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}