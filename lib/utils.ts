export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return '0.0.0.0';
}

export function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}
