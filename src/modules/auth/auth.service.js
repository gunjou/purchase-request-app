import api from "../../api/axios";
import { saveAuthSession } from "./auth.storage";

export async function login(username, password) {
  const response = await api.post("/auth/pegawai/login-mobile", {
    username,
    password,
  });

  const { data } = response.data;

  await saveAuthSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  });

  return data;
}
