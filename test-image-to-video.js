/**
 * Comprehensive Image-to-Video Test Script
 * Tests both Veo 3.1 and Sora 2 image-to-video generation
 */

const axios = require('axios');

const KIEAI_API_KEY = '8bbb36340133e8e3cbebf1317c73d798';
const BASE_URL = 'https://api.kie.ai/api/v1';

// Test image URLs (using publicly accessible images)
const TEST_IMAGES = {
  single: 'https://picsum.photos/1280/720', // Single image for testing
  first: 'https://picsum.photos/seed/1/1280/720', // First frame
  last: 'https://picsum.photos/seed/2/1280/720', // Last frame
  portrait: 'https://picsum.photos/720/1280', // Portrait image
};

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${KIEAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Test results
const results = {
  veo31SingleImage: null,
  veo31TwoImages: null,
  sora2ImageToVideo: null,
};

/**
 * Poll for task completion
 */
async function pollForCompletion(taskId, model, maxAttempts = 30, intervalMs = 5000) {
  console.log(`⏳ Polling for completion (max ${maxAttempts} attempts, ${intervalMs/1000}s interval)...`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      let statusResponse;
      let state;
      let videoUrl = null;

      if (model === 'veo') {
        // VEO uses /veo/record-info
        statusResponse = await api.get('/veo/record-info', {
          params: { taskId },
        });

        const data = statusResponse.data.data;

        // Map successFlag to state
        if (data.successFlag === 1) {
          state = 'success';
          videoUrl = data.response?.resultUrls?.[0] || data.response?.originUrls?.[0];
        } else if (data.successFlag === 2 || data.successFlag === 3) {
          state = 'fail';
          throw new Error(data.errorMessage || 'Video generation failed');
        } else {
          state = 'generating';
        }
      } else {
        // Sora uses /jobs/recordInfo
        statusResponse = await api.get('/jobs/recordInfo', {
          params: { taskId },
        });

        const data = statusResponse.data.data;
        state = data.state;

        if (state === 'success' && data.resultJson) {
          const resultData = JSON.parse(data.resultJson);
          videoUrl = resultData.resultUrls?.[0] || resultData.resultWaterMarkUrls?.[0];
        } else if (state === 'fail') {
          throw new Error(data.failMsg || 'Video generation failed');
        }
      }

      console.log(`  Attempt ${i + 1}/${maxAttempts} - Status: ${state}`);

      if (state === 'success' && videoUrl) {
        console.log('✅ Video generation completed!');
        return videoUrl;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error;
      }
      console.warn(`  ⚠️  Poll attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error('Video generation timeout');
}

/**
 * Test 1: Veo 3.1 with single image
 */
async function testVeo31SingleImage() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('TEST 1: Veo 3.1 Image-to-Video (Single Image)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    console.log('📤 Submitting request with 1 image...');
    console.log(`   Image: ${TEST_IMAGES.single}`);

    const payload = {
      prompt: 'Camera slowly zooms into the scene with dramatic lighting',
      model: 'veo3_fast',
      imageUrls: [TEST_IMAGES.single],
      generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('Request:', JSON.stringify(payload, null, 2));

    const response = await api.post('/veo/generate', payload);

    if (response.data.code !== 200) {
      throw new Error(`API Error: ${response.data.msg}`);
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    // Poll for completion
    const videoUrl = await pollForCompletion(taskId, 'veo', 30, 5000);

    console.log(`\n🎉 SUCCESS!`);
    console.log(`📹 Video URL: ${videoUrl}`);

    results.veo31SingleImage = { success: true, taskId, videoUrl };
    return true;
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    results.veo31SingleImage = { success: false, error: error.message };
    return false;
  }
}

/**
 * Test 2: Veo 3.1 with two images (first and last frames)
 */
async function testVeo31TwoImages() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('TEST 2: Veo 3.1 Image-to-Video (Two Images - Frame Transition)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    console.log('📤 Submitting request with 2 images...');
    console.log(`   First frame: ${TEST_IMAGES.first}`);
    console.log(`   Last frame: ${TEST_IMAGES.last}`);

    const payload = {
      prompt: 'Smooth transition from first frame to last frame with natural motion',
      model: 'veo3_fast',
      imageUrls: [TEST_IMAGES.first, TEST_IMAGES.last],
      generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('Request:', JSON.stringify(payload, null, 2));

    const response = await api.post('/veo/generate', payload);

    if (response.data.code !== 200) {
      throw new Error(`API Error: ${response.data.msg}`);
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    // Poll for completion
    const videoUrl = await pollForCompletion(taskId, 'veo', 30, 5000);

    console.log(`\n🎉 SUCCESS!`);
    console.log(`📹 Video URL: ${videoUrl}`);

    results.veo31TwoImages = { success: true, taskId, videoUrl };
    return true;
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    results.veo31TwoImages = { success: false, error: error.message };
    return false;
  }
}

/**
 * Test 3: Sora 2 Image-to-Video
 */
async function testSora2ImageToVideo() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('TEST 3: Sora 2 Image-to-Video');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    console.log('📤 Submitting request with image...');
    console.log(`   Image: ${TEST_IMAGES.portrait}`);

    const payload = {
      model: 'sora-2-image-to-video',
      input: {
        prompt: 'Camera pans across the scene with cinematic movement',
        image_urls: [TEST_IMAGES.portrait],
        aspect_ratio: 'portrait',
        n_frames: '10',
        remove_watermark: true,
      },
    };

    console.log('Request:', JSON.stringify(payload, null, 2));

    const response = await api.post('/jobs/createTask', payload);

    if (response.data.code !== 200) {
      throw new Error(`API Error: ${response.data.msg}`);
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    // Poll for completion
    const videoUrl = await pollForCompletion(taskId, 'sora', 30, 5000);

    console.log(`\n🎉 SUCCESS!`);
    console.log(`📹 Video URL: ${videoUrl}`);

    results.sora2ImageToVideo = { success: true, taskId, videoUrl };
    return true;
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    results.sora2ImageToVideo = { success: false, error: error.message };
    return false;
  }
}

/**
 * Print final summary
 */
function printSummary() {
  console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║               FINAL TEST SUMMARY                          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const tests = [
    { name: 'Veo 3.1 Single Image', result: results.veo31SingleImage },
    { name: 'Veo 3.1 Two Images', result: results.veo31TwoImages },
    { name: 'Sora 2 Image-to-Video', result: results.sora2ImageToVideo },
  ];

  tests.forEach((test, index) => {
    const status = test.result?.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}`);
    if (test.result?.success) {
      console.log(`   📹 Video: ${test.result.videoUrl}`);
    } else if (test.result?.error) {
      console.log(`   ❌ Error: ${test.result.error}`);
    }
    console.log('');
  });

  const passedCount = tests.filter(t => t.result?.success).length;
  const totalCount = tests.length;

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`RESULT: ${passedCount}/${totalCount} tests passed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  return passedCount === totalCount;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Image-to-Video Integration Tests                     ║');
  console.log('║     Testing Veo 3.1 and Sora 2 Implementations           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('Configuration:');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  API Key: ${KIEAI_API_KEY.substring(0, 8)}...${KIEAI_API_KEY.substring(KIEAI_API_KEY.length - 4)}`);
  console.log('');

  // Run all tests
  await testVeo31SingleImage();
  await testVeo31TwoImages();
  await testSora2ImageToVideo();

  // Print summary
  const allPassed = printSummary();

  process.exit(allPassed ? 0 : 1);
}

// Execute tests
runTests().catch(error => {
  console.error('\n\n💥 FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
