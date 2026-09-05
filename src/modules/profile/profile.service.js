import api from "../../api/axios";

export const getAccountInfo = async () => {
  const response = await api.get("/pegawai/account-info");

  return response.data.data;
};

export const changePassword = async (payload) => {
  const response = await api.put("/auth/change-password", payload);

  return response.data;
};
