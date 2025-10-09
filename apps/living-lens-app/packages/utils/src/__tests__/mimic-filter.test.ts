import { validateBuildRequest } from '../mimic-filter';

describe('validateBuildRequest', () => {
  describe('Happy Path - Valid Inputs', () => {
    it('should validate a valid web project', () => {
      const result = validateBuildRequest('web', 'my-project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate a valid mobile project', () => {
      const result = validateBuildRequest('mobile', 'mobile-app');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate a valid lib project', () => {
      const result = validateBuildRequest('lib', 'my-library');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate a valid api project', () => {
      const result = validateBuildRequest('api', 'backend-api');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should accept project names with uppercase letters', () => {
      const result = validateBuildRequest('web', 'MyProject');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should accept project names with numbers', () => {
      const result = validateBuildRequest('web', 'project123');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should accept project names with hyphens', () => {
      const result = validateBuildRequest('web', 'my-awesome-project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should accept project names with underscores', () => {
      const result = validateBuildRequest('web', 'my_awesome_project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should accept project names with mixed valid characters', () => {
      const result = validateBuildRequest('web', 'My_Project-123');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should accept single character project names', () => {
      const result = validateBuildRequest('web', 'a');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should accept very long project names with valid characters', () => {
      const longName = 'a'.repeat(100);
      const result = validateBuildRequest('web', longName);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });
  });

  describe('Error Cases - Missing or Invalid Parameters', () => {
    it('should reject when type is missing (undefined)', () => {
      const result = validateBuildRequest(undefined, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is missing (undefined)', () => {
      const result = validateBuildRequest('web', undefined);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when both type and name are missing', () => {
      const result = validateBuildRequest(undefined, undefined);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is null', () => {
      const result = validateBuildRequest(null, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is null', () => {
      const result = validateBuildRequest('web', null);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is not a string (number)', () => {
      const result = validateBuildRequest(123, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is not a string (number)', () => {
      const result = validateBuildRequest('web', 456);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is not a string (boolean)', () => {
      const result = validateBuildRequest(true, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is not a string (boolean)', () => {
      const result = validateBuildRequest('web', false);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is not a string (object)', () => {
      const result = validateBuildRequest({ type: 'web' }, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is not a string (object)', () => {
      const result = validateBuildRequest('web', { name: 'my-project' });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is not a string (array)', () => {
      const result = validateBuildRequest(['web'], 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is not a string (array)', () => {
      const result = validateBuildRequest('web', ['my-project']);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });
  });

  describe('Error Cases - Invalid Type', () => {
    it('should reject invalid type "desktop"', () => {
      const result = validateBuildRequest('desktop', 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'desktop' is not allowed.");
    });

    it('should reject invalid type "backend"', () => {
      const result = validateBuildRequest('backend', 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'backend' is not allowed.");
    });

    it('should reject invalid type "frontend"', () => {
      const result = validateBuildRequest('frontend', 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'frontend' is not allowed.");
    });

    it('should reject empty string type', () => {
      const result = validateBuildRequest('', 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject type with uppercase letters (case-sensitive)', () => {
      const result = validateBuildRequest('Web', 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'Web' is not allowed.");
    });

    it('should reject type with mixed case', () => {
      const result = validateBuildRequest('WEB', 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'WEB' is not allowed.");
    });
  });

  describe('Error Cases - Invalid Name Characters', () => {
    it('should reject name with spaces', () => {
      const result = validateBuildRequest('web', 'my project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my project' contains invalid characters.");
    });

    it('should reject name with special characters (@)', () => {
      const result = validateBuildRequest('web', 'my@project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my@project' contains invalid characters.");
    });

    it('should reject name with special characters (#)', () => {
      const result = validateBuildRequest('web', 'my#project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my#project' contains invalid characters.");
    });

    it('should reject name with special characters ($)', () => {
      const result = validateBuildRequest('web', 'my$project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my$project' contains invalid characters.");
    });

    it('should reject name with dots', () => {
      const result = validateBuildRequest('web', 'my.project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my.project' contains invalid characters.");
    });

    it('should reject name with forward slashes', () => {
      const result = validateBuildRequest('web', 'my/project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my/project' contains invalid characters.");
    });

    it('should reject empty string name', () => {
      const result = validateBuildRequest('web', '');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });
  });

  describe('Edge Cases - Boundary Conditions', () => {
    it('should handle whitespace-only type', () => {
      const result = validateBuildRequest('   ', 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type '   ' is not allowed.");
    });

    it('should handle whitespace-only name', () => {
      const result = validateBuildRequest('web', '   ');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name '   ' contains invalid characters.");
    });

    it('should handle name starting with hyphen', () => {
      const result = validateBuildRequest('web', '-project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should handle name ending with hyphen', () => {
      const result = validateBuildRequest('web', 'project-');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should handle name starting with underscore', () => {
      const result = validateBuildRequest('web', '_project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should handle name ending with underscore', () => {
      const result = validateBuildRequest('web', 'project_');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should handle name starting with number', () => {
      const result = validateBuildRequest('web', '123project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should handle name with only numbers', () => {
      const result = validateBuildRequest('web', '12345');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should handle name with consecutive hyphens', () => {
      const result = validateBuildRequest('web', 'my--project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should handle name with consecutive underscores', () => {
      const result = validateBuildRequest('web', 'my__project');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });
  });

  describe('Corner Cases - Type Coercion and Special Values', () => {
    it('should reject when type is an empty object', () => {
      const result = validateBuildRequest({}, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is an empty object', () => {
      const result = validateBuildRequest('web', {});

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is an empty array', () => {
      const result = validateBuildRequest([], 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is an empty array', () => {
      const result = validateBuildRequest('web', []);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is zero', () => {
      const result = validateBuildRequest(0, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is zero', () => {
      const result = validateBuildRequest('web', 0);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when type is NaN', () => {
      const result = validateBuildRequest(NaN, 'my-project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should reject when name is NaN', () => {
      const result = validateBuildRequest('web', NaN);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });
  });
});
