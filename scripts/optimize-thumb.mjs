import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'public/thumbnail.png';
const outputPath = 'public/thumbnail.jpg';

async function optimizeImage() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: ${inputPath} not found.`);
    return;
  }

  console.log(`Optimizing ${inputPath}...`);

  try {
    await sharp(inputPath)
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outputPath);

    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);

    console.log(`Optimization complete!`);
    console.log(`Original size: ${(inputStats.size / 1024).toFixed(2)} KB`);
    console.log(`New size: ${(outputStats.size / 1024).toFixed(2)} KB`);
    console.log(`Reduction: ${((1 - outputStats.size / inputStats.size) * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('Error during optimization:', error);
  }
}

optimizeImage();
