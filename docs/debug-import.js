// Debug script to test JSON import
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'src', 'data', 'hsk-database.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('=== DEBUG JSON IMPORT ===');
console.log('Total words:', data.length);
console.log('HSK level distribution:');
console.log('HSK 1:', data.filter(w => w.hskLevel === 1).length);
console.log('HSK 2:', data.filter(w => w.hskLevel === 2).length);
console.log('HSK 3:', data.filter(w => w.hskLevel === 3).length);

console.log('\nFirst word of each level:');
console.log('HSK 1:', data.find(w => w.hskLevel === 1));
console.log('HSK 2:', data.find(w => w.hskLevel === 2));
console.log('HSK 3:', data.find(w => w.hskLevel === 3));

console.log('\nLast few words:');
console.log(data.slice(-5));
