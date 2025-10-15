# AlloBrico End-to-End Tests

This directory contains comprehensive end-to-end tests for the AlloBrico application using Playwright.

## Test Structure

### `complete-journey.spec.ts`
Tests the complete user journey from authentication through messaging:
- Client login → browse workers → start conversation
- Worker login → view dashboard → respond to requests
- Authentication flow validation
- Message badge updates
- Responsive design (mobile)
- Error handling
- Accessibility (keyboard navigation)

### `admin-dashboard.spec.ts`
Tests admin functionality:
- Admin login and dashboard overview
- User management (view, search, status changes)
- Request monitoring and filtering
- Category management

### `worker-profile.spec.ts`
Tests worker registration and profile management:
- Worker registration flow
- Profile completion and updates
- Certification upload
- Portfolio management
- Availability scheduling

## Running Tests

### Prerequisites
- Node.js and npm installed
- Playwright browsers installed: `npx playwright install`
- Backend and frontend servers running

### Commands

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test complete-journey.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests in debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### Test Configuration

Tests are configured in `playwright.config.ts` with:
- Multi-browser support (Chromium, Firefox, Webkit)
- Mobile device emulation
- Web server setup for both frontend and backend
- Screenshot and video capture on failure

## Test Data

Tests use mocked API responses to ensure consistent test data:
- User authentication
- Worker and client profiles
- Service categories
- Messages and conversations
- Admin statistics

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
- name: Run E2E Tests
  run: |
    cd frontend
    npm run test:e2e
```

## Best Practices

1. **API Mocking**: All external API calls are mocked for reliable testing
2. **Isolation**: Each test is independent and can run in parallel
3. **Realistic Scenarios**: Tests cover actual user workflows
4. **Cross-browser**: Tests run on multiple browsers and devices
5. **Accessibility**: Includes keyboard navigation tests

## Debugging

- Use `--debug` flag to step through tests interactively
- Check `test-results/` directory for screenshots and videos
- Use `page.pause()` in test code for manual debugging
- View detailed logs with `--reporter=line`

## Test Coverage

Current test coverage includes:
- ✅ User authentication (client, worker, admin)
- ✅ Dashboard functionality
- ✅ Messaging system
- ✅ Profile management
- ✅ Admin panel
- ✅ Responsive design
- ✅ Error handling
- ✅ Accessibility

## Future Enhancements

- Real API integration tests
- Performance testing
- Visual regression testing
- API contract testing