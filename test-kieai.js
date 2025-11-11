/**
 * KIEAI API Integration Test Script
 * Tests all video generation scenarios without requiring UI authentication
 */

const axios = require('axios');

const KIEAI_API_KEY = '8bbb36340133e8e3cbebf1317c73d798';
const BASE_URL = 'https://api.kie.ai/api/v1';

// Test configurations
const testCases = [
  {
    name: 'Sora 2 Text-to-Video (Vertical)',
    endpoint: '/sora/generate',
    payload: {
      prompt: 'A cat playing piano in a cozy living room',
      model: 'sora-2-text-to-video',
      aspectRatio: '9:16'
    },
    expectedModel: 'Sora 2',
    generationType: 'text-to-video'
  },
  {
    name: 'Sora 2 Image-to-Video (Vertical)',
    endpoint: '/sora/generate',
    payload: {
      prompt: 'A cat playing piano in a cozy living room',
      model: 'sora-2-image-to-video',
      imageUrl: 'https://example.com/sample-image.jpg',
      aspectRatio: '9:16'
    },
    expectedModel: 'Sora 2',
    generationType: 'image-to-video'
  },
  {
    name: 'VEO 3.1 Text-to-Video (Vertical)',
    endpoint: '/veo/generate',
    payload: {
      prompt: 'A cat playing piano in a cozy living room',
      model: 'veo3_fast',
      aspectRatio: '9:16',
      enableTranslation: true
    },
    expectedModel: 'VEO 3.1',
    generationType: 'text-to-video'
  },
  {
    name: 'VEO 3.1 Image-to-Video (Vertical)',
    endpoint: '/veo/generate',
    payload: {
      prompt: 'A cat playing piano in a cozy living room',
      model: 'veo3_fast',
      imageUrls: ['https://example.com/sample-image.jpg'],
      aspectRatio: '9:16',
      enableTranslation: true
    },
    expectedModel: 'VEO 3.1',
    generationType: 'image-to-video'
  }
];

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${KIEAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

async function runTest(testCase) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${testCase.name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Endpoint: ${testCase.endpoint}`);
  console.log(`Payload:`, JSON.stringify(testCase.payload, null, 2));

  try {
    const startTime = Date.now();
    const response = await api.post(testCase.endpoint, testCase.payload);
    const duration = Date.now() - startTime;

    console.log(`\n✓ Request succeeded in ${duration}ms`);
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Code: ${response.data.code}`);
    console.log(`Response Message: ${response.data.msg}`);

    if (response.data.data) {
      console.log(`Task ID: ${response.data.data.taskId}`);
    }

    // Validation
    const issues = [];

    if (response.data.code !== 200) {
      issues.push(`Expected code 200, got ${response.data.code}`);
    }

    if (!response.data.data || !response.data.data.taskId) {
      issues.push('Missing taskId in response');
    }

    if (issues.length > 0) {
      console.log(`\n⚠ Issues found:`);
      issues.forEach(issue => console.log(`  - ${issue}`));
      return { success: false, issues };
    }

    console.log(`\n✓ All validations passed`);
    return { success: true, taskId: response.data.data.taskId, duration };

  } catch (error) {
    console.log(`\n✗ Request failed`);

    if (error.response) {
      console.log(`HTTP Status: ${error.response.status}`);
      console.log(`Error Code: ${error.response.data?.code}`);
      console.log(`Error Message: ${error.response.data?.msg}`);
      console.log(`Error Details:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNABORTED') {
      console.log(`Error: Request timeout`);
    } else {
      console.log(`Error: ${error.message}`);
    }

    return { success: false, error: error.message, details: error.response?.data };
  }
}

async function main() {
  console.log('KIEAI API Integration Test Suite');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Key: ${KIEAI_API_KEY.substring(0, 8)}...`);
  console.log(`Total Tests: ${testCases.length}`);

  const results = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ name: testCase.name, ...result });

    // Wait 1 second between tests to avoid rate limiting
    if (testCases.indexOf(testCase) < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST SUMMARY');
  console.log(`${'='.repeat(80)}`);

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  console.log(`\nDetailed Results:`);
  results.forEach((result, index) => {
    const status = result.success ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${index + 1}. ${status} - ${result.name}`);
    if (result.taskId) {
      console.log(`     Task ID: ${result.taskId}`);
    }
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });

  console.log(`\n${'='.repeat(80)}`);
}

main().catch(console.error);
