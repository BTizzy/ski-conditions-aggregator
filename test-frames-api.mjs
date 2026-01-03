#!/usr/bin/env node

// Test the frames API route directly
import { GET } from './app/api/radar/frames/route.ts';

async function testFramesAPI() {
  console.log('Testing frames API route...');

  try {
    const request = new Request('http://localhost:3000/api/radar/frames');
    const response = await GET(request);

    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Frames returned:', data.frames?.length || 0);

      if (data.frames?.length > 0) {
        console.log('Sample frame:', data.frames[0]);
        console.log('✅ Frames API test passed!');
      }
    } else {
      console.log('❌ API returned error status');
    }
  } catch (error) {
    console.error('❌ Frames API test failed:', error.message);
  }
}

testFramesAPI();