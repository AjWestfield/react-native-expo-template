/**
 * Sora 2 API Integration Test Script
 * Tests the updated KIEAI endpoints for Sora 2 video generation
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'https://api.kie.ai/api/v1';
const API_KEY = '8bbb36340133e8e3cbebf1317c73d798';

// Test results tracking
const results = {
  soraTextToVideo: null,
  soraImageToVideo: null,
  taskStatusPolling: null,
  veo31Regression: null,
};

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Utility function to log test results
function logTest(testName, passed, details) {
  const status = passed ? '✓' : '✗';
  console.log(`\n${status} ${testName}`);
  if (details) {
    console.log(`  Details: ${details}`);
  }
}

// Test 1: Sora 2 Text-to-Video
async function testSoraTextToVideo() {
  console.log('\n=== TEST 1: Sora 2 Text-to-Video ===');

  try {
    const payload = {
      model: 'sora-2-text-to-video',
      input: {
        prompt: 'A cat playing piano in a cozy living room',
        aspect_ratio: 'portrait',
        n_frames: '10',
        remove_watermark: true,
      },
    };

    console.log('Request URL:', `${BASE_URL}/jobs/createTask`);
    console.log('Request Payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('/jobs/createTask', payload);

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Verify response structure
    const isSuccess = response.status === 200 &&
                     response.data.code === 200 &&
                     response.data.data &&
                     response.data.data.taskId;

    if (isSuccess) {
      logTest('Sora 2 Text-to-Video', true, `TaskID: ${response.data.data.taskId}`);
      results.soraTextToVideo = { success: true, taskId: response.data.data.taskId };
      return response.data.data.taskId;
    } else {
      logTest('Sora 2 Text-to-Video', false, 'Invalid response structure');
      results.soraTextToVideo = { success: false, error: 'Invalid response structure' };
      return null;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.msg || error.message;
    const errorCode = error.response?.data?.code || error.response?.status;
    logTest('Sora 2 Text-to-Video', false, `Error ${errorCode}: ${errorMsg}`);
    results.soraTextToVideo = { success: false, error: errorMsg, code: errorCode };

    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test 2: Sora 2 Image-to-Video
async function testSoraImageToVideo() {
  console.log('\n=== TEST 2: Sora 2 Image-to-Video ===');

  try {
    const payload = {
      model: 'sora-2-image-to-video',
      input: {
        prompt: 'Camera slowly zooms in on the scene',
        image_urls: ['https://picsum.photos/720/1280'], // Random placeholder image
        aspect_ratio: 'portrait',
        n_frames: '10',
        remove_watermark: true,
      },
    };

    console.log('Request URL:', `${BASE_URL}/jobs/createTask`);
    console.log('Request Payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('/jobs/createTask', payload);

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Verify response structure
    const isSuccess = response.status === 200 &&
                     response.data.code === 200 &&
                     response.data.data &&
                     response.data.data.taskId;

    if (isSuccess) {
      logTest('Sora 2 Image-to-Video', true, `TaskID: ${response.data.data.taskId}`);
      results.soraImageToVideo = { success: true, taskId: response.data.data.taskId };
      return response.data.data.taskId;
    } else {
      logTest('Sora 2 Image-to-Video', false, 'Invalid response structure');
      results.soraImageToVideo = { success: false, error: 'Invalid response structure' };
      return null;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.msg || error.message;
    const errorCode = error.response?.data?.code || error.response?.status;
    logTest('Sora 2 Image-to-Video', false, `Error ${errorCode}: ${errorMsg}`);
    results.soraImageToVideo = { success: false, error: errorMsg, code: errorCode };

    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test 3: Task Status Polling
async function testTaskStatusPolling(taskId) {
  console.log('\n=== TEST 3: Task Status Polling ===');

  if (!taskId) {
    logTest('Task Status Polling', false, 'No taskId available from previous tests');
    results.taskStatusPolling = { success: false, error: 'No taskId' };
    return;
  }

  try {
    console.log('Request URL:', `${BASE_URL}/jobs/recordInfo?taskId=${taskId}`);

    const response = await api.get('/jobs/recordInfo', {
      params: { taskId },
    });

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Verify response structure
    const isSuccess = response.status === 200 &&
                     response.data.code === 200 &&
                     response.data.data &&
                     response.data.data.state;

    if (isSuccess) {
      const state = response.data.data.state;
      const validStates = ['waiting', 'queuing', 'generating', 'success', 'fail'];
      const hasValidState = validStates.includes(state);

      logTest('Task Status Polling', hasValidState, `State: ${state}`);

      // Check if resultJson is present for completed tasks
      if (state === 'success' && response.data.data.resultJson) {
        console.log('  ResultJson:', response.data.data.resultJson);
        try {
          const resultData = JSON.parse(response.data.data.resultJson);
          console.log('  Parsed Result:', JSON.stringify(resultData, null, 2));
          if (resultData.resultUrls || resultData.resultWaterMarkUrls) {
            console.log('  ✓ Video URL found in resultJson');
          }
        } catch (parseError) {
          console.log('  ✗ Failed to parse resultJson:', parseError.message);
        }
      }

      results.taskStatusPolling = { success: hasValidState, state };
    } else {
      logTest('Task Status Polling', false, 'Invalid response structure');
      results.taskStatusPolling = { success: false, error: 'Invalid response structure' };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.msg || error.message;
    const errorCode = error.response?.data?.code || error.response?.status;
    logTest('Task Status Polling', false, `Error ${errorCode}: ${errorMsg}`);
    results.taskStatusPolling = { success: false, error: errorMsg, code: errorCode };

    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test 4: VEO 3.1 Regression Test
async function testVeo31Regression() {
  console.log('\n=== TEST 4: VEO 3.1 Regression Test ===');

  try {
    const payload = {
      prompt: 'A beautiful sunset over the ocean',
      model: 'veo3_fast',
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('Request URL:', `${BASE_URL}/veo/generate`);
    console.log('Request Payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('/veo/generate', payload);

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Verify response structure
    const isSuccess = response.status === 200 &&
                     response.data.code === 200 &&
                     response.data.data &&
                     response.data.data.taskId;

    if (isSuccess) {
      logTest('VEO 3.1 Regression', true, `TaskID: ${response.data.data.taskId}`);
      results.veo31Regression = { success: true, taskId: response.data.data.taskId };
    } else {
      logTest('VEO 3.1 Regression', false, 'Invalid response structure');
      results.veo31Regression = { success: false, error: 'Invalid response structure' };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.msg || error.message;
    const errorCode = error.response?.data?.code || error.response?.status;
    logTest('VEO 3.1 Regression', false, `Error ${errorCode}: ${errorMsg}`);
    results.veo31Regression = { success: false, error: errorMsg, code: errorCode };

    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Print final summary
function printSummary() {
  console.log('\n\n' + '='.repeat(60));
  console.log('FINAL TEST SUMMARY');
  console.log('='.repeat(60));

  const tests = [
    { name: 'Sora 2 Text-to-Video', result: results.soraTextToVideo },
    { name: 'Sora 2 Image-to-Video', result: results.soraImageToVideo },
    { name: 'Task Status Polling', result: results.taskStatusPolling },
    { name: 'VEO 3.1 Regression', result: results.veo31Regression },
  ];

  tests.forEach(test => {
    const status = test.result?.success ? '✓' : '✗';
    console.log(`${status} ${test.name}`);
    if (!test.result?.success && test.result?.error) {
      console.log(`  Error: ${test.result.error}`);
    }
  });

  const passedCount = tests.filter(t => t.result?.success).length;
  const totalCount = tests.length;

  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${passedCount}/${totalCount} tests passed`);
  console.log('='.repeat(60) + '\n');
}

// Run all tests
async function runTests() {
  console.log('Starting Sora 2 API Integration Tests...');
  console.log('Base URL:', BASE_URL);
  console.log('API Key:', API_KEY.substring(0, 8) + '...' + API_KEY.substring(API_KEY.length - 4));

  // Run tests sequentially
  const textToVideoTaskId = await testSoraTextToVideo();
  await testSoraImageToVideo();

  // Test task status with the first taskId we got
  if (textToVideoTaskId) {
    await testTaskStatusPolling(textToVideoTaskId);
  }

  await testVeo31Regression();

  // Print summary
  printSummary();
}

// Execute tests
runTests().catch(error => {
  console.error('\n\nFATAL ERROR:', error.message);
  process.exit(1);
});
