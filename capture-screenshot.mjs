import { chromium } from 'playwright';

async function captureScreenshot() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1200 },
    deviceScaleFactor: 2, // For high-DPI/retina display
  });
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to http://localhost:3003...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });

    // Wait for the search input to be visible
    console.log('Waiting for search input...');
    await page.waitForSelector('input[type="text"], input[placeholder*="search" i], textarea', { timeout: 10000 });

    // Find and fill the search input
    console.log('Filling search query...');
    const searchInput = await page.locator('input[type="text"], input[placeholder*="search" i], textarea').first();
    await searchInput.fill('a melancholic film about memory set in Eastern Europe');

    // Submit the search (look for submit button or press Enter)
    console.log('Submitting search...');
    await searchInput.press('Enter');

    // Wait for results to load (look for movie grid or results container)
    console.log('Waiting for results...');
    await page.waitForTimeout(5000); // Give time for API call and rendering

    // Wait for movie results to appear (adjust selector based on actual app structure)
    try {
      await page.waitForSelector('img[alt*="poster" i], img[src*="image.tmdb" i], div[class*="movie" i], div[class*="card" i], div[class*="grid" i]', { timeout: 15000 });
      console.log('Movie results found!');
    } catch (e) {
      console.log('Could not find specific movie elements, proceeding with screenshot anyway...');
    }

    // Additional wait to ensure all images are loaded
    await page.waitForTimeout(4000);

    // Wait for network to be idle to ensure all images loaded
    await page.waitForLoadState('networkidle');

    // Scroll down just enough to show movie results while keeping header visible
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(1000);

    // Take screenshot
    console.log('Capturing screenshot...');
    const screenshotPath = '/tmp/cinema-query.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: false, // Capture viewport only
    });

    console.log(`Screenshot saved to: ${screenshotPath}`);
    return screenshotPath;

  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureScreenshot().catch(console.error);
