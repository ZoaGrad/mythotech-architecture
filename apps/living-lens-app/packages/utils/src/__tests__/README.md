# Unit Tests for mimic-filter.ts

This directory contains comprehensive unit tests for the `validateBuildRequest` function in `mimic-filter.ts`.

## Test Coverage

The test suite covers:

### 1. **Happy Path - Valid Inputs**
- Valid project types: `web`, `mobile`, `lib`, `api`
- Project names with uppercase letters
- Project names with numbers
- Project names with hyphens
- Project names with underscores
- Project names with mixed valid characters
- Single character project names
- Very long project names (100+ characters)

### 2. **Error Cases - Missing or Invalid Parameters**
- Missing type (undefined)
- Missing name (undefined)
- Both type and name missing
- Null values for type and name
- Non-string types:
  - Numbers
  - Booleans
  - Objects
  - Arrays

### 3. **Error Cases - Invalid Type**
- Invalid type values: `desktop`, `backend`, `frontend`
- Empty string type
- Case-sensitive type validation: `Web`, `WEB`

### 4. **Error Cases - Invalid Name Characters**
- Names with spaces
- Names with special characters: `@`, `#`, `$`
- Names with dots (`.`)
- Names with forward slashes (`/`)
- Empty string name

### 5. **Edge Cases - Boundary Conditions**
- Whitespace-only type and name
- Names starting/ending with hyphens
- Names starting/ending with underscores
- Names starting with numbers
- Names with only numbers
- Names with consecutive hyphens or underscores

### 6. **Corner Cases - Type Coercion and Special Values**
- Empty objects and arrays
- Zero values
- NaN values

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
npm test mimic-filter.test.ts
```

### Run Specific Test Suite

```bash
npm test -- -t "Happy Path"
```

## Test Structure

Each test follows this pattern:

1. **Arrange**: Set up input parameters
2. **Act**: Call the `validateBuildRequest` function
3. **Assert**: Verify the expected validation result

## Function Under Test

The `validateBuildRequest` function validates build requests with the following rules:

- **Type**: Must be one of `['web', 'mobile', 'lib', 'api']`
- **Name**: Must match the regex pattern `/^[a-zA-Z0-9-_]+$/`
- Both parameters must be non-empty strings

## Expected Coverage

After running these tests, the coverage should be:

- **Line Coverage**: 100%
- **Statement Coverage**: 100%
- **Function Coverage**: 100%
- **Branch Coverage**: 100%
