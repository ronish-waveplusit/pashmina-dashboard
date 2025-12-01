import { jwtDecode } from "jwt-decode";
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../../constants/common";

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiry?: number;
  refreshTokenExpiry?: number;
  refreshTokenExp?: string; // Added for compatibility
  isPasswordForceful?: boolean;
  isProfileComplete?: boolean;
}

interface DecodedToken {
  exp: number;
  email?: string;
  iat?: number;
  sub?: string;
}

/**
 * Check if a token is expired
 * @param token - JWT token string
 * @param exp - Optional expiry timestamp in milliseconds
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string, exp?: number): boolean => {
  if (exp) {
    return exp < Date.now();
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // JWT exp is in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Set metadata for user session
 */
export const setMeta = (data: any) => {
  const forceful =
    data.isPasswordForceful ||
    data.loginResponse?.isPasswordForceful?.toUpperCase() === "Y";

  localStorage.setItem("_meta_pwd_frc", forceful ? "1" : "0");
  localStorage.setItem("_meta_complete", data.isProfileComplete ? "1" : "0");
};

/**
 * Get metadata for user session
 */
export const getMeta = () => {
  const isPasswordForceful = Boolean(
    Number(localStorage.getItem("_meta_pwd_frc"))
  );
  const isProfileComplete = Boolean(
    Number(localStorage.getItem("_meta_complete"))
  );

  return {
    isPasswordForceful,
    isProfileComplete,
  };
};

/**
 * Get all tokens and metadata from storage
 */
export const getTokens = () => {
  return {
    token: localStorage.getItem(ACCESS_TOKEN) || "",
    accessToken: localStorage.getItem(ACCESS_TOKEN) || "",
    refreshToken: localStorage.getItem(REFRESH_TOKEN) || "",
    refreshTokenExp: localStorage.getItem(REFRESH_TOKEN_EXPIRES_IN) || "",
    meta: getMeta(),
  };
};

/**
 * Store tokens and metadata in localStorage
 */
export const setTokens = (data: TokenData) => {
  console.log("📝 setTokens called with:", data);

  // Store access token
  if (data.accessToken) {
    localStorage.setItem(ACCESS_TOKEN, data.accessToken);
    console.log("✅ Saved accessToken");
  }

  // Store refresh token
  if (data.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN, data.refreshToken);
    console.log("✅ Saved refreshToken");
  }

  // Store refresh token expiry
  // Handle multiple possible formats: refreshTokenExpiry, refreshTokenExp
  const refreshExpiry = data.refreshTokenExp || data.refreshTokenExpiry;
  
  if (refreshExpiry) {
    // If it's a string, store it directly
    if (typeof refreshExpiry === 'string') {
      localStorage.setItem(REFRESH_TOKEN_EXPIRES_IN, refreshExpiry);
    } else {
      // If it's a number, ensure it's in milliseconds
      const expiryInMs = refreshExpiry > Date.now() 
        ? refreshExpiry 
        : Date.now() + refreshExpiry * 1000;
      localStorage.setItem(REFRESH_TOKEN_EXPIRES_IN, expiryInMs.toString());
    }
    console.log("✅ Saved refreshTokenExpiry");
  }

  // Set metadata if provided
  if (
    data.isPasswordForceful !== undefined ||
    data.isProfileComplete !== undefined
  ) {
    setMeta(data);
  }
};

/**
 * Check if the entire session is expired (both access and refresh tokens)
 */
export const isSessionExpired = (): boolean => {
  const { token, refreshToken, refreshTokenExp } = getTokens();

  // If access token is missing, session is expired
  if (!token) {
    console.log("❌ Session expired: No access token");
    return true;
  }

  // If no refresh token, check access token only
  if (!refreshToken || !refreshTokenExp) {
    console.log("⚠️ No refresh token, checking access token only");
    return isTokenExpired(token);
  }

  // Check if refresh token is expired
  const isRefreshExpired = isTokenExpired(
    refreshToken,
    Number(refreshTokenExp)
  );

  if (isRefreshExpired) {
    console.log("❌ Session expired: Refresh token expired");
  }

  // Session is expired only if refresh token is expired
  return isRefreshExpired;
};

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN);
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN);
}

/**
 * Get refresh token expiry time
 */
export function getRefreshTokenExpiry(): number {
  const expiryTime = localStorage.getItem(REFRESH_TOKEN_EXPIRES_IN);
  return Number(expiryTime) || 0;
}

/**
 * Set access token to storage
 */
export function setAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
}

/**
 * Set refresh token to storage
 */
export function setRefreshToken(refreshToken: string): void {
  localStorage.setItem(REFRESH_TOKEN, refreshToken);
}

/**
 * Set refresh token expiry time
 */
export function setRefreshTokenExpiry(expiry: number): void {
  // Ensure expiry is in milliseconds
  const expiryInMs = expiry > Date.now() ? expiry : Date.now() + expiry * 1000;
  localStorage.setItem(REFRESH_TOKEN_EXPIRES_IN, expiryInMs.toString());
}

/**
 * Get logged in user info from storage
 */
export function getUserInfo(): any {
  try {
    const data = localStorage.getItem("persist:auth");
    if (!data) return null;

    const parsedData = JSON.parse(data);
    if (parsedData.user) {
      return JSON.parse(parsedData.user);
    }
    return null;
  } catch (error) {
    console.error("Error parsing user info:", error);
    return null;
  }
}

/**
 * Get email from access token
 */
export function getEmailFromToken(): string | null {
  try {
    const token = getAccessToken();
    if (!token) return null;

    const decoded: DecodedToken = jwtDecode(token);
    return decoded.email || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Check if access token needs refresh (expired or about to expire)
 */
export function shouldRefreshToken(): boolean {
  const accessToken = getAccessToken();
  if (!accessToken) return false;

  try {
    const decoded: DecodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    // Refresh if token expires within next 5 minutes (300 seconds)
    return decoded.exp - currentTime < 300;
  } catch (error) {
    return true; // If we can't decode, we should refresh
  }
}

/**
 * Clear all authentication data and redirect to login
 */
export function clearAuthData(): void {
  // Remove all auth-related items
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN_EXPIRES_IN);
  localStorage.removeItem("_meta_pwd_frc");
  localStorage.removeItem("_meta_complete");
  localStorage.removeItem("persist:root");
  localStorage.removeItem("persist:auth");
}

/**
 * Logout user and redirect to login page
 */
export async function logout(): Promise<void> {
  try {
    clearAuthData();

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.hash = "/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local data even if API call fails
    clearAuthData();
    if (typeof window !== "undefined") {
      window.location.hash = "/login";
    }
  }
}

/**
 * Initialize tokens from login response
 */
export function initializeAuth(loginResponse: any): void {
  const {
    token,
    accessToken,
    refreshToken,
    accessTokenExpiry,
    refreshTokenExpiry,
    user,
    permissions,
    groups,
  } = loginResponse;

  // Store tokens - use 'token' field if 'accessToken' not present
  setTokens({
    accessToken: accessToken || token,
    refreshToken,
    accessTokenExpiry,
    refreshTokenExpiry,
    isPasswordForceful: loginResponse.isPasswordForceful,
    isProfileComplete: loginResponse.isProfileComplete,
  });

  // Store user info if needed
  if (user) {
    localStorage.setItem(
      "persist:auth",
      JSON.stringify({
        user: JSON.stringify(user),
        permissions: JSON.stringify(permissions || []),
        groups: JSON.stringify(groups || []),
      })
    );
  }
}