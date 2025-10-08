const ALLOWED_TYPES = ['web', 'mobile', 'lib', 'api'];
const PROJECT_NAME_REGEX = /^[a-zA-Z0-9-_]+$/;

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateBuildRequest(type: any, name: any): ValidationResult {
  if (!type || !name || typeof type !== 'string' || typeof name !== 'string') {
    return { isValid: false, message: 'Bad Request: Missing or invalid \"type\" or \"name\".' };
  }

  if (!ALLOWED_TYPES.includes(type)) {
    return { isValid: false, message: `Mimic Filter Violation: Type '${type}' is not allowed.` };
  }

  if (!PROJECT_NAME_REGEX.test(name)) {
    return { isValid: false, message: `Mimic Filter Violation: Name '${name}' contains invalid characters.` };
  }

  return { isValid: true, message: 'Validation successful.' };
}
