import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://script.google.com https://www.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://script.google.com https://script.googleusercontent.com; " +
    "frame-src https://www.google.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  return response;
}

export function validateInput(input: string, type: 'text' | 'email' | 'number' = 'text'): { valid: boolean; sanitized: string; error?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, sanitized: '', error: 'Input is required' };
  }

  let sanitized = input.trim();
  
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Input cannot be empty' };
  }

  if (sanitized.length > 10000) {
    return { valid: false, sanitized: '', error: 'Input too long' };
  }

  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onclick=/gi,
    /onmouseover=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<form[^>]*>/gi,
    /data:text\/html/gi,
    /eval\(/gi,
    /expression\(/gi
  ];

  const containsDangerousContent = dangerousPatterns.some(pattern => pattern.test(sanitized));
  if (containsDangerousContent) {
    return { valid: false, sanitized: '', error: 'Invalid characters detected' };
  }

  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized.replace(/&[^;]+;/g, ''))) {
      return { valid: false, sanitized: '', error: 'Invalid email format' };
    }
  }

  if (type === 'number') {
    const numberRegex = /^[0-9]+$/;
    if (!numberRegex.test(sanitized)) {
      return { valid: false, sanitized: '', error: 'Invalid number format' };
    }
  }

  return { valid: true, sanitized };
}

export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/gi,
    /(\bor\b|\band\b).*(\b=\b|\blike\b)/gi,
    /1\s*=\s*1/gi,
    /'\s*or\s*'.*'=/gi
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /data:text\/html/gi,
    /eval\s*\(/gi,
    /document\.(write|writeln|cookie)/gi,
    /window\.(location|open)/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

export class SecurityMonitor {
  private static suspiciousActivity: Map<string, number> = new Map();
  private static blockedIPs: Set<string> = new Set();

  static trackSuspiciousActivity(ip: string, type: string) {
    const key = `${ip}:${type}`;
    const count = this.suspiciousActivity.get(key) || 0;
    this.suspiciousActivity.set(key, count + 1);

    if (count > 5) {
      this.blockedIPs.add(ip);
      console.warn(`IP ${ip} blocked for suspicious activity: ${type}`);
    }
  }

  static isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  static unblockIP(ip: string) {
    this.blockedIPs.delete(ip);
    const keysToDelete = Array.from(this.suspiciousActivity.keys()).filter(key => key.startsWith(ip));
    keysToDelete.forEach(key => this.suspiciousActivity.delete(key));
  }

  static getStats() {
    return {
      suspiciousActivities: this.suspiciousActivity.size,
      blockedIPs: this.blockedIPs.size,
      blockedIPsList: Array.from(this.blockedIPs)
    };
  }
}