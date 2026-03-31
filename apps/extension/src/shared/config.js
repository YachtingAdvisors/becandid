// Be Candid Extension Configuration
export const CONFIG = {
  API_URL: 'https://becandid.io',
  SUPABASE_URL: 'https://kiowvsemdxivuyzifmdn.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpb3d2c2VtZHhpdnV5emlmbWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NDU0NTksImV4cCI6MjA5MDMyMTQ1OX0.ffdjnAwdyvRBeOUb1S8MAbX3XTsX31xyApJTiQ-vEOs',
  FLUSH_INTERVAL_MINUTES: 5,
  MAX_QUEUE_SIZE: 100,
  AGGREGATION_WINDOW_MS: 30 * 60 * 1000, // 30 minutes
  MIN_DURATION_SECONDS: 3, // Minimum time on a domain to track
};

// Internal Chrome URLs to skip
export const SKIP_PROTOCOLS = [
  'chrome://', 'chrome-extension://', 'about:', 'moz-extension://',
  'file://', 'devtools://', 'edge://', 'brave://',
];
