import axios from "axios";

/**
 * Http Utility.
 */
export const BASE_URL = import.meta.env.VITE_APP_API_URL;
export const MEDIA_URL = import.meta.env.VITE_APP_MEDIA_URL;
const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  method: "POST",
});
export default http;
