// Central API exports
export { default as authApi } from './auth';
export { default as jobsApi } from './jobs';
export { default as candidatesApi } from './candidates';
export { default as evaluationsApi } from './evaluations';

export {
  apiClient,
  setAccessToken,
  getAccessToken,
  clearTokens,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  uploadFile,
  uploadFiles,
} from './client';

// API error handling utilities
export const isAPIError = (error: any): error is { message: string; status_code: number } => {
  return error && typeof error.message === 'string' && typeof error.status_code === 'number';
};

export const getErrorMessage = (error: any): string => {
  if (isAPIError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};