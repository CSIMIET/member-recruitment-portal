'use client';

import { useState } from 'react';

interface FormData {
  fullName: string;
  rollNumber: string;
  classSection: string;
  branch: string;
  email: string;
  yearOfStudy: string;
  // For 3rd year students - choose between Junior Core or Senior Team
  teamLevel: string;
  selectedRole: string;
  // Restructured questions in logical order
  // Motivation & Interest
  motivationAndGrowth: string;
  expectationsFromCSI: string;
  excitingActivityAndWhy: string;
  // Skills & Experience
  priorExperience: string;
  skills: string;
  // Junior-specific question
  personalProject: string;
  // Commitment & Teamwork
  timeCommitment: string;
  teamWork: string;
  // Leadership (Seniors only)
  mentoringExperience: string;
  contributionPlan: string;
}

export default function MembershipForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    rollNumber: '',
    classSection: '',
    branch: '',
    email: '',
    yearOfStudy: '',
    teamLevel: '',
    selectedRole: '',
    // Restructured questions
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

  const [showToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset selected role and team level when year changes
      ...(name === 'yearOfStudy' && { selectedRole: '', teamLevel: '' }),
      // Reset selected role when team level changes
      ...(name === 'teamLevel' && { selectedRole: '' })
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation - build required fields dynamically
    const requiredFields = ['fullName', 'rollNumber', 'classSection', 'branch', 'email', 'yearOfStudy', 'selectedRole', 'motivationAndGrowth', 'expectationsFromCSI', 'excitingActivityAndWhy', 'priorExperience', 'skills', 'timeCommitment', 'teamWork'];
    
    // Add team level for 3rd year students
    if (formData.yearOfStudy === '3rd Year') {
      requiredFields.push('teamLevel');
    }
    
    // Add junior-specific fields for 1st, 2nd year, or 3rd year choosing Junior Core
    if (formData.yearOfStudy === '1st Year' || formData.yearOfStudy === '2nd Year' || 
        (formData.yearOfStudy === '3rd Year' && formData.teamLevel === 'Junior Core')) {
      requiredFields.push('personalProject');
    }
    
    // Add senior-specific fields for 3rd year choosing Senior Team
    if (formData.yearOfStudy === '3rd Year' && formData.teamLevel === 'Senior Team') {
      requiredFields.push('mentoringExperience', 'contributionPlan');
    }
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const scriptURL = 'https://script.google.com/macros/s/AKfycbzY7c6ULanoXBLAV3kc1rTIiSRdCkvsNvr1kq7MibLxdjoWw_Ap-MAD5ffZv42EaPrQ-w/exec';
      
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await fetch(scriptURL, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        // Show success modal instead of toast
        setShowSuccessModal(true);
        // Reset form
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
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      alert('There was an error submitting the form. Please try again.');
      console.error('Error:', error);
    }

    setIsSubmitting(false);
  };

  const getAvailableRoles = () => {
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
  };

  const shouldShowTeamLevelSelection = () => {
    return formData.yearOfStudy === '3rd Year';
  };

  const shouldShowRoleSelection = () => {
    if (formData.yearOfStudy === '1st Year' || formData.yearOfStudy === '2nd Year') {
      return true;
    }
    if (formData.yearOfStudy === '3rd Year' && formData.teamLevel) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Successfully registered!
          </div>
        </div>
      )}
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 relative z-10 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">Thank you for applying to CSI MIET. Your application has been successfully submitted and is under review.</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium text-blue-800 mb-2">What&apos;s Next?</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Our team will review your application
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Shortlisted candidates will be contacted for the next steps
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Keep an eye on your email for updates
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CSI MIET</h1>
          <h2 className="text-xl font-semibold text-blue-600 mb-4">Membership Drive Application</h2>
          <p className="text-gray-600">Join our community of tech enthusiasts and innovators</p>
        </div>

        {/* Form */}
        <form name="submit-to-google-sheet" onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter your roll number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="classSection" className="block text-sm font-medium text-gray-700 mb-1">
                Class & Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="classSection"
                name="classSection"
                value={formData.classSection}
                onChange={handleInputChange}
                placeholder="e.g., B.Tech CSE-A"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science & Engineering, IT, ECE, etc."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="yearOfStudy" className="block text-sm font-medium text-gray-700 mb-1">
                Year of Study <span className="text-red-500">*</span>
              </label>
              <select
                id="yearOfStudy"
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              >
                <option value="" className="text-gray-800">Select Year</option>
                <option value="1st Year" className="text-gray-800">1st Year</option>
                <option value="2nd Year" className="text-gray-800">2nd Year</option>
                <option value="3rd Year" className="text-gray-800">3rd Year</option>
              </select>
            </div>
          </div>

          {/* Team Level Selection for 3rd Year */}
          {shouldShowTeamLevelSelection() && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Team Level Selection</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you want to apply as Junior Core or Senior Team? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="teamLevel"
                      value="Junior Core"
                      checked={formData.teamLevel === 'Junior Core'}
                      onChange={handleInputChange}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-800">Junior Core Team</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="teamLevel"
                      value="Senior Team"
                      checked={formData.teamLevel === 'Senior Team'}
                      onChange={handleInputChange}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-800">Senior Team</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Role Selection */}
          {shouldShowRoleSelection() && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Role Selection</h3>
              
              <div>
                <label htmlFor="selectedRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Choose Your Preferred Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="selectedRole"
                  name="selectedRole"
                  value={formData.selectedRole}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                >
                  <option value="" className="text-gray-800">Select Role</option>
                  {getAvailableRoles().map(role => (
                    <option key={role} value={role} className="text-gray-800">{role}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Application Questions - Restructured in logical order */}
          {formData.selectedRole && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Application Questions</h3>
              
              {/* 1. Motivation & Interest */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-3">Motivation & Interest</h4>
                
                <div className="mb-4">
                  <label htmlFor="motivationAndGrowth" className="block text-sm font-medium text-gray-700 mb-1">
                    What inspired you to apply for CSI MIET, and how do you see yourself growing as a part of this community? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="motivationAndGrowth"
                    name="motivationAndGrowth"
                    value={formData.motivationAndGrowth}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="expectationsFromCSI" className="block text-sm font-medium text-gray-700 mb-1">
                    What kind of learning, exposure, or experiences are you hoping to gain through CSI MIET? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="expectationsFromCSI"
                    name="expectationsFromCSI"
                    value={formData.expectationsFromCSI}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>

                <div>
                  <label htmlFor="excitingActivityAndWhy" className="block text-sm font-medium text-gray-700 mb-1">
                    Among CSI MIET&apos;s activities (Workshops, Events, Hackathons, Content, Design, Management), which excites you the most and why? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="excitingActivityAndWhy"
                    name="excitingActivityAndWhy"
                    value={formData.excitingActivityAndWhy}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    placeholder="e.g., Hackathons - because I love solving real-world problems through code..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>
              </div>

              {/* 2. Skills & Experience */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-3">Skills & Experience</h4>
                
                <div className="mb-4">
                  <label htmlFor="priorExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Do you have any prior experience in this domain? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="priorExperience"
                    name="priorExperience"
                    value={formData.priorExperience}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    What skills/tools do you bring that can help the team? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>
              </div>

              {/* 3. Commitment & Teamwork */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-3">Commitment & Teamwork</h4>
                
                <div className="mb-4">
                  <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 mb-1">
                    How much time can you dedicate per week? <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="timeCommitment"
                    name="timeCommitment"
                    value={formData.timeCommitment}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  >
                    <option value="" className="text-gray-800">Select Time Commitment</option>
                    <option value="<2 hrs" className="text-gray-800">&lt;2 hrs</option>
                    <option value="2–4 hrs" className="text-gray-800">2–4 hrs</option>
                    <option value="5–7 hrs" className="text-gray-800">5–7 hrs</option>
                    <option value="7+ hrs" className="text-gray-800">7+ hrs</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="teamWork" className="block text-sm font-medium text-gray-700 mb-1">
                    Are you comfortable working in a team environment? <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="teamWork"
                    name="teamWork"
                    value={formData.teamWork}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  >
                    <option value="" className="text-gray-800">Select Answer</option>
                    <option value="Yes" className="text-gray-800">Yes</option>
                    <option value="No" className="text-gray-800">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Junior-specific Questions */}
          {formData.selectedRole && (
            formData.yearOfStudy === '1st Year' || 
            formData.yearOfStudy === '2nd Year' || 
            (formData.yearOfStudy === '3rd Year' && formData.teamLevel === 'Junior Core')
          ) && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-3">Additional Questions for Juniors</h4>
                
                <div>
                  <label htmlFor="personalProject" className="block text-sm font-medium text-gray-700 mb-1">
                    Have you ever worked on a small project (school/college/personal)? If yes, tell us briefly. <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="personalProject"
                    name="personalProject"
                    value={formData.personalProject}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    placeholder="e.g., Created a personal portfolio website using HTML/CSS, or built a simple calculator app..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Senior-specific Questions - Leadership */}
          {formData.selectedRole && formData.yearOfStudy === '3rd Year' && formData.teamLevel === 'Senior Team' && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-3">Leadership Questions</h4>
                
                <div className="mb-4">
                  <label htmlFor="mentoringExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Have you mentored or guided juniors before? If yes, share an example. <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="mentoringExperience"
                    name="mentoringExperience"
                    value={formData.mentoringExperience}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    placeholder="e.g., Helped junior students with programming concepts during lab sessions, led a study group..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>

                <div>
                  <label htmlFor="contributionPlan" className="block text-sm font-medium text-gray-700 mb-1">
                    If selected, how would you contribute to CSI MIET in the next 3 months? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contributionPlan"
                    name="contributionPlan"
                    value={formData.contributionPlan}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    placeholder="e.g., Plan to organize 2 technical workshops, establish mentorship programs for juniors..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              } text-white focus:outline-none`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
