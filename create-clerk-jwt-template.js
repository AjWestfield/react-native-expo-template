/**
 * Script to create Clerk JWT template for Supabase integration
 * Uses Clerk REST API directly for maximum compatibility
 */

const https = require('https');

// Configuration
const SUPABASE_JWT_SECRET = 'GLIKrvVMYDhVweKvaXUu3NAJ/uvzI5AGgElnB/yHKJdkDXfQT3OB1BdFeV5uARU4fxTREThMXfsuv/n2FYNWPg==';

// Helper function to make HTTPS requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } else {
          reject({ status: res.statusCode, message: body });
        }
      });
    });

    req.on('error', (error) => reject(error));

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createSupabaseJWTTemplate() {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    console.error('❌ Error: CLERK_SECRET_KEY environment variable not set');
    console.log('\n📋 How to get your Clerk Secret Key:');
    console.log('1. Go to https://dashboard.clerk.com');
    console.log('2. Select your application');
    console.log('3. Go to "API Keys" in the left sidebar');
    console.log('4. Copy the "Secret Key" (starts with sk_test_ or sk_live_)');
    console.log('\n💡 Then run:');
    console.log('export CLERK_SECRET_KEY="your_secret_key_here"');
    console.log('node create-clerk-jwt-template.js');
    process.exit(1);
  }

  console.log('🚀 Creating Clerk JWT template for Supabase...\n');

  const baseOptions = {
    hostname: 'api.clerk.com',
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    // Step 1: List existing templates
    console.log('🔍 Checking for existing templates...');

    const listOptions = {
      ...baseOptions,
      path: '/v1/jwt_templates',
      method: 'GET',
    };

    const listResponse = await makeRequest(listOptions);
    const existingTemplate = listResponse.data.data?.find(t => t.name === 'supabase');

    // Step 2: Template configuration
    const templateConfig = {
      name: 'supabase',
      claims: {
        aud: 'authenticated',
        sub: '{{user.id}}',
        email: '{{user.email}}',
        app_metadata: {
          provider: 'clerk',
        },
        user_metadata: {
          email: '{{user.email}}',
          email_verified: '{{user.email_verified}}',
        },
      },
      lifetime: 3600,
      allowed_clock_skew: 5,
      custom_signing_key: SUPABASE_JWT_SECRET,
      signing_algorithm: 'HS256',
    };

    let result;

    if (existingTemplate) {
      // Update existing template
      console.log('⚠️  Supabase JWT template already exists!');
      console.log(`   Template ID: ${existingTemplate.id}`);
      console.log('\n   Updating existing template...');

      const updateOptions = {
        ...baseOptions,
        path: `/v1/jwt_templates/${existingTemplate.id}`,
        method: 'PATCH',
      };

      const updateResponse = await makeRequest(updateOptions, templateConfig);
      result = updateResponse.data;

      console.log('✅ JWT template updated successfully!');
    } else {
      // Create new template
      console.log('📝 Creating new Supabase JWT template...');

      const createOptions = {
        ...baseOptions,
        path: '/v1/jwt_templates',
        method: 'POST',
      };

      const createResponse = await makeRequest(createOptions, templateConfig);
      result = createResponse.data;

      console.log('✅ JWT template created successfully!');
    }

    // Display results
    console.log(`   Template ID: ${result.id}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Algorithm: ${result.signing_algorithm}`);
    console.log(`   Lifetime: ${result.lifetime} seconds`);

    console.log('\n🎉 Success! Your Clerk JWT template for Supabase is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the integration using SupabaseTestScreen.tsx');
    console.log('2. Start your app: npx expo start');
    console.log('3. Sign in and navigate to the test screen');
    console.log('4. All tests should pass ✅');

  } catch (error) {
    console.error('❌ Error creating JWT template:', error.message || error);

    if (error.status === 401) {
      console.log('\n💡 Your Clerk Secret Key is invalid or expired');
      console.log('   Please check that you copied the correct key');
    } else if (error.status === 403) {
      console.log('\n💡 Your Clerk Secret Key doesn\'t have permission');
      console.log('   Make sure you\'re using the secret key (not publishable key)');
    } else if (error.status === 422) {
      console.log('\n💡 Invalid template configuration');
      console.log('   This might be due to API changes. Please check the Clerk documentation.');
      console.log('   Error details:', error.message);
    } else {
      console.log('\n💡 Unexpected error occurred');
      console.log('   Error details:', error);
    }

    process.exit(1);
  }
}

// Run the script
createSupabaseJWTTemplate();
