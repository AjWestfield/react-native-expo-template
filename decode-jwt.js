// Decode the service_role JWT to extract the signing secret
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ2l2eHhmdW10cnBxd2Nnd3RoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg1NDIzMSwiZXhwIjoyMDc4NDMwMjMxfQ.Srwd6QJcKJl70yHs7orhWBnurX5m4AdonpIuJYXqWi0';

const [header, payload, signature] = jwt.split('.');

console.log('\nHeader:', JSON.parse(Buffer.from(header, 'base64url').toString()));
console.log('\nPayload:', JSON.parse(Buffer.from(payload, 'base64url').toString()));
console.log('\nSignature (base64url):', signature);

// Try to verify with the legacy secret
const crypto = require('crypto');
const legacySecret = 'GLIKrvVMYDhVweKvaXUu3NAJ/uvzI5AGgElnB/yHKJdkDXfQT3OB1BdFeV5uARU4fxTREThMXfsuv/n2FYNWPg==';

const testSignature = crypto
  .createHmac('sha256', Buffer.from(legacySecret, 'base64'))
  .update(`${header}.${payload}`)
  .digest('base64url');

console.log('\nExpected signature:', signature);
console.log('Generated signature:', testSignature);
console.log('Match:', signature === testSignature);

if (signature === testSignature) {
  console.log('\n✅ Legacy JWT secret is CORRECT!');
  console.log('\nUse this in Clerk JWT template:');
  console.log(legacySecret);
} else {
  console.log('\n❌ Legacy JWT secret does NOT match');
  console.log('\nThe JWT signing secret has changed. Need to get the correct one from Supabase.');
}
