/**
 * Test different generationType approaches for Veo 3.1
 * Based on documentation: generationType is OPTIONAL and system can auto-detect
 */

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

// Test image
const TEST_IMAGE = 'https://picsum.photos/1280/720';

/**
 * Poll for completion
 */
async function pollForCompletion(taskId, testName, maxAttempts = 20) {
  console.log(`⏳ Polling for completion (max ${maxAttempts} attempts)...`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const statusResponse = await api.get('/veo/record-info', {
        params: { taskId },
      });

      const data = statusResponse.data.data;
      let state;

      if (data.successFlag === 1) {
        state = 'success';
        const videoUrl = data.response?.resultUrls?.[0] || data.response?.originUrls?.[0];
        console.log(`✅ SUCCESS - ${testName}`);
        console.log(`   Video URL: ${videoUrl}\n`);
        return { success: true, videoUrl };
      } else if (data.successFlag === 2 || data.successFlag === 3) {
        state = 'fail';
        console.error(`❌ FAILED - ${testName}`);
        console.error(`   Error: ${data.errorMessage}\n`);
        return { success: false, error: data.errorMessage };
      } else {
        state = 'generating';
      }

      if (i % 3 === 0) {
        console.log(`  Attempt ${i + 1}/${maxAttempts} - Status: ${state}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.error(`❌ FAILED - ${testName}`);
        console.error(`   Error: ${error.message}\n`);
        return { success: false, error: error.message };
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.error(`❌ TIMEOUT - ${testName}\n`);
  return { success: false, error: 'Timeout' };
}

/**
 * Test 1: With generationType explicitly set to FIRST_AND_LAST_FRAMES_2_VIDEO
 */
async function testWithGenerationType() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 1: Veo 3.1 with generationType=FIRST_AND_LAST_FRAMES_2_VIDEO');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const payload = {
      prompt: 'Camera slowly zooms into the scene with smooth motion',
      model: 'veo3_fast',
      imageUrls: [TEST_IMAGE],
      generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('📤 Request:', JSON.stringify(payload, null, 2));

    const response = await api.post('/veo/generate', payload);

    if (response.data.code !== 200) {
      console.error(`❌ API Error: ${response.data.msg}\n`);
      return { success: false, error: response.data.msg };
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    return await pollForCompletion(taskId, 'With generationType');
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: WITHOUT generationType (let API auto-detect)
 */
async function testWithoutGenerationType() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 2: Veo 3.1 WITHOUT generationType (auto-detect)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const payload = {
      prompt: 'Camera slowly zooms into the scene with smooth motion',
      model: 'veo3_fast',
      imageUrls: [TEST_IMAGE],
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('📤 Request:', JSON.stringify(payload, null, 2));

    const response = await api.post('/veo/generate', payload);

    if (response.data.code !== 200) {
      console.error(`❌ API Error: ${response.data.msg}\n`);
      return { success: false, error: response.data.msg };
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    return await pollForCompletion(taskId, 'Without generationType');
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: With TEXT_2_VIDEO (should fail if image is provided)
 */
async function testWithTextToVideo() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 3: Veo 3.1 with generationType=TEXT_2_VIDEO (with image - should this work?)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const payload = {
      prompt: 'Camera slowly zooms into the scene with smooth motion',
      model: 'veo3_fast',
      imageUrls: [TEST_IMAGE],
      generationType: 'TEXT_2_VIDEO',
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('📤 Request:', JSON.stringify(payload, null, 2));

    const response = await api.post('/veo/generate', payload);

    if (response.data.code !== 200) {
      console.error(`❌ API Error: ${response.data.msg}\n`);
      return { success: false, error: response.data.msg };
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    return await pollForCompletion(taskId, 'With TEXT_2_VIDEO');
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Text-only without images (baseline)
 */
async function testTextOnly() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 4: Veo 3.1 Text-Only (baseline - should work)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const payload = {
      prompt: 'A golden retriever playing in a sunny park',
      model: 'veo3_fast',
      aspectRatio: '16:9',
      enableTranslation: true,
    };

    console.log('📤 Request:', JSON.stringify(payload, null, 2));

    const response = await api.post('/veo/generate', payload);

    if (response.data.code !== 200) {
      console.error(`❌ API Error: ${response.data.msg}\n`);
      return { success: false, error: response.data.msg };
    }

    const taskId = response.data.data.taskId;
    console.log(`✅ Task created: ${taskId}\n`);

    return await pollForCompletion(taskId, 'Text-Only');
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
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
    { name: 'Test 1: With FIRST_AND_LAST_FRAMES_2_VIDEO', result: results.test1 },
    { name: 'Test 2: Without generationType (auto)', result: results.test2 },
    { name: 'Test 3: With TEXT_2_VIDEO + image', result: results.test3 },
    { name: 'Test 4: Text-Only baseline', result: results.test4 },
  ];

  tests.forEach((test, index) => {
    const status = test.result?.success ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (test.result?.error) {
      console.log(`   Error: ${test.result.error}`);
    }
  });

  const passedCount = tests.filter(t => t.result?.success).length;
  console.log(`\n📊 Result: ${passedCount}/${tests.length} tests passed\n`);

  console.log('🔍 ANALYSIS:');
  if (results.test1?.success && results.test2?.success) {
    console.log('   ✅ Both explicit and auto-detect generationType work');
    console.log('   💡 RECOMMENDATION: Use auto-detect (omit generationType)');
  } else if (results.test1?.success && !results.test2?.success) {
    console.log('   ⚠️  Only explicit generationType works');
    console.log('   💡 RECOMMENDATION: Always specify FIRST_AND_LAST_FRAMES_2_VIDEO for image-to-video');
  } else if (!results.test1?.success && results.test2?.success) {
    console.log('   ⚠️  Only auto-detect works');
    console.log('   💡 RECOMMENDATION: Do NOT specify generationType, let API auto-detect');
  } else {
    console.log('   ❌ Both approaches failed - investigate further');
  }

  console.log('');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       Veo 3.1 generationType Investigation                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const results = {
    test1: await testWithGenerationType(),
    test2: await testWithoutGenerationType(),
    test3: await testWithTextToVideo(),
    test4: await testTextOnly(),
  };

  printSummary(results);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
