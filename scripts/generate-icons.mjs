#!/usr/bin/env zx

import 'zx/globals';
import sharp from 'sharp';
import png2icons from 'png2icons';
import { fileURLToPath } from 'url';

// Calculate paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(PROJECT_ROOT, 'resources', 'icons');
const APP_ICON_SOURCE = path.join(PROJECT_ROOT, 'App_Icon.png');
const LOGO_SOURCE = path.join(PROJECT_ROOT, 'Logo.png');
const SVG_SOURCE = path.join(ICONS_DIR, 'icon.svg');
const LOGO_OUTPUT = path.join(PROJECT_ROOT, 'src', 'assets', 'logo.png');

echo`🎨 Generating 开放龙虾宝-桌面版 icons...`;

// Resolve app icon source: prefer App_Icon.png from root, fallback to icon.svg
let appIconSource = null;
if (fs.existsSync(APP_ICON_SOURCE)) {
  appIconSource = APP_ICON_SOURCE;
  echo`  Using App_Icon.png from project root`;
} else if (fs.existsSync(SVG_SOURCE)) {
  appIconSource = SVG_SOURCE;
  echo`  Using icon.svg (App_Icon.png not found in root)`;
}

if (!appIconSource) {
  echo(chalk.red`❌ No icon source found. Place App_Icon.png in project root or ensure resources/icons/icon.svg exists.`);
  process.exit(1);
}

// Ensure icons directory exists
await fs.ensureDir(ICONS_DIR);

try {
  // 1. Generate Master PNG Buffer (1024x1024)
  echo`  Processing app icon source...`;
  const masterPngBuffer = await sharp(appIconSource)
    .resize(1024, 1024)
    .png()
    .toBuffer();

  // Save the main icon.png (typically 512x512 for Electron root icon)
  await sharp(masterPngBuffer)
    .resize(512, 512)
    .toFile(path.join(ICONS_DIR, 'icon.png'));
  echo`  ✅ Created icon.png (512x512)`;

  // 2. Generate Windows .ico
  // png2icons expects a buffer. It returns a buffer (or null).
  // createICO(buffer, scalingAlgorithm, withSize, useMath)
  // scalingAlgorithm: 1 = Bilinear (better), 2 = Hermite (good), 3 = Bezier (best/slowest)
  // Defaulting to Bezier (3) for quality or Hermite (2) for speed. Let's use 2 (Hermite) as it's balanced.
  echo`🪟 Generating Windows .ico...`;
  const icoBuffer = png2icons.createICO(masterPngBuffer, png2icons.HERMITE, 0, false);
  
  if (icoBuffer) {
    fs.writeFileSync(path.join(ICONS_DIR, 'icon.ico'), icoBuffer);
    echo`  ✅ Created icon.ico`;
  } else {
    echo(chalk.red`  ❌ Failed to create icon.ico`);
    // detailed error might not be available from png2icons simple API, often returns null on failure
  }

  // 3. Generate macOS .icns
  echo`🍎 Generating macOS .icns...`;
  const icnsBuffer = png2icons.createICNS(masterPngBuffer, png2icons.HERMITE, 0);
  
  if (icnsBuffer) {
    fs.writeFileSync(path.join(ICONS_DIR, 'icon.icns'), icnsBuffer);
    echo`  ✅ Created icon.icns`;
  } else {
    echo(chalk.red`  ❌ Failed to create icon.icns`);
  }

  // 4. Generate Linux PNGs (various sizes)
  echo`🐧 Generating Linux PNG icons...`;
  const linuxSizes = [16, 32, 48, 64, 128, 256, 512];
  let generatedCount = 0;
  
  for (const size of linuxSizes) {
    await sharp(masterPngBuffer)
      .resize(size, size)
      .toFile(path.join(ICONS_DIR, `${size}x${size}.png`));
    generatedCount++;
  }
  echo`  ✅ Created ${generatedCount} Linux PNG icons`;

  // 5. Generate macOS Tray Icon Template
  echo`📍 Generating macOS tray icon template...`;
  const TRAY_SVG_SOURCE = path.join(ICONS_DIR, 'tray-icon-template.svg');
  
  if (fs.existsSync(TRAY_SVG_SOURCE)) {
    await sharp(TRAY_SVG_SOURCE)
      .resize(22, 22)
      .png()
      .toFile(path.join(ICONS_DIR, 'tray-icon-Template.png'));
    echo`  ✅ Created tray-icon-Template.png (22x22)`;
  } else {
    echo`  ⚠️  tray-icon-template.svg not found, skipping tray icon generation`;
  }

  // 6. Copy Logo.png for in-app display
  echo`\n🖼️  Processing in-app logo...`;
  await fs.ensureDir(path.dirname(LOGO_OUTPUT));
  if (fs.existsSync(LOGO_SOURCE)) {
    await sharp(LOGO_SOURCE)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(LOGO_OUTPUT);
    echo`  ✅ Created src/assets/logo.png from Logo.png`;
  } else {
    // Fallback: generate from app icon so in-app logo always exists
    await sharp(masterPngBuffer)
      .resize(512, 512)
      .toFile(LOGO_OUTPUT);
    echo`  ⚠️  Logo.png not found, generated logo.png from app icon`;
  }

  echo`\n✨ Icon generation complete! App icons: ${ICONS_DIR}, In-app logo: ${LOGO_OUTPUT}`;

} catch (error) {
  echo(chalk.red`\n❌ Fatal Error: ${error.message}`);
  process.exit(1);
}
