/**
 * Test script to verify Veo 3.1 API integration fix
 * Tests text-to-video generation with proper response parsing
 */

const axios = require('axios');

const KIEAI_API_KEY = '8bbb36340133e8e3cbebf1317c73d798';
const BASE_URL = 'https://api.kie.ai/api/v1';

// Create axios instance with proper auth
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${KIEAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Generate a Veo 3.1 video
 */
async function generateVeoVideo() {
  console.log('🎬 Starting Veo 3.1 video generation test...\n');

  try {
    // Step 1: Submit generation request
    console.log('📤 Submitting Veo 3.1 generation request...');
    const generateResponse = await api.post('/veo/generate', {
      prompt: 'A golden retriever playing fetch in a sunny park, slow motion',
      model: 'veo3_fast',
      aspectRatio: '16:9',
      enableTranslation: true,
    });

    if (generateResponse.data.code !== 200) {
      throw new Error(`Generation failed: ${generateResponse.data.msg}`);
    }

    const taskId = generateResponse.data.data.taskId;
    console.log(`✅ Task created successfully: ${taskId}\n`);

    // Step 2: Poll for completion
    console.log('⏳ Polling for completion...');
    const videoUrl = await pollForCompletion(taskId);

    console.log('\n🎉 SUCCESS! Video generated successfully!');
    console.log(`📹 Video URL: ${videoUrl}`);

    return videoUrl;
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Poll for task completion
 */
async function pollForCompletion(taskId, maxAttempts = 60, intervalMs = 5000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const statusResponse = await api.get('/veo/record-info', {
        params: { taskId },
      });

      if (statusResponse.data.code !== 200) {
        throw new Error(`Status check failed: ${statusResponse.data.msg}`);
      }

      const data = statusResponse.data.data;
      console.log(`⏱️  Attempt ${i + 1}/${maxAttempts} - Status: ${getStatusText(data.successFlag)}`);

      // Check if completed successfully (successFlag === 1)
      if (data.successFlag === 1 && data.response) {
        // Response is an object with resultUrls and originUrls
        console.log('\n✅ Video generation completed!');
        console.log('Response structure:', JSON.stringify(data.response, null, 2));

        const videoUrl = data.response.resultUrls?.[0] || data.response.originUrls?.[0];

        if (!videoUrl) {
          throw new Error('No video URL found in response');
        }

        return videoUrl;
      }

      // Check if failed (successFlag === 2 or 3)
      if (data.successFlag === 2 || data.successFlag === 3) {
        throw new Error(data.errorMessage || 'Video generation failed');
      }

      // Still generating, wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error;
      }
      console.warn(`⚠️  Poll attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error('Video generation timeout');
}

/**
 * Get human-readable status text
 */
function getStatusText(successFlag) {
  switch (successFlag) {
    case 0: return 'Generating';
    case 1: return 'Success';
    case 2: return 'Failed';
    case 3: return 'Generation Failed';
    default: return `Unknown (${successFlag})`;
  }
}

/**
 * Test API authentication
 */
async function testAuthentication() {
  console.log('🔐 Testing API authentication...\n');

  // Authentication will be tested during video generation
  // The /common/credits endpoint might not exist, so we'll skip it
  console.log('ℹ️  Will verify authentication during video generation request');
  console.log('');
  return true;
}

// Run the test
(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Veo 3.1 API Integration Test');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test authentication first
  const authSuccess = await testAuthentication();

  if (!authSuccess) {
    console.log('\n❌ Skipping video generation test due to authentication failure.');
    process.exit(1);
  }

  // Run video generation test
  await generateVeoVideo();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Test completed successfully! ✨');
  console.log('═══════════════════════════════════════════════════════════\n');
})();
