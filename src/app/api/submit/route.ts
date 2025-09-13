import { NextRequest, NextResponse } from 'next/server';
import { validateInput, detectSQLInjection, detectXSS, SecurityMonitor } from '../../../middleware/security';

interface FormData {
  fullName: string;
  rollNumber: string;
  classSection: string;
  branch: string;
  email: string;
  yearOfStudy: string;
  teamLevel?: string;
  selectedRole: string;
  motivationAndGrowth: string;
  expectationsFromCSI: string;
  excitingActivityAndWhy: string;
  priorExperience: string;
  skills: string;
  personalProject?: string;
  timeCommitment: string;
  teamWork: string;
  mentoringExperience?: string;
  contributionPlan?: string;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  if (cfIP) return cfIP;
  return 'unknown';
}


function validateFormData(data: Record<string, unknown>): { valid: boolean; errors: string[]; sanitizedData?: FormData } {
  const errors: string[] = [];
  const sanitizedData: Record<string, unknown> = {};

  const requiredFields = [
    { key: 'fullName', type: 'text' as const, maxLength: 100 },
    { key: 'rollNumber', type: 'number' as const, maxLength: 15 },
    { key: 'classSection', type: 'text' as const, maxLength: 50 },
    { key: 'branch', type: 'text' as const, maxLength: 100 },
    { key: 'email', type: 'text' as const, maxLength: 100 },
    { key: 'yearOfStudy', type: 'text' as const, maxLength: 20 },
    { key: 'selectedRole', type: 'text' as const, maxLength: 100 },
    { key: 'motivationAndGrowth', type: 'text' as const, maxLength: 2000 },
    { key: 'expectationsFromCSI', type: 'text' as const, maxLength: 2000 },
    { key: 'excitingActivityAndWhy', type: 'text' as const, maxLength: 2000 },
    { key: 'priorExperience', type: 'text' as const, maxLength: 2000 },
    { key: 'skills', type: 'text' as const, maxLength: 2000 },
    { key: 'timeCommitment', type: 'text' as const, maxLength: 50 },
    { key: 'teamWork', type: 'text' as const, maxLength: 10 }
  ];

  const optionalFields = [
    { key: 'teamLevel', type: 'text' as const, maxLength: 50 },
    { key: 'personalProject', type: 'text' as const, maxLength: 2000 },
    { key: 'mentoringExperience', type: 'text' as const, maxLength: 2000 },
    { key: 'contributionPlan', type: 'text' as const, maxLength: 2000 }
  ];

  for (const field of requiredFields) {
    const value = data[field.key];
    if (!value) {
      errors.push(`${field.key} is required`);
      continue;
    }

    // Convert number inputs to string for validation
    let stringValue: string;
    if (field.type === 'number' && typeof value === 'number') {
      stringValue = value.toString();
    } else if (typeof value === 'string') {
      stringValue = value;
    } else {
      errors.push(`${field.key} must be a ${field.type === 'number' ? 'number' : 'string'}`);
      continue;
    }

    if (stringValue.length > field.maxLength) {
      errors.push(`${field.key} exceeds maximum length of ${field.maxLength}`);
      continue;
    }

    if (detectSQLInjection(stringValue)) {
      errors.push(`${field.key} contains potentially malicious content`);
      continue;
    }

    if (detectXSS(stringValue)) {
      errors.push(`${field.key} contains potentially harmful scripts`);
      continue;
    }

    const validation = validateInput(stringValue, field.type);
    if (!validation.valid) {
      errors.push(`${field.key}: ${validation.error}`);
      continue;
    }

    sanitizedData[field.key] = validation.sanitized;
  }

  for (const field of optionalFields) {
    const value = data[field.key];
    if (value && typeof value === 'string') {
      if (value.length > field.maxLength) {
        errors.push(`${field.key} exceeds maximum length of ${field.maxLength}`);
        continue;
      }

      if (detectSQLInjection(value) || detectXSS(value)) {
        errors.push(`${field.key} contains potentially malicious content`);
        continue;
      }

      const validation = validateInput(value, field.type);
      if (validation.valid) {
        sanitizedData[field.key] = validation.sanitized;
      }
    }
  }

  const validYears = ['1st Year', '2nd Year', '3rd Year'];
  if (!validYears.includes(sanitizedData.yearOfStudy as string)) {
    errors.push('Invalid year of study');
  }

  const validTimeCommitments = ['Less than 2 hours', '2-4 hours', '5-7 hours', '7+ hours'];
  if (!validTimeCommitments.includes(sanitizedData.timeCommitment as string)) {
    errors.push('Invalid time commitment');
  }

  const validTeamWork = ['Yes', 'No'];
  if (!validTeamWork.includes(sanitizedData.teamWork as string)) {
    errors.push('Invalid team work preference');
  }

  if (sanitizedData.yearOfStudy === '3rd Year' && !sanitizedData.teamLevel) {
    errors.push('Team level is required for 3rd year students');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData as unknown as FormData : undefined
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown>;

    if (contentType.includes('application/json')) {
      body = await request.json();
      console.log('Received JSON body:', body);
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = {};
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
      console.log('Received form data:', body);
    } else {
      console.log('Unsupported content type:', contentType);
      return NextResponse.json(
        { error: 'Unsupported content type', code: 'INVALID_CONTENT_TYPE' },
        { status: 400 }
      );
    }

    const validation = validateFormData(body);
    if (!validation.valid) {
      SecurityMonitor.trackSuspiciousActivity(ip, 'invalid_form_data');
      console.log('Validation failed:', validation.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const honeypotField = body._honeypot || body.website;
    if (honeypotField && typeof honeypotField === 'string' && honeypotField.trim() !== '') {
      SecurityMonitor.trackSuspiciousActivity(ip, 'honeypot_triggered');
      console.warn(`Bot detected from ${ip}: honeypot field filled`);
      return NextResponse.json(
        { error: 'Spam detected', code: 'SPAM_DETECTED' },
        { status: 429 }
      );
    }

    const userAgent = request.headers.get('user-agent') || '';
    if (!userAgent || userAgent.length < 10) {
      SecurityMonitor.trackSuspiciousActivity(ip, 'suspicious_user_agent');
      return NextResponse.json(
        { error: 'Invalid request', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }


    const scriptURL = process.env.GOOGLE_SHEETS_SCRIPT_URL;
    
    if (!scriptURL) {
      console.error('GOOGLE_SHEETS_SCRIPT_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error', code: 'CONFIG_ERROR' },
        { status: 500 }
      );
    }
    
    const formDataToSend = new FormData();
    Object.entries(validation.sanitizedData!).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSend.append(key, value.toString());
      }
    });

    formDataToSend.append('submissionIP', ip);
    formDataToSend.append('submissionTime', new Date().toISOString());
    formDataToSend.append('userAgent', userAgent);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formDataToSend,
      signal: controller.signal,
      headers: {
        'User-Agent': 'CSI-MIET-Form/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Sheets API returned ${response.status}`);
    }

    console.log(`Successful form submission from ${ip}`);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      submissionId: Date.now().toString(36)
    });

  } catch (error: unknown) {
    console.error('Form submission error:', error);
    SecurityMonitor.trackSuspiciousActivity(ip, 'submission_error');

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout', code: 'TIMEOUT' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Submission failed. Please try again later.', code: 'SUBMISSION_ERROR' },
      { status: 500 }
    );
  }
}