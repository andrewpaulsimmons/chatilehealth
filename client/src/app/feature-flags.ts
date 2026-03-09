// Feature flags for Chatile Health / ChatNav demo
// Flip these to control demo behavior without touching component code.

export const FEATURE_FLAGS = {
  /**
   * AUTO_DEMO
   * When true:
   *   - The "Run Demo" badge in the bottom-right corner is hidden.
   *   - The full ChatNav typing demo auto-starts 2 seconds after page load.
   * When false (default):
   *   - The badge is visible and the demo only runs when the user clicks it.
   *
   * Can also be activated via URL param: ?autoDemo=true
   */
  AUTO_DEMO: false,
};