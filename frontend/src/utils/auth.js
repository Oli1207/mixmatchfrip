// src/utils/auth.js
import { useAuthStore } from "../store/auth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { BASE_URL } from "./constants";

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export const login = async (email, password) => {
  try {
    const { data, status } = await axios.post(`${BASE_URL}user/token/`, { email, password });

    if (status === 200) {
      setAuthUser(data.access, data.refresh, data.user);

      Toast.fire({
        icon: "success",
        title: "Vous etes connecte",
      });
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error?.response?.data?.detail || "Something went wrong",
    };
  }
};

export const register = async (full_name, email, phone, password, password2) => {
  try {
    const { data } = await axios.post(`${BASE_URL}user/register/`, {
      full_name,
      email,
      phone,
      password,
      password2,
    });

    try {
      await login(email, password);
    } catch {
      // inscription reussie meme si le login auto echoue
    }

    return { data, error: null };
  } catch (error) {
    const apiErr = error?.response?.data;
    let msg = "Une erreur est survenue.";
    if (apiErr) {
      if (typeof apiErr === "string") {
        msg = apiErr;
      } else if (apiErr.detail) {
        msg = apiErr.detail;
      } else {
        msg = Object.values(apiErr).flat().join(" ");
      }
    }
    return { data: null, error: msg };
  }
};

export const logout = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");

  localStorage.removeItem("is_logged_in");

  useAuthStore.getState().setUser(null);
};

export const setUser = async () => {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  if (!accessToken || !refreshToken) return;

  if (isAccessTokenExpired(accessToken)) {
    try {
      const response = await getRefreshToken();
      setAuthUser(response.access, refreshToken);
    } catch (error) {
      // ignore
    }
  } else {
    setAuthUser(accessToken, refreshToken);
  }
};

export const setAuthUser = (access_token, refresh_token, userFromApi = null) => {
  Cookies.set("access_token", access_token, {
    expires: 30,
    secure: true,
    sameSite: "Lax",
  });
  Cookies.set("refresh_token", refresh_token, {
    expires: 200,
    secure: true,
    sameSite: "Lax",
  });

  localStorage.setItem("is_logged_in", "1");

  let decoded = null;
  try {
    decoded = jwtDecode(access_token);
  } catch (e) {
    decoded = null;
  }

  const merged = {
    ...(decoded || {}),
    ...(userFromApi || {}),
  };

  const normalizedUser = {
    ...merged,

    id: merged?.id ?? merged?.user_id ?? null,
    user_id: merged?.user_id ?? merged?.id ?? null,

    full_name: merged?.full_name ?? "",
    email: merged?.email ?? "",
    phone: merged?.phone ?? "",
    username: merged?.username ?? "",

    // is_staff est dans le JWT via get_token — explicite pour eviter toute perte
    is_staff: merged?.is_staff ?? false,
  };

  useAuthStore.getState().setUser(normalizedUser);
  useAuthStore.getState().setLoading(false);
};

export const getRefreshToken = async () => {
  const refresh_token = Cookies.get("refresh_token");

  if (!refresh_token) {
    logout();
    throw new Error("Missing refresh token");
  }

  try {
    const response = await axios.post(`${BASE_URL}user/token/refresh/`, {
      refresh: refresh_token,
    });
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
};

export const isAccessTokenExpired = (accessToken) => {
  try {
    const decodedToken = jwtDecode(accessToken);
    return decodedToken.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};
