// [JAVARI-FIX] .github/workflows/e2e-tests.yml
name: Henderson Standards E2E Tests

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Run E2E tests
        run: npm run e2e
        env:
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: e2e-test-results
          path: tests/e2e/results/*.json

      - name: Notify failure
        if: failure()
        run: echo "E2E tests failed, check logs for details."