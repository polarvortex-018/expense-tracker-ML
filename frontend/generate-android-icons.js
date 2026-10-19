import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/cashbuddy-logo.svg');
const svgBuffer = fs.readFileSync(svgPath);

const resDir = path.resolve('android/app/src/main/res');

const densities = [
  { name: 'mipmap-mdpi', launcher: 48, foreground: 108 },
  { name: 'mipmap-hdpi', launcher: 72, foreground: 162 },
  { name: 'mipmap-xhdpi', launcher: 96, foreground: 216 },
  { name: 'mipmap-xxhdpi', launcher: 144, foreground: 324 },
  { name: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
];

async function generate() {
  for (const d of densities) {
    const dir = path.join(resDir, d.name);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // 1. Generate ic_launcher.png (Full logo on #0F0F15 dark background)
    await sharp(svgBuffer)
      .resize(d.launcher, d.launcher)
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // 2. Generate ic_launcher_round.png (Circular masked version)
    await sharp(svgBuffer)
      .resize(d.launcher, d.launcher)
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // 3. Generate ic_launcher_foreground.png (Foreground for adaptive icon)
    await sharp(svgBuffer)
      .resize(d.foreground, d.foreground)
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${d.name}`);
  }
  console.log('All Android launcher PNG icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
