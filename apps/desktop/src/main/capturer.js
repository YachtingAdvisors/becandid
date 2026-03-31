/**
 * Screen capture with change detection.
 *
 * Takes periodic screenshots of the primary display,
 * compares with the previous capture using pixel-diff,
 * and sends to the server for AI analysis if changed.
 */

const { desktopCapturer, screen } = require('electron');
const { store, resetDailyStats } = require('./store');
const { uploadCapture } = require('./uploader');

let previousThumbnail = null; // NativeImage, 320x180 for diff
let captureTimer = null;
let paused = false;

/**
 * Start the capture loop.
 */
function startCapturing() {
  stopCapturing();
  const intervalMs = (store.get('interval_minutes') || 5) * 60 * 1000;
  captureTimer = setInterval(captureOnce, intervalMs);
  console.log(`[capturer] Started — every ${store.get('interval_minutes')} min`);
}

/**
 * Stop the capture loop.
 */
function stopCapturing() {
  if (captureTimer) {
    clearInterval(captureTimer);
    captureTimer = null;
  }
}

/**
 * Pause/resume (e.g., when system is idle or locked).
 */
function setPaused(value) {
  paused = value;
  console.log(`[capturer] ${paused ? 'Paused' : 'Resumed'}`);
}

/**
 * Perform a single capture cycle.
 */
async function captureOnce() {
  if (paused || !store.get('monitoring_enabled')) return;

  try {
    resetDailyStats();

    // Get primary display screenshot
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1280, height: 800 },
    });

    if (!sources || sources.length === 0) {
      console.log('[capturer] No screen sources available');
      return;
    }

    const primarySource = sources[0];
    const screenshot = primarySource.thumbnail; // NativeImage

    if (screenshot.isEmpty()) {
      console.log('[capturer] Empty screenshot, skipping');
      return;
    }

    // Change detection: resize to tiny thumbnail and compare
    const thumbnail = screenshot.resize({ width: 320, height: 180 });
    const changePercent = computeChange(thumbnail);

    const threshold = store.get('change_threshold') || 0.10;
    if (changePercent < threshold) {
      console.log(`[capturer] No significant change (${(changePercent * 100).toFixed(1)}%), skipping`);
      return;
    }

    console.log(`[capturer] Change detected (${(changePercent * 100).toFixed(1)}%), uploading...`);
    previousThumbnail = thumbnail;

    // Compress to JPEG and convert to base64
    const jpegBuffer = screenshot.toJPEG(60);
    const base64 = jpegBuffer.toString('base64');

    // Upload for analysis
    const result = await uploadCapture(base64);

    // Update stats
    store.set('captures_today', (store.get('captures_today') || 0) + 1);
    store.set('last_capture_at', new Date().toISOString());

    if (result?.event_id) {
      store.set('flagged_today', (store.get('flagged_today') || 0) + 1);
      console.log(`[capturer] Flagged: ${result.categories?.join(', ')} (${result.severity})`);
    }
  } catch (err) {
    console.error('[capturer] Capture failed:', err.message);
  }
}

/**
 * Fast pixel-diff between current thumbnail and previous.
 * Returns a 0-1 float representing the percentage of changed pixels.
 */
function computeChange(currentThumbnail) {
  if (!previousThumbnail) {
    previousThumbnail = currentThumbnail;
    return 1.0; // First capture always counts as "changed"
  }

  try {
    const currentBmp = currentThumbnail.toBitmap();
    const previousBmp = previousThumbnail.toBitmap();

    if (currentBmp.length !== previousBmp.length) {
      return 1.0; // Different sizes = changed
    }

    const pixelCount = currentBmp.length / 4; // RGBA
    let diffCount = 0;
    const tolerance = 30; // Out of 255

    for (let i = 0; i < currentBmp.length; i += 4) {
      const dr = Math.abs(currentBmp[i] - previousBmp[i]);
      const dg = Math.abs(currentBmp[i + 1] - previousBmp[i + 1]);
      const db = Math.abs(currentBmp[i + 2] - previousBmp[i + 2]);

      if (dr > tolerance || dg > tolerance || db > tolerance) {
        diffCount++;
      }
    }

    return diffCount / pixelCount;
  } catch {
    return 1.0; // On error, assume changed
  }
}

/**
 * Get current capture stats for tray display.
 */
function getCaptureStats() {
  resetDailyStats();
  return {
    captures_today: store.get('captures_today') || 0,
    flagged_today: store.get('flagged_today') || 0,
    last_capture_at: store.get('last_capture_at'),
    monitoring: store.get('monitoring_enabled') && !paused,
    interval_minutes: store.get('interval_minutes') || 5,
  };
}

module.exports = { startCapturing, stopCapturing, setPaused, captureOnce, getCaptureStats };
