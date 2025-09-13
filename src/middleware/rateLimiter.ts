interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpiry?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
  message: string;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private blockedIPs: Set<string> = new Set();
  
  private configs = {
    form: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 3, // 3 form submissions per 15 minutes
      blockDuration: 60 * 60 * 1000, // 1 hour block
      message: 'Too many form submissions. Please try again later.'
    },
    general: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // 30 requests per minute
      blockDuration: 5 * 60 * 1000, // 5 minute block
      message: 'Rate limit exceeded. Please slow down.'
    }
  };

  private getClientIP(request: Request): string {
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

  private isIPBlocked(ip: string): boolean {
    const entry = this.requests.get(ip);
    if (entry?.blocked && entry.blockExpiry && Date.now() < entry.blockExpiry) {
      return true;
    }
    
    if (entry?.blocked && entry.blockExpiry && Date.now() >= entry.blockExpiry) {
      entry.blocked = false;
      entry.blockExpiry = undefined;
      entry.count = 0;
    }
    
    return this.blockedIPs.has(ip);
  }

  private blockIP(ip: string, duration: number) {
    const entry = this.requests.get(ip) || { count: 0, resetTime: Date.now(), blocked: false };
    entry.blocked = true;
    entry.blockExpiry = Date.now() + duration;
    this.requests.set(ip, entry);
    this.blockedIPs.add(ip);
    
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, duration);
  }

  public checkRateLimit(request: Request, type: 'form' | 'general' = 'general'): { allowed: boolean; message?: string; retryAfter?: number } {
    const ip = this.getClientIP(request);
    const config = this.configs[type];
    const now = Date.now();
    
    if (this.isIPBlocked(ip)) {
      const entry = this.requests.get(ip);
      const retryAfter = entry?.blockExpiry ? Math.ceil((entry.blockExpiry - now) / 1000) : 300;
      return {
        allowed: false,
        message: 'IP temporarily blocked due to excessive requests',
        retryAfter
      };
    }

    let entry = this.requests.get(ip);
    
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false
      };
      this.requests.set(ip, entry);
      return { allowed: true };
    }

    entry.count++;
    
    if (entry.count > config.maxRequests) {
      this.blockIP(ip, config.blockDuration);
      return {
        allowed: false,
        message: config.message,
        retryAfter: Math.ceil(config.blockDuration / 1000)
      };
    }

    return { allowed: true };
  }

  public manuallyBlockIP(ip: string, duration: number = 24 * 60 * 60 * 1000) {
    this.blockIP(ip, duration);
  }

  public unblockIP(ip: string) {
    this.blockedIPs.delete(ip);
    const entry = this.requests.get(ip);
    if (entry) {
      entry.blocked = false;
      entry.blockExpiry = undefined;
    }
  }

  public getStats() {
    return {
      activeConnections: this.requests.size,
      blockedIPs: this.blockedIPs.size,
      blockedIPsList: Array.from(this.blockedIPs)
    };
  }

  public cleanup() {
    const now = Date.now();
    for (const [ip, entry] of this.requests.entries()) {
      if (now > entry.resetTime && !entry.blocked) {
        this.requests.delete(ip);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

export function createRateLimitResponse(message: string, retryAfter?: number) {
  return new Response(JSON.stringify({ error: message, retryAfter }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': retryAfter?.toString() || '60',
      'X-RateLimit-Blocked': 'true'
    }
  });
}