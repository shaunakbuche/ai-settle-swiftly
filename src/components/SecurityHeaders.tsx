import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Add security headers via meta tags for CSP
    const addMetaTag = (name: string, content: string) => {
      const existingTag = document.querySelector(`meta[http-equiv="${name}"]`);
      if (!existingTag) {
        const meta = document.createElement('meta');
        meta.httpEquiv = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Content Security Policy - Enhanced security
    addMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' https://js.stripe.com; " +
      "style-src 'self' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://gffhkotvbwcsvchfieoa.supabase.co https://api.stripe.com; " +
      "frame-src https://js.stripe.com https://hooks.stripe.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );

    // X-Frame-Options
    addMetaTag('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    addMetaTag('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
  }, []);

  return null;
};