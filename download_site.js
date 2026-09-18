const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const BASE_URL = 'https://www.cyber.gov.au/';
const OUT_DIR  = 'D:\\DocumentPortal\\cybersite';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function fetch(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsed.hostname,
      path: parsed.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
      },
      timeout: 30000,
    };
    const req = lib.get(opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function downloadAsset(assetUrl, refBase) {
  try {
    const resolved = new URL(assetUrl, refBase).toString();
    if (!resolved.startsWith('http')) return null;

    const parsed   = new URL(resolved);
    let   filePath = parsed.pathname.replace(/^\//, '').replace(/\//g, path.sep);
    if (!filePath) filePath = 'index.html';

    const localPath = path.join(OUT_DIR, filePath);
    const dir       = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(localPath)) return { resolved, localPath };

    console.log('Downloading:', resolved);
    const res = await fetch(resolved);
    if (res.status === 200) {
      fs.writeFileSync(localPath, res.body);
      return { resolved, localPath, content: res.body.toString() };
    }
    return null;
  } catch (e) {
    console.error('Failed asset:', assetUrl, e.message);
    return null;
  }
}

(async () => {
  try {
    console.log('Fetching main page...');
    const res = await fetch(BASE_URL);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers['content-type']);

    const html = res.body.toString('utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'index_raw.html'), html);
    console.log('Raw HTML saved. Length:', html.length);

    // Extract all CSS links
    const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)]
      .map(m => m[1]);
    const cssLinks2 = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi)]
      .map(m => m[1]);
    
    // Extract all script sources
    const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
      .map(m => m[1]);
    
    // Extract images
    const images = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
      .map(m => m[1]);

    const allCss = [...new Set([...cssLinks, ...cssLinks2])];
    console.log('\nCSS files found:', allCss.length);
    allCss.forEach(c => console.log('  CSS:', c));
    
    console.log('\nScripts found:', scripts.length);
    scripts.slice(0,10).forEach(s => console.log('  JS:', s));
    
    console.log('\nImages found:', images.length);
    images.slice(0,10).forEach(i => console.log('  IMG:', i));

    // Download CSS files
    console.log('\nDownloading CSS...');
    for (const cssUrl of allCss) {
      await downloadAsset(cssUrl, BASE_URL);
    }

    // Download key scripts
    console.log('\nDownloading scripts...');
    for (const jsUrl of scripts.slice(0,15)) {
      await downloadAsset(jsUrl, BASE_URL);
    }

    // Download images
    console.log('\nDownloading images...');
    for (const imgUrl of images.slice(0,20)) {
      await downloadAsset(imgUrl, BASE_URL);
    }

    // Also look for data-src, background images in style attrs
    const dataSrc = [...html.matchAll(/data-src=["']([^"']+)["']/gi)].map(m=>m[1]);
    const bgImgs  = [...html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)].map(m=>m[1]).filter(u=>!u.startsWith('data:'));
    
    console.log('\nData-src images:', dataSrc.length);
    console.log('Background images:', bgImgs.slice(0,5));

    // Save summary
    const summary = {
      status: res.status,
      htmlLength: html.length,
      cssFiles: allCss,
      scripts: scripts,
      images: images,
      dataSrcImages: dataSrc,
      bgImages: bgImgs,
    };
    fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log('\nSummary saved to summary.json');
    console.log('\n=== FIRST 100 LINES OF HTML ===');
    html.split('\n').slice(0, 100).forEach((line, i) => console.log(i+1, line));

  } catch (e) {
    console.error('FATAL ERROR:', e.message, e.stack);
  }
})();
