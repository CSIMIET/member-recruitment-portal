'use client';

import { useState, useEffect } from 'react';

interface FormData {
  fullName: string;
  rollNumber: string;
  classSection: string;
  branch: string;
  email: string;
  yearOfStudy: string;
  teamLevel: string;
  selectedRole: string;
  motivationAndGrowth: string;
  expectationsFromCSI: string;
  excitingActivityAndWhy: string;
  priorExperience: string;
  skills: string;
  personalProject: string;
  timeCommitment: string;
  teamWork: string;
  mentoringExperience: string;
  contributionPlan: string;
}

interface StoryStep {
  id: string;
  title: string;
  narrative: string;
  fields: {
    name: keyof FormData;
    type: 'text' | 'email' | 'select' | 'textarea' | 'radio' | 'number';
    placeholder?: string;
    options?: string[];
    required: boolean;
  }[];
  condition?: (data: FormData) => boolean;
}

export default function StoryModeForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    rollNumber: '',
    classSection: '',
    branch: '',
    email: '',
    yearOfStudy: '',
    teamLevel: '',
    selectedRole: '',
    motivationAndGrowth: '',
    expectationsFromCSI: '',
    excitingActivityAndWhy: '',
    priorExperience: '',
    skills: '',
    personalProject: '',
    timeCommitment: '',
    teamWork: '',
    mentoringExperience: '',
    contributionPlan: ''
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [rollNumberError, setRollNumberError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Check if user has already submitted or email is already used
  useEffect(() => {
    const submissionToken = localStorage.getItem('csi_submission_token');
    if (submissionToken) {
      setHasSubmitted(true);
    }

    // Wait for reCAPTCHA to load
    const loadRecaptcha = () => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha?.enterprise) {
        return;
      }
      setTimeout(loadRecaptcha, 100);
    };
    loadRecaptcha();
  }, []);

  // Check for duplicate email usage
  const isEmailAlreadyUsed = (email: string): boolean => {
    const usedEmails = JSON.parse(localStorage.getItem('csi_used_emails') || '[]');
    return usedEmails.includes(email.toLowerCase());
  };

  // Add email to used emails list
  const addEmailToUsedList = (email: string) => {
    const usedEmails = JSON.parse(localStorage.getItem('csi_used_emails') || '[]');
    usedEmails.push(email.toLowerCase());
    localStorage.setItem('csi_used_emails', JSON.stringify(usedEmails));
  };

  const juniorCoreTeamDomains = [
    'Technical Team',
    'Graphics Team',
    'Content & Editorial Team',
    'Social Media Team',
    'Event Management Team',
    'PR & Outreach Team',
    'Visuals Team (Photography/Video Editing)'
  ];

  const seniorCoreTeamRoles = [
    'Technical Head',
    'Graphics Head',
    'PR & Outreach Head',
    'Social Media Handler',
    'Secretary'
  ];

  const storySteps: StoryStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Journey',
      narrative: "Welcome, future innovator! 🚀 You're about to embark on an exciting journey to join CSI MIET, where technology meets creativity and dreams turn into reality. Let's start by getting to know who you are...",
      fields: [
        { name: 'fullName', type: 'text', placeholder: 'Enter your full name', required: true }
      ]
    },
    {
      id: 'identity',
      title: 'Your Academic Identity',
      narrative: `Nice to meet you, ${formData.fullName ? formData.fullName.split(' ')[0] : 'friend'}! 📚 Every great tech leader has humble beginnings in the classroom. Tell us about your academic journey...`,
      fields: [
        { name: 'rollNumber', type: 'text', placeholder: 'Enter your roll number', required: true },
        { name: 'classSection', type: 'text', placeholder: 'e.g., B.Tech CSE-A', required: true },
        { name: 'branch', type: 'text', placeholder: 'Your branch of study', required: true }
      ]
    },
    {
      id: 'contact',
      title: 'Staying Connected',
      narrative: '📧 In the digital age, connections matter! Share your email so we can keep you updated on your journey with CSI MIET and all the amazing opportunities ahead.',
      fields: [
        { name: 'email', type: 'email', placeholder: 'your.email@example.com', required: true }
      ]
    },
    {
      id: 'academic-year',
      title: 'Your Academic Stage',
      narrative: '🎓 Every year brings new challenges and opportunities. Your current academic year helps us understand your experience level and tailor opportunities just for you!',
      fields: [
        { 
          name: 'yearOfStudy', 
          type: 'select', 
          options: ['', '1st Year', '2nd Year', '3rd Year'],
          required: true 
        }
      ]
    },
    {
      id: 'team-level',
      title: 'Choosing Your Path',
      narrative: '🎯 As a 3rd year student, you have a special opportunity! Would you like to guide juniors as part of the Senior Team, or continue growing your skills in the Junior Core Team?',
      fields: [
        { 
          name: 'teamLevel', 
          type: 'radio', 
          options: ['Junior Core', 'Senior Team'],
          required: true 
        }
      ],
      condition: (data) => data.yearOfStudy === '3rd Year'
    },
    {
      id: 'role-selection',
      title: 'Your Perfect Role',
      narrative: '✨ Every team member brings unique talents! Choose the role that excites you most - where your passion meets our mission to create amazing tech experiences.',
      fields: [
        { 
          name: 'selectedRole', 
          type: 'select', 
          options: ['', ...getRoleOptions()],
          required: true 
        }
      ]
    },
    {
      id: 'motivation',
      title: 'Your Inner Drive',
      narrative: '💫 What spark ignited your interest in CSI MIET? Share your story of inspiration and how you envision growing with our community of innovators.',
      fields: [
        { 
          name: 'motivationAndGrowth', 
          type: 'textarea', 
          placeholder: 'Share what inspired you to apply and how you see yourself growing...',
          required: true 
        }
      ]
    },
    {
      id: 'expectations',
      title: 'Dreams and Aspirations',
      narrative: '🌟 CSI MIET is a launchpad for dreams! What experiences, skills, or opportunities are you hoping to gain? Your expectations help us create better experiences for everyone.',
      fields: [
        { 
          name: 'expectationsFromCSI', 
          type: 'textarea', 
          placeholder: 'What kind of learning and experiences are you hoping to gain...',
          required: true 
        }
      ]
    },
    {
      id: 'interests',
      title: 'What Excites You Most?',
      narrative: '🎨 CSI MIET offers a diverse palette of activities - from mind-bending hackathons to creative design workshops. What makes your heart race with excitement?',
      fields: [
        { 
          name: 'excitingActivityAndWhy', 
          type: 'textarea', 
          placeholder: 'Which CSI MIET activity excites you most and why...',
          required: true 
        }
      ]
    },
    {
      id: 'experience',
      title: 'Your Background Story',
      narrative: '📖 Every expert was once a beginner! Share your journey so far - whether you\'re just starting or have some experience under your belt.',
      fields: [
        { 
          name: 'priorExperience', 
          type: 'textarea', 
          placeholder: 'Tell us about your prior experience in this domain...',
          required: true 
        }
      ]
    },
    {
      id: 'skills',
      title: 'Your Superpower Arsenal',
      narrative: '⚡ What skills and tools do you bring to the table? Every team member contributes something unique - share your superpowers!',
      fields: [
        { 
          name: 'skills', 
          type: 'textarea', 
          placeholder: 'What skills or tools can you contribute to the team...',
          required: true 
        }
      ]
    },
    {
      id: 'projects',
      title: 'Your Creative Journey',
      narrative: '🛠️ Show us what you\'ve built! Even the smallest project shows your passion for creating. Share any project that makes you proud.',
      fields: [
        { 
          name: 'personalProject', 
          type: 'textarea', 
          placeholder: 'Tell us about any project you\'ve worked on...',
          required: true 
        }
      ],
      condition: (data) => data.yearOfStudy !== '3rd Year' || data.teamLevel === 'Junior Core'
    },
    {
      id: 'mentoring',
      title: 'Your Leadership Story',
      narrative: '👨‍🏫 Leadership is about lifting others up! Share your experiences in guiding, teaching, or mentoring others.',
      fields: [
        { 
          name: 'mentoringExperience', 
          type: 'textarea', 
          placeholder: 'Share your mentoring or leadership experiences...',
          required: true 
        }
      ],
      condition: (data) => data.yearOfStudy === '3rd Year' && data.teamLevel === 'Senior Team'
    },
    {
      id: 'future-plans',
      title: 'Your Vision for CSI',
      narrative: '🚀 As a senior team member, you\'ll help shape CSI MIET\'s future! What\'s your 90-day vision for contributing to our community?',
      fields: [
        { 
          name: 'contributionPlan', 
          type: 'textarea', 
          placeholder: 'How would you contribute to CSI MIET in the next 3 months...',
          required: true 
        }
      ],
      condition: (data) => data.yearOfStudy === '3rd Year' && data.teamLevel === 'Senior Team'
    },
    {
      id: 'commitment',
      title: 'Time and Teamwork',
      narrative: '⏰ Great things are built together! Let us know about your availability and how you work with others.',
      fields: [
        { 
          name: 'timeCommitment', 
          type: 'select', 
          options: ['', '<2 hrs', '2–4 hrs', '5–7 hrs', '7+ hrs'],
          required: true 
        },
        { 
          name: 'teamWork', 
          type: 'radio', 
          options: ['Yes', 'No'],
          required: true 
        }
      ]
    },
    {
      id: 'final-verification',
      title: 'Almost There!',
      narrative: '🎉 You\'ve shared your amazing story with us! Just one final step - prove you\'re human with our security check, and you\'ll officially be on your way to joining the CSI MIET family!',
      fields: []
    }
  ];

  function getRoleOptions(): string[] {
    if (formData.yearOfStudy === '3rd Year') {
      if (formData.teamLevel === 'Senior Team') {
        return seniorCoreTeamRoles;
      } else if (formData.teamLevel === 'Junior Core') {
        return juniorCoreTeamDomains;
      }
    } else if (formData.yearOfStudy === '1st Year' || formData.yearOfStudy === '2nd Year') {
      return juniorCoreTeamDomains;
    }
    return [];
  }

  const getVisibleSteps = () => {
    return storySteps.filter(step => !step.condition || step.condition(formData));
  };

  const visibleSteps = getVisibleSteps();
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;

  const handleInputChange = (name: keyof FormData, value: string) => {
    // Clear errors when user starts typing
    if (name === 'email') {
      setEmailError(null);
    }
    if (name === 'rollNumber') {
      setRollNumberError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'yearOfStudy' && { selectedRole: '', teamLevel: '' }),
      ...(name === 'teamLevel' && { selectedRole: '' })
    }));
  };

  const validateCurrentStep = (): boolean => {
    const currentStepData = visibleSteps[currentStep];
    if (!currentStepData) return true;

    return currentStepData.fields.every(field => {
      if (!field.required) return true;
      const value = formData[field.name];
      
      // Basic required field check
      if (!value || value.trim() === '') {
        return false;
      }
      
      // Email validation
      if (field.type === 'email') {
        if (!validateEmail(value)) {
          setEmailError('Please enter a valid email address');
          return false;
        }
        
        if (isEmailAlreadyUsed(value)) {
          setEmailError('This email has already been used for a submission');
          return false;
        }
      }
      
      // Roll number validation (numeric only)
      if (field.name === 'rollNumber') {
        const numericRegex = /^\d+$/;
        if (!numericRegex.test(value)) {
          setRollNumberError('Roll number must contain only numbers');
          return false;
        }
        
        if (value.length < 1 || value.length > 15) {
          setRollNumberError('Roll number must be between 1 and 15 digits');
          return false;
        }
      }
      
      return true;
    });
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      if (emailError) {
        setSubmitError(emailError);
      } else if (rollNumberError) {
        setSubmitError(rollNumberError);
      }
      return;
    }
    
    setSubmitError(null);
    setEmailError(null);
    setRollNumberError(null);
    if (currentStep < visibleSteps.length - 1) {
      setStepDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setStepDirection('backward');
      setCurrentStep(currentStep - 1);
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    // Check if user has already submitted
    if (hasSubmitted) {
      setSubmitError('You have already submitted an application. Only one submission per user is allowed.');
      return;
    }

    // Validate all required fields are filled
    const missingFields = [];
    if (!formData.fullName.trim()) missingFields.push('Full Name');
    if (!formData.rollNumber.trim()) missingFields.push('Roll Number');
    if (!formData.classSection.trim()) missingFields.push('Class Section');
    if (!formData.branch.trim()) missingFields.push('Branch');
    if (!formData.email.trim()) missingFields.push('Email');
    if (!formData.yearOfStudy.trim()) missingFields.push('Year of Study');
    if (!formData.selectedRole.trim()) missingFields.push('Selected Role');
    if (!formData.motivationAndGrowth.trim()) missingFields.push('Motivation and Growth');
    if (!formData.expectationsFromCSI.trim()) missingFields.push('Expectations from CSI');
    if (!formData.excitingActivityAndWhy.trim()) missingFields.push('Exciting Activity');
    if (!formData.priorExperience.trim()) missingFields.push('Prior Experience');
    if (!formData.skills.trim()) missingFields.push('Skills');
    if (!formData.timeCommitment.trim()) missingFields.push('Time Commitment');
    if (!formData.teamWork.trim()) missingFields.push('Team Work');

    // Check conditional fields
    if (formData.yearOfStudy === '3rd Year') {
      if (!formData.teamLevel.trim()) missingFields.push('Team Level');
      if (formData.teamLevel === 'Senior Team') {
        if (!formData.mentoringExperience.trim()) missingFields.push('Mentoring Experience');
        if (!formData.contributionPlan.trim()) missingFields.push('Contribution Plan');
      } else if (formData.teamLevel === 'Junior Core') {
        if (!formData.personalProject.trim()) missingFields.push('Personal Project');
      }
    } else {
      if (!formData.personalProject.trim()) missingFields.push('Personal Project');
    }

    if (missingFields.length > 0) {
      setSubmitError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Final email validation before submission
    if (!validateEmail(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return;
    }

    if (isEmailAlreadyUsed(formData.email)) {
      setSubmitError('This email has already been used for a submission');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setEmailError(null);

    try {
      // Execute reCAPTCHA Enterprise verification
      let token = '';
      
      // Wait for reCAPTCHA to be fully loaded
      const waitForRecaptcha = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          const checkRecaptcha = () => {
            if (typeof window !== 'undefined' && (window as any).grecaptcha?.enterprise?.ready) {
              resolve();
            } else {
              setTimeout(checkRecaptcha, 100);
            }
          };
          checkRecaptcha();
          
          // Timeout after 10 seconds
          setTimeout(() => {
            reject(new Error('reCAPTCHA failed to load'));
          }, 10000);
        });
      };

      await waitForRecaptcha();

      await new Promise<void>((resolve, reject) => {
        (window as any).grecaptcha.enterprise.ready(async () => {
          try {
            console.log('Executing reCAPTCHA...');
            const siteKey = process.env.RECAPTCHA_SITE_KEY;
            if (!siteKey) {
              reject(new Error('reCAPTCHA site key is not configured'));
              return;
            }
            token = await (window as any).grecaptcha.enterprise.execute(siteKey, {action: 'LOGIN'});
            console.log('reCAPTCHA token received:', token ? 'valid' : 'null/empty');
            if (!token) {
              reject(new Error('Failed to get reCAPTCHA token - received null or empty token'));
              return;
            }
            setCaptchaToken(token);
            resolve();
          } catch (error) {
            console.error('reCAPTCHA execution error:', error);
            reject(error);
          }
        });
      });

      const formDataToSend = {
        ...formData,
        captchaToken: token,
        _honeypot: ''
      };

      console.log('Sending form data:', formDataToSend);

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend)
      });

      const responseData = await response.json();
      console.log('API response:', responseData);
      
      if (response.ok) {
        // Generate submission token and save to localStorage
        const submissionToken = `CSI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('csi_submission_token', submissionToken);
        
        // Add email to used emails list
        addEmailToUsedList(formData.email);
        
        // Set submission flag
        setHasSubmitted(true);
        
        setShowSuccessModal(true);
        setCaptchaToken(null);
        setFormData({
          fullName: '',
          rollNumber: '',
          classSection: '',
          branch: '',
          email: '',
          yearOfStudy: '',
          teamLevel: '',
          selectedRole: '',
          motivationAndGrowth: '',
          expectationsFromCSI: '',
          excitingActivityAndWhy: '',
          priorExperience: '',
          skills: '',
          personalProject: '',
          timeCommitment: '',
          teamWork: '',
          mentoringExperience: '',
          contributionPlan: ''
        });
        setCurrentStep(0);
      } else {
        if (response.status === 429) {
          setSubmitError('Too many requests. Please wait before trying again.');
        } else if (response.status === 400) {
          const errorMessage = responseData.error || 'Please check your input and try again.';
          const details = responseData.details ? ` Details: ${responseData.details.join(', ')}` : '';
          setSubmitError(errorMessage + details);
        } else {
          setSubmitError('Submission failed. Please try again later.');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('reCAPTCHA failed to load')) {
          setSubmitError('reCAPTCHA is taking longer to load than expected. Please refresh the page and try again.');
        } else if (error.message.includes('Failed to get reCAPTCHA token')) {
          setSubmitError('reCAPTCHA verification failed. Please refresh the page and try again.');
        } else {
          setSubmitError('reCAPTCHA verification failed. Please try again.');
        }
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
      console.error('Error:', error);
    }

    setIsSubmitting(false);
  };

  const renderField = (field: StoryStep['fields'][0]) => {
    const value = formData[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-3 outline-none transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] backdrop-blur-sm ${
              field.name === 'email' && emailError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-300/50 bg-gradient-to-r from-red-50/50 to-pink-50/30'
                : field.name === 'email' && value && validateEmail(value) && !isEmailAlreadyUsed(value)
                ? 'border-green-300 focus:border-green-500 focus:ring-green-300/50 bg-gradient-to-r from-green-50/50 to-emerald-50/30'
                : field.name === 'rollNumber' && rollNumberError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-300/50 bg-gradient-to-r from-red-50/50 to-pink-50/30'
                : field.name === 'rollNumber' && value && /^\d+$/.test(value) && value.length >= 1 && value.length <= 15
                ? 'border-green-300 focus:border-green-500 focus:ring-green-300/50 bg-gradient-to-r from-green-50/50 to-emerald-50/30'
                : 'border-gray-200/60 focus:border-blue-500 focus:ring-blue-300/50 bg-gradient-to-r from-white to-blue-50/30 hover:border-blue-300'
            }`}
            required={field.required}
            {...(field.name === 'rollNumber' && {
              inputMode: 'numeric',
              pattern: '[0-9]*'
            })}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-200/60 rounded-xl focus:ring-3 focus:ring-blue-300/50 focus:border-blue-500 outline-none transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30 shadow-md hover:shadow-lg hover:border-blue-300 transform hover:scale-[1.01] backdrop-blur-sm"
            required={field.required}
          >
            {field.options?.map(option => (
              <option key={option} value={option}>{option || 'Select an option'}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center p-3 bg-gradient-to-r from-white to-blue-50/40 border border-gray-200/60 rounded-xl hover:border-blue-300 hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/40 transition-all duration-300 cursor-pointer group transform hover:scale-[1.01] backdrop-blur-sm">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  required={field.required}
                />
                <span className="text-base text-gray-700 group-hover:text-blue-700 transition-colors">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-4 py-3 text-base border-2 border-gray-200/60 rounded-xl focus:ring-3 focus:ring-blue-300/50 focus:border-blue-500 outline-none transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 shadow-md hover:shadow-lg hover:border-blue-300 transform hover:scale-[1.01] resize-vertical backdrop-blur-sm"
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  const currentStepData = visibleSteps[currentStep];

  if (!currentStepData) {
    return <div>Loading...</div>;
  }

  // If user has already submitted, show a message instead of the form
  if (hasSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-200 mb-6">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Already Submitted!</h2>
          <p className="text-gray-600 mb-6">You have already submitted your application to CSI MIET. Only one submission per user is allowed.</p>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-left">
            <h4 className="font-bold text-blue-800 mb-2">What's Next?</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Our team is reviewing your application
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                You'll be contacted if selected for an interview
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Check your email for updates
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* CSI Logo Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("/csi-logo.png")',
          backgroundSize: '400px',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
          filter: 'grayscale(100%)'
        }}
      ></div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-50 rounded-full filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-purple-50 rounded-full filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-indigo-50 rounded-full filter blur-2xl opacity-20 animate-float animation-delay-4000"></div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-xl border-b border-gradient-to-r from-blue-200/30 to-purple-200/30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center mb-2">
            <div className="text-sm font-semibold text-blue-600">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out rounded-full relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 w-full h-full animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 w-full h-full animate-shimmer"></div>
            </div>
            <div className="absolute inset-0 rounded-full border border-blue-200/50"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-6 px-3">
        <div className="max-w-2xl mx-auto">
          <div 
            key={currentStep}
            className={`transition-all duration-500 ease-in-out transform ${
              stepDirection === 'forward' 
                ? 'animate-slide-in-right' 
                : 'animate-slide-in-left'
            }`}
          >
            {/* Story Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight py-1">
                {currentStepData.title}
              </h1>
              <div className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gradient-to-r from-blue-100 to-purple-100 hover:shadow-xl transition-all duration-500">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {currentStepData.narrative}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-gradient-to-br from-white/98 to-indigo-50/70 backdrop-blur-md rounded-2xl shadow-lg border border-gradient-to-r from-blue-100/50 to-purple-100/50 p-6 mb-6 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.01]">
              <div className="space-y-4">
                {currentStepData.fields.map((field, index) => (
                  <div key={`${field.name}-${index}`} className="space-y-1">
                    <label className="block text-base font-semibold text-gray-800 mb-1">
                      {field.name === 'fullName' && 'What should we call you?'}
                      {field.name === 'rollNumber' && 'Your Roll Number'}
                      {field.name === 'classSection' && 'Class & Section'}
                      {field.name === 'branch' && 'Your Branch'}
                      {field.name === 'email' && 'Email Address'}
                      {field.name === 'yearOfStudy' && 'Current Year of Study'}
                      {field.name === 'teamLevel' && 'Choose Your Path'}
                      {field.name === 'selectedRole' && 'Your Preferred Role'}
                      {field.name === 'motivationAndGrowth' && 'Your Inspiration Story'}
                      {field.name === 'expectationsFromCSI' && 'Your Dreams & Goals'}
                      {field.name === 'excitingActivityAndWhy' && 'What Excites You?'}
                      {field.name === 'priorExperience' && 'Your Journey So Far'}
                      {field.name === 'skills' && 'Your Superpowers'}
                      {field.name === 'personalProject' && 'Your Creative Works'}
                      {field.name === 'timeCommitment' && 'Weekly Time Available'}
                      {field.name === 'teamWork' && 'Comfortable with Teamwork?'}
                      {field.name === 'mentoringExperience' && 'Leadership Experience'}
                      {field.name === 'contributionPlan' && 'Your 90-Day Vision'}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      {renderField(field)}
                      {field.name === 'email' && formData.email && validateEmail(formData.email) && !isEmailAlreadyUsed(formData.email) && !emailError && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {field.name === 'rollNumber' && formData.rollNumber && /^\d+$/.test(formData.rollNumber) && formData.rollNumber.length >= 1 && formData.rollNumber.length <= 15 && !rollNumberError && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {field.name === 'email' && emailError && (
                      <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl shadow-sm animate-pulse">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div className="text-red-700 text-sm font-medium">{emailError}</div>
                        </div>
                      </div>
                    )}
                    {field.name === 'rollNumber' && rollNumberError && (
                      <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl shadow-sm animate-pulse">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div className="text-red-700 text-sm font-medium">{rollNumberError}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              </div>

              {/* Error Display */}
              {submitError && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl shadow-lg backdrop-blur-sm transform scale-95 hover:scale-100 transition-all duration-300">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-red-700 text-sm font-medium">{submitError}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              {currentStep === 0 ? (
                <div></div>
              ) : (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md transform hover:scale-105"
                >
                  ← Previous
                </button>
              )}

              {currentStep === visibleSteps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-10 py-3 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20 ${
                    isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 shadow-lg"></div>
                      <span className="animate-pulse">Submitting your amazing story...</span>
                    </div>
                  ) : (
                    '🚀 Join CSI MIET!'
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-base hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg backdrop-blur-sm border border-white/20"
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md w-full mx-4 transform transition-all animate-bounce-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 border border-green-200 mb-6 animate-pulse">
                <div className="text-4xl">🎉</div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Welcome to CSI MIET!</h3>
              <p className="text-gray-600 mb-6">Your story has been submitted successfully! Get ready for an amazing journey of innovation and growth.</p>
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-6 text-left">
                <h4 className="font-bold text-blue-800 mb-3">🚀 What&apos;s Next?</h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Our team will review your amazing story
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Shortlisted candidates will be contacted
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Keep an eye on your email for updates
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Continue Your Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Honeypot */}
      <input
        type="text"
        name="_honeypot"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          visibility: 'hidden',
          opacity: 0,
          height: 0,
          width: 0
        }}
      />
    </div>
  );
}