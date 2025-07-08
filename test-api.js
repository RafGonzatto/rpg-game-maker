#!/usr/bin/env node

/**
 * Manual API Test Script
 * Tests all API endpoints to ensure they're working correctly
 */

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${endpoint}: ${response.status}`);
    console.log(`   Response:`, data);
    return { success: true, data };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}: Error`);
    console.log(`   Error:`, error.message);
    return { success: false, error };
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test factions endpoint
  await testEndpoint('/factions');
  
  // Test types endpoint
  await testEndpoint('/types');
  
  // Test quests endpoint
  await testEndpoint('/quests');
  
  console.log('\n✅ API Tests completed!');
}

if (require.main === module) {
  runTests();
}
