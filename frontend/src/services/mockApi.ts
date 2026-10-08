/**
 * Mock transport. Every service goes through `mock()` so that swapping in real
 * FastAPI calls later only means replacing this one helper (e.g. with fetch()).
 */
export const MOCK_LATENCY_MS = 350;

export function mock<T>(data: T, delay = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export function mockFail<T = never>(message: string, delay = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}
