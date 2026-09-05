import api from "../../api/axios";

// ======================================================
// GET DETAIL REQUESTS
// ======================================================

export async function getPurchaseRequestDetail(id) {
  const response = await api.get(`/purchase-requests/${id}`);

  const result = response.data;
  // console.log("result", result);

  if (!result.success) {
    throw new Error(result.message || "Gagal mengambil detail pengajuan.");
  }

  return result.data;
}

// ======================================================
// GET DEPARTMENTS
// ======================================================

export async function getDepartments() {
  const response = await api.get("/master/departemen");

  return response.data?.data ?? [];
}

// ======================================================
// CREATE PURCHASE REQUEST
// ======================================================

export async function createPurchaseRequest(payload) {
  const response = await api.post("/purchase-requests", payload);

  return response.data;
}

// ======================================================
// GET PURCHASE REQUESTS
// ======================================================

export async function getPurchaseRequests(params = {}) {
  const response = await api.get("/purchase-requests", {
    params,
  });

  return response.data?.data ?? [];
}

// ======================================================
// UPDATE PURCHASE REQUEST
// ======================================================

export async function updatePurchaseRequest(idRequest, payload) {
  const response = await api.put(`/purchase-requests/${idRequest}`, payload);

  return response.data;
}

// ======================================================
// DELETE PURCHASE REQUEST
// ======================================================

export const deletePurchaseRequest = async (idRequest) => {
  const response = await api.delete(`/purchase-requests/${idRequest}`);

  return response.data;
};

// ======================================================
// HISTORY PURCHASE REQUEST
// ======================================================

export const getPurchaseRequestHistory = async (params = {}) => {
  const response = await api.get("/purchase-requests/history", {
    params,
  });

  return response.data;
};

// ======================================================
// HISTORY PURCHASE REQUEST
// ======================================================

export async function downloadPurchaseRequestPdf(idRequest) {
  const response = await api.get(`/purchase-requests/${idRequest}/pdf`, {
    responseType: "arraybuffer",
  });

  return response;
}
