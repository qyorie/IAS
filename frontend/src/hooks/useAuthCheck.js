import { useEffect } from "react";
import { isTokenExpired } from "../utils/tokenUtils.js";
import api from "../api/axios.js";

export default function useAuthCheck() {

  useEffect(() => {

    const check = async () => {
      const token = localStorage.getItem("accessToken");

      // If no token or expired -> refresh
      if (!token || isTokenExpired(token)) {
        try {
          // 1. Fetch CSRF token first
          const csrfRes = await api.get("/csrf-token", {
            withCredentials: true
          });

          const csrfToken = csrfRes.data.csrfToken;

          // 2. Call refresh with CSRF header
          const res = await api.get("/auth/refresh", {
            withCredentials: true,
            headers: {
              "X-CSRF-Token": csrfToken
            }
          });

          // 3. Save new access token
          localStorage.setItem("accessToken", res.data.accessToken);

        } catch (err) {
          console.error("Refresh failed:", err);
          localStorage.removeItem("accessToken");
        }
      }
    };

    check();
  }, []);
}
