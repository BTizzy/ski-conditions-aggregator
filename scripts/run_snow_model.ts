import fs from 'fs';
import path from 'path';
import snowModel from '../lib/snowModel';

async function main() {
  const dataPath = path.join(__dirname, 'test', 'historical_sample.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Sample data not found:', dataPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, 'utf8');
  const samples = JSON.parse(raw);

  for (const s of samples) {
    console.log('---');
    console.log('Sample:', s.id || s.name || 'unknown');
    const pred = snowModel.predictFromNWS(s.nws || null, s.extra || undefined);
    console.log('Prediction:', pred);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
