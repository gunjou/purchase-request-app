const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_URL;

const IMAGE_SERVICE_NAME = process.env.EXPO_PUBLIC_IMAGE_SERVICE_NAME;
const IMAGE_CATEGORY = process.env.EXPO_PUBLIC_IMAGE_CATEGORY;
const IMAGE_API_KEY = process.env.EXPO_PUBLIC_IMAGE_API_KEY;

const DOCUMENT_CATEGORY = process.env.EXPO_PUBLIC_DOCUMENT_CATEGORY;
const DOCUMENT_API_KEY = process.env.EXPO_PUBLIC_DOCUMENT_API_KEY;

/**
 * Upload image ke CDN private.
 *
 * @param {object} file - object file dari expo-image-picker
 * @returns {Promise<string>} URL file hasil upload
 */
export async function uploadPengajuanImage(file) {
  const formData = new FormData();

  formData.append("file", {
    uri: file.uri,
    name: file.fileName || `pengajuan-${Date.now()}.jpg`,
    type: file.mimeType || "image/jpeg",
  });

  const response = await fetch(
    `${CDN_BASE_URL}/api/upload/${IMAGE_SERVICE_NAME}/${IMAGE_CATEGORY}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-API-KEY": IMAGE_API_KEY,
      },
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok || !data?.status || !data?.url) {
    throw new Error(data?.message || "Gagal mengunggah gambar ke CDN.");
  }

  return data.url;
}

/**
 * Upload document ke CDN private.
 *
 * @param {object} file - object file dari expo-document-picker
 * @returns {Promise<string>} URL file hasil upload
 */
export async function uploadPengajuanDocument(file) {
  const formData = new FormData();

  formData.append("file", {
    uri: file.uri,
    name: file.name || `pengajuan-${Date.now()}`,
    type: file.mimeType || "application/octet-stream",
  });

  const response = await fetch(
    `${CDN_BASE_URL}/api/upload-document/${DOCUMENT_CATEGORY}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-API-KEY": DOCUMENT_API_KEY,
      },
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok || !data?.status || !data?.url) {
    throw new Error(data?.message || "Gagal mengunggah dokumen ke CDN.");
  }

  return data.url;
}
