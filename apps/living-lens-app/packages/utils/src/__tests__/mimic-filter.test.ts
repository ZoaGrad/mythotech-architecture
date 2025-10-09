import { validateBuildRequest } from '../mimic-filter';

describe('validateBuildRequest', () => {
  describe('Happy Path - Valid Requests', () => {
    it('should validate a valid web project with alphanumeric name', () => {
      const result = validateBuildRequest('web', 'myproject123');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate a valid mobile project', () => {
      const result = validateBuildRequest('mobile', 'mobile-app');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate a valid lib project', () => {
      const result = validateBuildRequest('lib', 'my_library');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate a valid api project', () => {
      const result = validateBuildRequest('api', 'api-service');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate project name with hyphens', () => {
      const result = validateBuildRequest('web', 'my-project-name');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate project name with underscores', () => {
      const result = validateBuildRequest('web', 'my_project_name');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate project name with mixed alphanumeric and special chars', () => {
      const result = validateBuildRequest('web', 'Project-123_Test');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate single character project name', () => {
      const result = validateBuildRequest('web', 'a');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });

    it('should validate numeric-only project name', () => {
      const result = validateBuildRequest('web', '12345');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Validation successful.');
    });
  });

  describe('Error Cases - Missing or Invalid Parameters', () => {
    it('should return error when type is missing (undefined)', () => {
      const result = validateBuildRequest(undefined, 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when name is missing (undefined)', () => {
      const result = validateBuildRequest('web', undefined);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when both type and name are missing', () => {
      const result = validateBuildRequest(undefined, undefined);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when type is null', () => {
      const result = validateBuildRequest(null, 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when name is null', () => {
      const result = validateBuildRequest('web', null);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when type is not a string (number)', () => {
      const result = validateBuildRequest(123, 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when name is not a string (number)', () => {
      const result = validateBuildRequest('web', 456);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when type is not a string (object)', () => {
      const result = validateBuildRequest({ type: 'web' }, 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when name is not a string (array)', () => {
      const result = validateBuildRequest('web', ['myproject']);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });

    it('should return error when type is not a string (boolean)', () => {
      const result = validateBuildRequest(true, 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Bad Request: Missing or invalid "type" or "name".');
    });
  });

  describe('Error Cases - Invalid Type', () => {
    it('should return error for invalid type "desktop"', () => {
      const result = validateBuildRequest('desktop', 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'desktop' is not allowed.");
    });

    it('should return error for invalid type "backend"', () => {
      const result = validateBuildRequest('backend', 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'backend' is not allowed.");
    });

    it('should return error for empty string type', () => {
      const result = validateBuildRequest('', 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type '' is not allowed.");
    });

    it('should return error for type with wrong case "WEB"', () => {
      const result = validateBuildRequest('WEB', 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'WEB' is not allowed.");
    });

    it('should return error for type with wrong case "Mobile"', () => {
      const result = validateBuildRequest('Mobile', 'myproject');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Type 'Mobile' is not allowed.");
    });
  });

  describe('Error Cases - Invalid Name Characters', () => {
    it('should return error for name with spaces', () => {
      const result = validateBuildRequest('web', 'my project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my project' contains invalid characters.");
    });

    it('should return error for name with special characters (@)', () => {
      const result = validateBuildRequest('web', 'my@project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my@project' contains invalid characters.");
    });

    it('should return error for name with special characters (#)', () => {
      const result = validateBuildRequest('web', 'project#123');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'project#123' contains invalid characters.");
    });

    it('should return error for name with dots', () => {
      const result = validateBuildRequest('web', 'my.project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my.project' contains invalid characters.");
    });

    it('should return error for empty string name', () => {
      const result = validateBuildRequest('web', '');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name '' contains invalid characters.");
    });

    it('should return error for name with forward slash', () => {
      const result = validateBuildRequest('web', 'my/project');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Mimic Filter Violation: Name 'my/project' contains invalid characters.");
    });
  });
});
