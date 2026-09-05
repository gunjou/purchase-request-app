import api from "../../api/axios";

export async function getMySummary() {
  const response = await api.get("/purchase-requests/my-summary");

  const result = response.data;

  if (!result.success) {
    throw new Error(
      result.message || "Gagal mengambil dashboard purchase request.",
    );
  }

  return result.data;
}
