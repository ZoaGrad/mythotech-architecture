# API Tests for /api/logs

This directory contains comprehensive unit tests for the `/api/logs` endpoint.

## Test Coverage

The test suite covers:

### 1. **Happy Path - Successful Requests**
- Default pagination (page=1, limit=10)
- Custom pagination parameters
- Empty logs array
- Various page numbers and limits

### 2. **Edge Cases - Pagination Calculations**
- Total pages calculation when total is exactly divisible by limit
- Total pages calculation when total is not divisible by limit
- Limit of 1
- Very large limit values

### 3. **Error Cases - HTTP Method Validation**
- POST method returns 405
- PUT method returns 405
- DELETE method returns 405
- PATCH method returns 405

### 4. **Error Cases - Database Errors**
- Database connection failures
- Count query failures

### 5. **Corner Cases - Invalid Input Handling**
- NaN page parameter
- Negative page numbers
- Zero page number

## Running the Tests

### Install Dependencies

First, install the required dependencies:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npm test logs.test.ts
```

### Run Specific Test Suite

```bash
npm test -- -t "Happy Path"
```

## Test Structure

Each test follows this pattern:

1. **Arrange**: Set up mock data and request/response objects
2. **Act**: Call the handler function
3. **Assert**: Verify the expected behavior

## Mocking

The tests use Jest mocks for:
- Prisma client (`governanceLog.findMany` and `governanceLog.count`)
- Next.js API request and response objects
- Console.error to prevent cluttering test output

