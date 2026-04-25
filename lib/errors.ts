export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.code === 'PGRST116') {
    return new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  if (error?.message?.includes('duplicate key')) {
    return new AppError('Resource already exists', 409, 'DUPLICATE');
  }

  if (error?.message?.includes('violates foreign key')) {
    return new AppError('Invalid reference', 400, 'INVALID_REFERENCE');
  }

  console.error('Unhandled error:', error);
  return new AppError('Internal server error', 500, 'INTERNAL_ERROR');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}