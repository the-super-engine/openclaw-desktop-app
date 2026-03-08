# 开放龙虾宝-桌面版 Application Icons

This directory contains the application icons for all supported platforms.

## Source Files (Project Root)

Place these in the **project root** for icon generation:

| File | Purpose |
|------|---------|
| `App_Icon.png` | App icon source (dock, taskbar, installer) — generates .ico, .icns, Linux PNGs |
| `Logo.png` | In-app logo (title bar, setup wizard) — copied to `src/assets/logo.png` |

If `App_Icon.png` is missing, the script falls back to `icon.svg`. If `Logo.png` is missing, the logo is generated from the app icon.

## Generated Files

| File | Platform | Description |
|------|----------|-------------|
| `icon.icns` | macOS | Apple Icon Image format |
| `icon.ico` | Windows | Windows ICO format |
| `icon.png` | All | 512x512 PNG fallback |
| `16x16.png` - `512x512.png` | Linux | PNG set for Linux |
| `tray-icon-Template.png` | macOS | 22x22 status bar icon |
| `src/assets/logo.png` | In-app | Logo for title bar and setup wizard |

## Generating Icons

```bash
pnpm icons
```

Or directly:

```bash
zx scripts/generate-icons.mjs
```

Uses Node.js (sharp, png2icons) — no ImageMagick required.

### Manual Generation

If you prefer to generate icons manually:

1. **macOS (.icns)**
   - Create a `.iconset` folder with properly named PNGs
   - Run: `iconutil -c icns -o icon.icns openclaw-desktop.iconset`

2. **Windows (.ico)**
   - Use ImageMagick: `convert icon_16.png icon_32.png icon_64.png icon_128.png icon_256.png icon.ico`

3. **Linux (PNGs)**
   - Generate PNGs at: 16, 32, 48, 64, 128, 256, 512 pixels

## Design Guidelines

### Application Icon
- **Corner Radius**: ~20% of width (200px on 1024px canvas)
- **Foreground**: White claw symbol with "X" accent
- **Safe Area**: Keep 10% margin from edges

### macOS Tray Icon
- **Format**: Single-color (black) on transparent background
- **Size**: 22x22 pixels (system automatically handles @2x retina)
- **Naming**: Must end with "Template.png" for automatic template mode
- **Design**: Simplified monochrome version of main icon
- **Source**: Use `tray-icon-template.svg` as the source
- **Important**: Must be pure black (#000000) on transparent background - no gradients or colors

## Updating the Icon

1. Edit `icon.svg` with your vector editor (Figma, Illustrator, Inkscape)
2. For macOS tray icon, edit `tray-icon-template.svg` (must be single-color black on transparent)
3. Run `node scripts/generate-icons.mjs`
4. Verify generated icons look correct
5. Commit all generated files
