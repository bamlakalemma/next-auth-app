const API_BASE_URL = 'https://akil-backend.onrender.com';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  OTP: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  token?: string;
}

export async function signup(data: SignupData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || result.error || 'Signup failed',
      };
    }

    return {
      success: true,
      data: result,
      message: result.message || 'Signup successful',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function signin(data: SigninData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      // Try to parse as JSON, fallback to text
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text || 'Sign in failed' };
      }
    }

    // Log the response for debugging (remove in production)
    console.log('Signin API Response:', { 
      status: response.status, 
      statusText: response.statusText,
      result 
    });

    if (!response.ok) {
      // Handle different error response structures
      const errorMessage = 
        result.message || 
        result.error || 
        result.error?.message ||
        result.msg ||
        (typeof result === 'string' ? result : 'Sign in failed. Please check your credentials.');
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Try to extract token from various possible locations
    const token = 
      result.token || 
      result.accessToken || 
      result.data?.token ||
      result.data?.accessToken ||
      result.access_token ||
      result.access_token;

    // If we have a successful response but no token, still consider it a success
    // Some APIs might return user data without a token in the response
    return {
      success: true,
      data: result.data || result.user || result,
      token: token,
      message: result.message || result.msg || 'Sign in successful',
    };
  } catch (error) {
    console.error('Signin error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function verifyEmail(data: VerifyEmailData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || result.error || 'Email verification failed',
      };
    }

    return {
      success: true,
      data: result,
      message: result.message || 'Email verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

