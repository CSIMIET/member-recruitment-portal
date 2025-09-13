import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, createRateLimitResponse } from './src/middleware/rateLimiter';
import { addSecurityHeaders, SecurityMonitor } from './src/middleware/security';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) return realIP;
  if (cfIP) return cfIP;
  
  return 'unknown';
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const path = request.nextUrl.pathname;
  
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|python|php/i,
    /sql|script|alert|eval/i
  ];
  
  const suspiciousPaths = [
    /\/wp-/i,
    /\/admin/i,
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\/config/i,
    /\/api\/(?!submit)/i
  ];

  const hasSuspiciousUA = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const hasSuspiciousPath = suspiciousPaths.some(pattern => pattern.test(path));

  return hasSuspiciousUA || hasSuspiciousPath || userAgent === '';
}

export function middleware(request: NextRequest) {
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;

  if (SecurityMonitor.isBlocked(ip)) {
    return new Response('Access denied', { status: 403 });
  }

  if (isSuspiciousRequest(request)) {
    SecurityMonitor.trackSuspiciousActivity(ip, 'suspicious_request');
    console.warn(`Suspicious request from ${ip}: ${path}`);
  }

  if (path === '/api/submit' && request.method === 'POST') {
    const rateCheck = rateLimiter.checkRateLimit(request, 'form');
    if (!rateCheck.allowed) {
      SecurityMonitor.trackSuspiciousActivity(ip, 'rate_limit_exceeded');
      return createRateLimitResponse(rateCheck.message!, rateCheck.retryAfter);
    }
  } else {
    const rateCheck = rateLimiter.checkRateLimit(request, 'general');
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.message!, rateCheck.retryAfter);
    }
  }

  const response = NextResponse.next();
  
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    '/api/:path*'
  ]
};