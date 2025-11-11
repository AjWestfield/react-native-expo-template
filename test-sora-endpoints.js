const axios = require('axios');

const KIEAI_API_KEY = '8bbb36340133e8e3cbebf1317c73d798';
const BASE_URL = 'https://api.kie.ai/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${KIEAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

async function testEndpoint(endpoint, payload) {
  try {
    const response = await api.post(endpoint, payload);
    console.log(`✓ ${endpoint} - WORKS`);
    console.log(`  Response:`, response.data);
    return true;
  } catch (error) {
    const status = error.response ? error.response.status : error.message;
    console.log(`✗ ${endpoint} - ${status}`);
    if (error.response && error.response.data) {
      console.log(`  Error:`, error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('Testing Sora endpoint variations...\n');

  const payload = {
    prompt: 'A cat playing piano',
    model: 'sora-2-text-to-video',
    aspectRatio: '9:16'
  };

  const endpoints = [
    '/sora/generate',
    '/sora/v2/generate',
    '/sora2/generate',
    '/generate/sora',
    '/video/sora/generate',
  ];

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint, payload);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n\nChecking if Sora is available at all...');
  try {
    const response = await api.get('/common/credits');
    console.log('Credits endpoint works:', response.data);
  } catch (error) {
    const status = error.response ? error.response.status : error.message;
    console.log('Credits endpoint error:', status);
  }
}

main().catch(console.error);
