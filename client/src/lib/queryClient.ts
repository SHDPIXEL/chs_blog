import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Special handling for auth errors
    if (res.status === 401 || res.status === 403) {
      // If the token is expired or invalid, remove it
      if (res.status === 403) {
        console.warn("Authentication token is invalid or expired. Clearing token...");
        localStorage.removeItem("blogcms_token");
      }
      
      // Get the actual error message if available
      let errorText;
      try {
        const errorData = await res.json();
        errorText = errorData.message || "Authentication required. Please log in again.";
      } catch (e) {
        errorText = "Authentication required. Please log in again.";
      }
      
      console.error(`Authentication error (${res.status}):`, errorText);
      throw new Error(`${res.status}: ${errorText}`);
    }
    
    // For other errors, try to get detailed error message
    try {
      // Clone the response first to prevent "body stream already read" errors 
      const resClone = res.clone();
      let errorText;
      
      try {
        const errorData = await resClone.json();
        errorText = errorData.message || res.statusText;
        console.error(`API error (${res.status}):`, errorText, errorData);
      } catch (jsonError) {
        // If can't parse as JSON, use text
        errorText = await res.text() || res.statusText;
        console.error(`API error (${res.status}) - Non-JSON:`, errorText);
      }
      
      throw new Error(`${res.status}: ${errorText}`);
    } catch (e) {
      // Fallback error handling if all else fails
      console.error(`API error (${res.status}) - Fallback:`, e);
      throw new Error(`${res.status}: ${res.statusText || "Unknown error"}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get token from localStorage
  const token = localStorage.getItem("blogcms_token");
  
  // Create headers
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  // Debug log for bulk actions
  if (url.includes('bulk')) {
    console.log('Sending request to bulk endpoint:', url);
    console.log('Request data:', data);
    console.log('Request data JSON:', JSON.stringify(data));
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get token from localStorage
    const token = localStorage.getItem("blogcms_token");
    
    // Create headers
    const headers: Record<string, string> = {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
