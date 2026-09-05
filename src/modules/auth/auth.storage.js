import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

export async function saveAuthSession({ accessToken, refreshToken, user }) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);

  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function getUser() {
  const user = await SecureStore.getItemAsync(USER_KEY);

  return user ? JSON.parse(user) : null;
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
