import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import {
  uploadPengajuanDocument,
  uploadPengajuanImage,
} from "../../../helpers/cdn";

export default function AttachmentPicker({ value, onChange, theme, isDark }) {
  const [uploading, setUploading] = useState(false);

  const handleUploadImage = async (file) => {
    try {
      setUploading(true);

      const url = await uploadPengajuanImage(file);

      onChange({
        path: url,
        name: file.fileName || "Foto",
        type: file.mimeType || "image/jpeg",
      });
    } catch (error) {
      console.error("Upload image error:", error);

      Alert.alert(
        "Gagal Mengunggah",
        error.message || "Gagal mengunggah gambar.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDocument = async (file) => {
    try {
      setUploading(true);

      const url = await uploadPengajuanDocument(file);

      onChange({
        path: url,
        name: file.name || "Dokumen",
        type: file.mimeType || "application/octet-stream",
      });
    } catch (error) {
      console.error("Upload document error:", error);

      Alert.alert(
        "Gagal Mengunggah",
        error.message || "Gagal mengunggah dokumen.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePickDocument = async () => {
    if (uploading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file) {
        return;
      }

      await handleUploadDocument(file);
    } catch (error) {
      console.error("Pick document error:", error);

      Alert.alert("Gagal", "Tidak dapat memilih dokumen.");
    }
  };

  const handlePickImage = async () => {
    if (uploading) return;

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Izin Diperlukan",
          "Aplikasi membutuhkan izin untuk mengakses foto.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file) {
        return;
      }

      await handleUploadImage(file);
    } catch (error) {
      console.error("Pick image error:", error);

      Alert.alert("Gagal", "Tidak dapat memilih foto.");
    }
  };

  const handleTakePhoto = async () => {
    if (uploading) return;

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Izin Diperlukan",
          "Aplikasi membutuhkan izin kamera untuk mengambil foto.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file) {
        return;
      }

      await handleUploadImage(file);
    } catch (error) {
      console.error("Take photo error:", error);

      Alert.alert("Gagal", "Tidak dapat mengambil foto.");
    }
  };

  const handleRemove = () => {
    if (uploading) return;

    Alert.alert(
      "Hapus Lampiran",
      "Apakah Anda yakin ingin menghapus lampiran ini?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => onChange(null),
        },
      ],
    );
  };

  return (
    <View className="mt-2">
      {/* ==================================================
          EMPTY
      ================================================== */}

      {!value ? (
        <View
          className="overflow-hidden rounded-3xl border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <Pressable
            onPress={handlePickDocument}
            disabled={uploading}
            className="flex-row items-center p-4 active:opacity-70"
          >
            <AttachmentIcon
              icon="document-attach-outline"
              theme={theme}
              isDark={isDark}
            />

            <View className="ml-3 flex-1">
              <Text
                className="text-sm font-semibold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Unggah File
              </Text>

              <Text
                className="mt-1 text-xs"
                style={{
                  color: theme.textMuted,
                }}
              >
                Pilih dokumen dari perangkat
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </Pressable>

          <View
            className="border-t"
            style={{
              borderColor: theme.border,
            }}
          />

          <Pressable
            onPress={handlePickImage}
            disabled={uploading}
            className="flex-row items-center p-4 active:opacity-70"
          >
            <AttachmentIcon
              icon="image-outline"
              theme={theme}
              isDark={isDark}
            />

            <View className="ml-3 flex-1">
              <Text
                className="text-sm font-semibold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Pilih Foto
              </Text>

              <Text
                className="mt-1 text-xs"
                style={{
                  color: theme.textMuted,
                }}
              >
                Pilih foto dari galeri
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </Pressable>

          <View
            className="border-t"
            style={{
              borderColor: theme.border,
            }}
          />

          <Pressable
            onPress={handleTakePhoto}
            disabled={uploading}
            className="flex-row items-center p-4 active:opacity-70"
          >
            <AttachmentIcon
              icon="camera-outline"
              theme={theme}
              isDark={isDark}
            />

            <View className="ml-3 flex-1">
              <Text
                className="text-sm font-semibold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Ambil Foto
              </Text>

              <Text
                className="mt-1 text-xs"
                style={{
                  color: theme.textMuted,
                }}
              >
                Gunakan kamera perangkat
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </Pressable>
        </View>
      ) : (
        /* ==================================================
           SELECTED
        ================================================== */

        <View
          className="flex-row items-center rounded-3xl border p-4"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isDark
                ? `${colors.brand[100]}18`
                : `${colors.brand[600]}10`,
            }}
          >
            <Ionicons
              name={
                value.type?.startsWith("image/")
                  ? "image-outline"
                  : "document-text-outline"
              }
              size={22}
              color={isDark ? colors.brand[100] : colors.brand[600]}
            />
          </View>

          <View className="ml-3 flex-1">
            <Text
              numberOfLines={1}
              className="text-sm font-semibold"
              style={{
                color: theme.textPrimary,
              }}
            >
              {value.name || "Lampiran"}
            </Text>

            <Text
              numberOfLines={1}
              className="mt-1 text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Lampiran berhasil diunggah
            </Text>
          </View>

          <Pressable
            onPress={handleRemove}
            disabled={uploading}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${colors.semantic.error.light}10`,
            }}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.semantic.error.light}
            />
          </Pressable>
        </View>
      )}

      {/* ==================================================
          UPLOADING
      ================================================== */}

      {uploading ? (
        <View className="mt-3 flex-row items-center">
          <ActivityIndicator
            size="small"
            color={isDark ? colors.brand[100] : colors.brand[600]}
          />

          <Text
            className="ml-2 text-xs"
            style={{
              color: theme.textSecondary,
            }}
          >
            Mengunggah lampiran...
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function AttachmentIcon({ icon, theme, isDark }) {
  return (
    <View
      className="h-10 w-10 items-center justify-center rounded-xl"
      style={{
        backgroundColor: isDark
          ? `${colors.brand[100]}12`
          : `${colors.brand[600]}08`,
      }}
    >
      <Ionicons
        name={icon}
        size={19}
        color={isDark ? colors.brand[100] : colors.brand[600]}
      />
    </View>
  );
}
