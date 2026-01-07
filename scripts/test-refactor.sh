#!/bin/bash
# Quick test script for refactored branch

echo "🧪 Running test suite..."
echo ""

echo "1️⃣  API Client Tests"
npm test api-client.test.ts -- --run || exit 1
echo ""

echo "2️⃣  Cache Strategy Tests"
npm test cache-strategy.test.ts -- --run || exit 1
echo ""

echo "3️⃣  Integration Tests"
npm test integration.test.ts -- --run || exit 1
echo ""

echo "✅ All tests passed!"
echo ""
echo "Next: npm run dev"
echo "Then: Open http://localhost:3000"
