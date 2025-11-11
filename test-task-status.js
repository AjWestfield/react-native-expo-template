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

async function testTaskStatus() {
  // Use the task ID from our earlier VEO test
  const veoTaskId = '50d98d48d435e1b2bcfa5b32c51efa6e';

  console.log('Testing VEO task status polling...\n');
  console.log(`Task ID: ${veoTaskId}`);

  try {
    const response = await api.get('/veo/record-info', {
      params: { taskId: veoTaskId }
    });

    console.log('\n✓ VEO task status endpoint works');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.data) {
      const task = response.data.data;
      console.log(`\nTask Details:`);
      console.log(`  State: ${task.state}`);
      console.log(`  Generate Time: ${task.generateTime || 'N/A'}`);
      if (task.videoInfo) {
        console.log(`  Video URL: ${task.videoInfo.videoUrl || 'Not ready yet'}`);
      }
      if (task.failMsg) {
        console.log(`  Fail Message: ${task.failMsg}`);
      }
    }

  } catch (error) {
    const status = error.response ? error.response.status : error.message;
    console.log(`✗ VEO task status failed - ${status}`);
    if (error.response && error.response.data) {
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n\nTesting Sora task status endpoint (expected to fail)...\n');

  try {
    const response = await api.get('/sora/record-info', {
      params: { taskId: 'dummy-task-id' }
    });
    console.log('✓ Sora task status endpoint works');
    console.log('Response:', response.data);
  } catch (error) {
    const status = error.response ? error.response.status : error.message;
    console.log(`✗ Sora task status failed - ${status}`);
    if (error.response && error.response.data) {
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testTaskStatus().catch(console.error);
