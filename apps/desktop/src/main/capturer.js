/**
 * Screen capture with change detection and randomized timing.
 *
 * Takes screenshots at random intervals within a 2-minute window,
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
 * Schedule the next capture at a random time within the interval window.
 * E.g., for a 2-minute window, capture happens at a random second between 0-120.
 */
function scheduleNext() {
  if (captureTimer) clearTimeout(captureTimer);
  const windowMs = 2 * 60 * 1000; // 2-minute window
  const randomDelay = Math.floor(Math.random() * windowMs);
  captureTimer = setTimeout(async () => {
    await captureOnce();
    scheduleNext(); // Schedule the next random capture
  }, randomDelay);
}

/**
 * Start the capture loop.
 */
function startCapturing() {
  stopCapturing();
  scheduleNext();
  console.log('[capturer] Started — random intervals within 2-min windows');
}

/**
 * Stop the capture loop.
 */
function stopCapturing() {
  if (captureTimer) {
    clearTimeout(captureTimer);
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

    // Collect metadata for the pre-classifier (avoids expensive Vision API calls)
    const metadata = {
      activeApp: primarySource.name || 'Unknown',
      windowTitle: primarySource.name || undefined,
      timestamp: new Date().toISOString(),
      screenChanged: true,
    };

    // Upload for analysis with metadata
    const result = await uploadCapture(base64, metadata);

    // Update stats
    store.set('heartbeats_today', (store.get('heartbeats_today') || 0) + 1);
    store.set('last_heartbeat_capture', new Date().toISOString());

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
 * Get current stats for tray display.
 */
function getCaptureStats() {
  resetDailyStats();
  return {
    heartbeats_today: store.get('heartbeats_today') || 0,
    flagged_today: store.get('flagged_today') || 0,
    last_heartbeat_capture: store.get('last_heartbeat_capture'),
    monitoring: store.get('monitoring_enabled') && !paused,
  };
}

module.exports = { startCapturing, stopCapturing, setPaused, captureOnce, getCaptureStats };
