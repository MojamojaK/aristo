import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'src', 'data');

let errors = 0;

function validate(fileName, checks) {
  const filePath = resolve(dataDir, fileName);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`[FAIL] ${fileName}: Could not parse JSON - ${err.message}`);
    errors++;
    return;
  }

  if (!Array.isArray(data)) {
    console.error(`[FAIL] ${fileName}: Expected an array`);
    errors++;
    return;
  }

  for (let i = 0; i < data.length; i++) {
    for (const [field, type] of Object.entries(checks)) {
      const value = data[i][field];
      if (type === 'string' && typeof value !== 'string') {
        console.error(`[FAIL] ${fileName}[${i}].${field}: expected string, got ${typeof value}`);
        errors++;
      }
      if (type === 'string?' && value !== null && typeof value !== 'string') {
        console.error(`[FAIL] ${fileName}[${i}].${field}: expected string or null, got ${typeof value}`);
        errors++;
      }
      if (type === 'array' && !Array.isArray(value)) {
        console.error(`[FAIL] ${fileName}[${i}].${field}: expected array, got ${typeof value}`);
        errors++;
      }
      if (type === 'object?' && value !== null && typeof value !== 'object') {
        console.error(`[FAIL] ${fileName}[${i}].${field}: expected object or null, got ${typeof value}`);
        errors++;
      }
    }
  }

  console.log(`[OK] ${fileName}: ${data.length} entries validated`);
}

validate('cultivationLogs.json', {
  slug: 'string',
  name: 'string',
  alias: 'string?',
  genus: 'string',
  sub_category: 'string',
  environment: 'string',
  logs: 'array',
  nativeHabitat: 'object?',
  cultivationEnvironment: 'object?',
  bodyContent: 'string',
});

validate('genuses.json', {
  name: 'string',
  header: 'string',
  sub_categories: 'array',
});

validate('domesticStores.json', {
  name: 'string',
  location: 'string',
  types: 'array',
  link: 'string',
  memo: 'string',
});

validate('internationalStores.json', {
  name: 'string',
  location: 'string',
  link: 'string',
  notes: 'string',
  import_logs: 'string',
});

validate('greenhousePages.json', {
  slug: 'string',
  url: 'string',
  title: 'string',
  content: 'string',
});

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s)`);
  process.exit(1);
} else {
  console.log('\nAll data files validated successfully');
}
