import { ACCESS_TOKEN, EXPIRES_IN, REFRESH_TOKEN } from "../constants/common";

interface PersistParams {
  token: string;
  refreshToken: string;
  expiryTime: number;
}

/**
 * Persist token to storage.
 *
 * @param {{accessToken, refreshToken}} params
 */
export function persist({ token, refreshToken, expiryTime }: PersistParams) {
  setAccessToken(token);
  setRefreshToken(refreshToken);
  setExpiryTime(expiryTime);
}

/**
 * Get access token from storage.
 *
 * @returns {string}
 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN);
}
/**
 * Get logged in user info from storage.
 *
 * @returns {object}
 */
export function getUserInfo() {
  const data = localStorage.getItem("persist:auth") ?? "";
  const parsedData = JSON.parse(data);
  if (data) {
    const user = JSON.parse(parsedData.user);
    return user;
  } else {
    return null;
  }
}

/**
 * Set access token to storage.
 *
 * @param {string} accessToken
 */
export function setAccessToken(accessToken: string) {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
}

/**
 * Set expiry time for access token to storage.
 *
 * @param {number} expiryTime
 */
export function setExpiryTime(expiry: number) {
  //convert second to millisecond and add to current date.
  const expireTime = Date.now() + expiry * 1000;
  localStorage.setItem(EXPIRES_IN, expireTime.toString());
}

/**
 * Get refresh token from storage.
 *
 * @returns {string}
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN);
}

/**
 * Get expiry time for access token to storage.
 *
 * @returns {number} expiryTime
 */
export function getExpiryTime() {
  const expiryTime = localStorage.getItem(EXPIRES_IN);
  return Number(expiryTime);
}

/**
 * Set refresh token to storage.
 *
 * @param {string} refreshToken
 * @returns {string}
 */
export function setRefreshToken(refreshToken: string) {
  return localStorage.setItem(REFRESH_TOKEN, refreshToken);
}

/**
 * Log out of the system.
 *
 */
// const {errorToast} = useCustomToast()
export async function logout() {
  const refreshToken = await getRefreshToken();
  // logoutUser(refreshToken || "");
  //do not clear language from local storage.

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.hash = "/login";
}