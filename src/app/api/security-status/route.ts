import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '../../../middleware/rateLimiter';
import { SecurityMonitor } from '../../../middleware/security';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  const expectedToken = process.env.SECURITY_STATUS_TOKEN;
  
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const rateLimiterStats = rateLimiter.getStats();
    const securityMonitorStats = SecurityMonitor.getStats();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      rateLimiter: rateLimiterStats,
      securityMonitor: securityMonitorStats,
      status: 'operational'
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error', status: 'error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  const expectedToken = process.env.SECURITY_STATUS_TOKEN;
  
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, ip } = body;

    if (action === 'unblock' && ip) {
      rateLimiter.unblockIP(ip);
      SecurityMonitor.unblockIP(ip);
      
      return NextResponse.json({
        success: true,
        message: `IP ${ip} has been unblocked`,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'block' && ip) {
      rateLimiter.manuallyBlockIP(ip);
      
      return NextResponse.json({
        success: true,
        message: `IP ${ip} has been blocked`,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'cleanup') {
      rateLimiter.cleanup();
      
      return NextResponse.json({
        success: true,
        message: 'Cleanup completed',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}