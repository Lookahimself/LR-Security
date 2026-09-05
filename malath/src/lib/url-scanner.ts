import { UrlScanResult } from '../types';

export class UrlScanner {
  /**
   * Safely parse and normalize a URL
   */
  private static parseUrl(urlStr: string): URL | null {
    try {
      // Normalize protocol-less URLs to https for parsing (will check scheme later)
      let normalizedStr = urlStr.trim();
      if (!normalizedStr.startsWith('http://') && !normalizedStr.startsWith('https://')) {
        normalizedStr = `https://${normalizedStr}`;
      }
      return new URL(normalizedStr);
    } catch {
      return null;
    }
  }

  /**
   * Check for suspicious domain heuristics
   */
  private static getSuspiciousDomainSignals(url: URL): string[] {
    const signals: string[] = [];
    const hostname = url.hostname;

    // Check for loopback, localhost, and internal IPs
    if (
      hostname === 'localhost' || 
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      hostname === '[::1]'
    ) {
      signals.push('internal_or_loopback_address');
    }

    // Check for cloud metadata IPs
    if (hostname === '169.254.169.254' || hostname === '[fd00:ec2::254]') {
      signals.push('cloud_metadata_address');
    }

    // Check for excessive subdomains
    const parts = hostname.split('.');
    if (parts.length > 4) {
      signals.push('excessive_subdomains');
    }

    // Check for IP address instead of domain
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');
    if (isIp) {
      signals.push('ip_based_destination');
    }

    // Check for common lookalike characters (Punycode/IDN)
    if (hostname.includes('xn--')) {
      signals.push('punycode_domain');
    }
    
    // Check for unusual ports
    if (url.port && !['80', '443'].includes(url.port)) {
      signals.push('unusual_port');
    }

    return signals;
  }

  /**
   * Basic URL scanning logic
   * In a full production system, this would integrate with Google Safe Browsing / Web Risk
   */
  static async scanUrl(urlStr: string): Promise<UrlScanResult> {
    const url = this.parseUrl(urlStr);
    
    if (!url) {
      return {
        risk_level: 'high',
        confidence: 'high',
        domain: urlStr,
        normalized_url: urlStr,
        redirects: [],
        signals: ['invalid_url_format'],
        threat_intelligence: [],
        explanation: 'الرابط غير صالح أو بتنسيق غير معروف.',
        limitations: 'Could not parse URL.'
      };
    }

    // Check Scheme
    if (!['http:', 'https:'].includes(url.protocol)) {
       return {
        risk_level: 'high',
        confidence: 'high',
        domain: url.hostname,
        normalized_url: url.href,
        redirects: [],
        signals: ['unsupported_scheme', `scheme:${url.protocol}`],
        threat_intelligence: [],
        explanation: 'الرابط يستخدم بروتوكول غير مدعوم وقد يكون غير آمن.',
      };
    }

    const signals = this.getSuspiciousDomainSignals(url);

    // Strict SSRF / Internal Network Prevention
    if (signals.includes('internal_or_loopback_address') || signals.includes('cloud_metadata_address')) {
      return {
        risk_level: 'critical',
        confidence: 'high',
        domain: url.hostname,
        normalized_url: url.href,
        redirects: [],
        signals,
        threat_intelligence: [],
        explanation: 'الرابط يشير إلى عنوان شبكة داخلي أو محلي، وهو مؤشر على محاولة اختراق أو هجوم (SSRF). لا ينبغي التفاعل مع هذا الرابط.',
      };
    }
    
    // If no HTTPS
    if (url.protocol === 'http:') {
      signals.push('unencrypted_http');
    }

    // Determine basic risk level based on heuristics
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let explanation = 'لا توجد مؤشرات عالية الخطورة، ولكن هذا لا يضمن أن الموقع آمن تماماً.';
    
    if (signals.includes('ip_based_destination') || signals.length > 2) {
      riskLevel = 'high';
      explanation = 'يحتوي الرابط على مؤشرات مريبة عالية الخطورة مثل استخدام عنوان IP مباشر أو تنسيق غير معتاد.';
    } else if (signals.length > 0) {
      riskLevel = 'medium';
      explanation = 'يحتوي الرابط على بعض المؤشرات المريبة.';
    }

    // Mock threat intel for MVP. 
    // TODO: Integrate real threat intel API here (e.g. Google Web Risk)
    // using safe backend-to-backend fetch.
    const threatIntel: string[] = [];

    return {
      risk_level: riskLevel,
      confidence: 'medium',
      domain: url.hostname,
      normalized_url: url.href,
      redirects: [], // Requires backend crawling to resolve
      signals,
      threat_intelligence: threatIntel,
      explanation,
    };
  }
}
