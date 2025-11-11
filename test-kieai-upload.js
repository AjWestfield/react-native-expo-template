/**
 * Test KIE AI File Upload Service
 * Tests image upload to kie.ai and complete image-to-video flow
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const KIEAI_API_KEY = '8bbb36340133e8e3cbebf1317c73d798';
const UPLOAD_BASE_URL = 'https://kieai.redpandaai.co';
const API_BASE_URL = 'https://api.kie.ai/api/v1';

// Test image (from previous tests)
const TEST_IMAGE_URL = 'https://picsum.photos/1280/720';

const uploadApi = axios.create({
  baseURL: UPLOAD_BASE_URL,
  headers: {
    'Authorization': `Bearer ${KIEAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

const videoApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${KIEAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Test 1: Upload image via URL (simulates having a public image)
 */
async function testUrlUpload() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 1: Upload Image via URL');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    console.log('📤 Uploading image from URL:', TEST_IMAGE_URL);

    const response = await uploadApi.post('/api/file-url-upload', {
      fileUrl: TEST_IMAGE_URL,
      uploadPath: 'images/test',
      fileName: `test_${Date.now()}.jpg`,
    });

    if (!response.data.success || response.data.code !== 200) {
      throw new Error(response.data.msg || 'Upload failed');
    }

    const downloadUrl = response.data.data.downloadUrl;
    console.log('✅ Upload successful!');
    console.log(`   Download URL: ${downloadUrl}`);
    console.log(`   File size: ${response.data.data.fileSize} bytes`);
    console.log(`   MIME type: ${response.data.data.mimeType}\n`);

    return { success: true, downloadUrl };
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Use uploaded image with Veo 3.1 video generation
 */
async function testVeoWithUploadedImage(imageUrl) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 2: Veo 3.1 Video Generation with Uploaded Image');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    console.log('📤 Generating video with uploaded image...');
    console.log(`   Image URL: ${imageUrl}`);

    const payload = {
      prompt: 'Camera zooms in smoothly with cinematic effect',
      model: 'veo3_fast',
      imageUrls: [imageUrl],
      generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('Request:', JSON.stringify(payload, null, 2));

    const response = await videoApi.post('/veo/generate', payload);

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Video generation failed');
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    // Poll for completion
    console.log('⏳ Polling for completion...');
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await videoApi.get('/veo/record-info', {
        params: { taskId },
      });

      const data = statusResponse.data.data;

      if (data.successFlag === 1 && data.response) {
        const videoUrl = data.response.resultUrls?.[0] || data.response.originUrls?.[0];
        console.log('✅ Video generation successful!');
        console.log(`   Video URL: ${videoUrl}\n`);
        return { success: true, videoUrl };
      } else if (data.successFlag === 2 || data.successFlag === 3) {
        throw new Error(data.errorMessage || 'Video generation failed');
      }

      if (i % 3 === 0) {
        console.log(`   Attempt ${i + 1}/20 - Generating...`);
      }
    }

    throw new Error('Timeout');
  } catch (error) {
    console.error('❌ Video generation failed:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Download an image, convert to base64, and upload
 */
async function testBase64Upload() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 3: Base64 Upload (simulating local file)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    console.log('📥 Downloading test image...');

    // Download image
    const imageResponse = await axios.get(TEST_IMAGE_URL, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(imageResponse.data);
    const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    console.log(`   Downloaded ${imageBuffer.length} bytes`);
    console.log('📤 Uploading as base64...');

    const uploadResponse = await uploadApi.post('/api/file-base64-upload', {
      base64Data,
      uploadPath: 'images/test',
      fileName: `test_base64_${Date.now()}.jpg`,
    });

    if (!uploadResponse.data.success || uploadResponse.data.code !== 200) {
      throw new Error(uploadResponse.data.msg || 'Upload failed');
    }

    const downloadUrl = uploadResponse.data.data.downloadUrl;
    console.log('✅ Upload successful!');
    console.log(`   Download URL: ${downloadUrl}`);
    console.log(`   File size: ${uploadResponse.data.data.fileSize} bytes\n`);

    return { success: true, downloadUrl };
  } catch (error) {
    console.error('❌ Base64 upload failed:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

/**
 * Print summary
 */
function printSummary(results) {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const tests = [
    { name: 'Upload Image via URL', result: results.test1 },
    { name: 'Veo 3.1 with Uploaded Image', result: results.test2 },
    { name: 'Base64 Upload', result: results.test3 },
  ];

  tests.forEach((test, index) => {
    const status = test.result?.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}`);
    if (test.result?.error) {
      console.log(`   Error: ${test.result.error}`);
    }
  });

  const passedCount = tests.filter(t => t.result?.success).length;
  console.log(`\n📊 Result: ${passedCount}/${tests.length} tests passed\n`);

  if (passedCount === tests.length) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('💡 Image upload and image-to-video flow working correctly!');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }

  console.log('');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     KIE AI Image Upload & Video Generation Tests         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const results = {
    test1: await testUrlUpload(),
    test2: null,
    test3: await testBase64Upload(),
  };

  // Test Veo if upload succeeded
  if (results.test1.success) {
    results.test2 = await testVeoWithUploadedImage(results.test1.downloadUrl);
  } else {
    results.test2 = { success: false, error: 'Skipped due to upload failure' };
  }

  printSummary(results);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
