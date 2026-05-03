/**
 * Safely extract error message from various error types
 * Handles error objects, Pydantic validation errors, HTTP errors, etc.
 */
export function getErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle axios/HTTP errors
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // If detail is a string, return it
    if (typeof detail === 'string') {
      return detail;
    }
    
    // If detail is an array of validation errors (Pydantic)
    if (Array.isArray(detail)) {
      return detail
        .map(err => {
          if (typeof err === 'string') return err;
          if (err?.msg) return err.msg;
          if (err?.detail) return err.detail;
          return JSON.stringify(err);
        })
        .join(', ');
    }
    
    // If detail is an object with a message/msg property
    if (typeof detail === 'object' && detail !== null) {
      if (detail.msg) return detail.msg;
      if (detail.message) return detail.message;
      if (detail.error) return detail.error;
      // Avoid rendering the entire object
      return defaultMessage;
    }
  }

  // Handle error.response.data as string
  if (typeof error?.response?.data === 'string') {
    return error.response.data;
  }

  // Handle error.message
  if (typeof error?.message === 'string') {
    return error.message;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback to default message if we can't extract anything
  return defaultMessage;
}
