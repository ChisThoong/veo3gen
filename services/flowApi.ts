import type { Project, Video } from '../types';

// The base URL of the Flow API. All requests will be made directly to this endpoint.
const API_BASE_URL = 'https://aisandbox-pa.googleapis.com';

/**
 * A helper function to make authenticated requests to the Flow API.
 * It automatically adds the Authorization header and handles response errors.
 * @param endpoint The API endpoint to call (e.g., '/v1/projects').
 * @param token The user's Bearer token.
 * @param options Standard fetch options.
 * @returns The JSON response from the API.
 */
const flowFetch = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  let response;
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      // This is a strong indicator of a CORS issue, network problem, or DNS failure.
      throw new Error(
        'Network request failed. This may be due to a CORS policy on the API server, a network error, or an incorrect API endpoint. Please check your network connection and the API configuration.'
      );
    }
    // Re-throw other unexpected errors
    throw error;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      // Try to parse a more specific error message from the response body
      const errorJson = JSON.parse(errorBody);
      if (errorJson.error?.message) {
        errorMessage += ` - ${errorJson.error.message}`;
      } else if (errorJson.message) {
        errorMessage += ` - ${errorJson.message}`;
      }
    } catch {
      // If body is not JSON or parsing fails, use the raw text
      if (errorBody) {
        errorMessage += ` - ${errorBody}`;
      }
    }
    throw new Error(errorMessage);
  }

  // Handle responses with no content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

/**
 * Validates a token by attempting to fetch the user's projects.
 * If the request is successful, the function completes. If not, it throws a detailed error.
 * @param token The Bearer token to validate.
 */
export const validateToken = async (token: string): Promise<void> => {
  try {
    // We only care about this call succeeding. We don't need the result.
    // The endpoint to list credits or another lightweight check is suitable here.
    await flowFetch('/v1/credits?key=dummy-key-since-auth-is-bearer', token);
  } catch (error) {
    console.error("Token validation failed:", error);
    // Re-throw the error so the UI layer can display the specific message from flowFetch
    throw error;
  }
};

// --- PROJECTS ---
export const getProjects = async (token: string): Promise<Project[]> => {
  // Assuming the actual API returns an object with a 'projects' key
  const response = await flowFetch('/v1/projects', token);
  return response.projects || [];
};

export const createProject = async (token: string, name: string): Promise<Project> => {
  return await flowFetch('/v1/projects', token, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

// --- VIDEOS ---
export const getVideos = async (token: string, projectId: string): Promise<Video[]> => {
  // NOTE: The endpoint structure '/v1/projects/{projectId}/videos' is a common REST pattern.
  // This may need to be adjusted based on the actual Flow API specification.
  const response = await flowFetch(`/v1/projects/${projectId}/videos`, token);
  return response.videos || [];
};

export const createVideo = async (token: string, projectId: string, prompt: string, model: string, aspectRatio: string): Promise<Video> => {
  const payload = {
    prompt,
    model,
    aspectRatio,
  };
  // NOTE: The endpoint structure is an assumption.
  return await flowFetch(`/v1/projects/${projectId}/videos`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Fetches the latest status and data for a single video.
 * Used for polling processing videos.
 * @param token The user's Bearer token.
 * @param videoId The ID of the video to check.
 * @returns The full, updated Video object.
 */
export const getVideoStatus = async (token: string, videoId: string): Promise<Video> => {
  // NOTE: This assumes an endpoint exists to fetch a single video by its ID.
  // The polling logic in App.tsx expects an object with `id` and `status`. Returning the full Video object satisfies this.
  return await flowFetch(`/v1/videos/${videoId}`, token);
};