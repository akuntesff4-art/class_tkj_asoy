/**
 * Vercel Speed Insights Initialization
 * 
 * This script loads and initializes Vercel Speed Insights for performance monitoring.
 * The Speed Insights SDK automatically tracks web vitals and other performance metrics.
 * 
 * Note: Speed Insights only tracks data in production mode when deployed to Vercel.
 * No data is collected in development mode.
 */

(async function initSpeedInsights() {
  try {
    // Dynamically import the Speed Insights module
    const { injectSpeedInsights } = await import('./speed-insights.mjs');
    
    // Initialize Speed Insights
    // The injectSpeedInsights function will automatically:
    // - Load the Speed Insights tracking script
    // - Start monitoring web vitals (LCP, FID, CLS, etc.)
    // - Send performance data to Vercel when deployed
    injectSpeedInsights({
      debug: false, // Set to true to see debug logs in development
    });
    
    console.log('[Speed Insights] Initialized successfully');
  } catch (error) {
    // Gracefully handle any errors to prevent breaking the page
    console.warn('[Speed Insights] Failed to initialize:', error);
  }
})();
