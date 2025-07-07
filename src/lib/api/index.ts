// Central API exports
export { default as authApi } from './auth';
export { default as jobsApi } from './jobs';
export { default as candidatesApi } from './candidates';
export { default as evaluationsApi } from './evaluations';

export {
  apiClient,
  getAccessToken,
  getCurrentUser,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  uploadFile,
  uploadFiles,
} from './client';

// API error handling utilities
export const isAPIError = (error: unknown): error is { message: string; status_code: number } => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    'status_code' in error &&
    typeof (error as any).message === 'string' &&
    typeof (error as any).status_code === 'number'
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isAPIError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};