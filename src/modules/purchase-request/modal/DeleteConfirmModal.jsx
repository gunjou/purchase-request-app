import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

export default function DeleteConfirmModal({
  visible,
  loading,
  error,
  theme,
  isDark,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          className="w-full rounded-3xl p-5"
          style={{
            backgroundColor: theme.background,
          }}
        >
          {/* ICON */}

          <View className="items-center">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: isDark ? "rgba(239,68,68,0.15)" : "#FEF2F2",
              }}
            >
              <Ionicons
                name="trash-outline"
                size={26}
                color={
                  isDark
                    ? colors.semantic.error.dark
                    : colors.semantic.error.light
                }
              />
            </View>

            {/* TITLE */}

            <Text
              className="mt-4 text-lg font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Hapus Pengajuan?
            </Text>

            {/* DESCRIPTION */}

            <Text
              className="mt-2 text-center text-sm leading-5"
              style={{
                color: theme.textSecondary,
              }}
            >
              Apakah Anda yakin ingin menghapus pengajuan ini?
              {"\n"}
              Data yang sudah dihapus tidak dapat dikembalikan.
            </Text>
          </View>

          {/* ERROR */}

          {error ? (
            <View
              className="mt-4 rounded-2xl border px-4 py-3"
              style={{
                backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "#FEF2F2",
                borderColor: isDark ? "rgba(239,68,68,0.25)" : "#FECACA",
              }}
            >
              <Text
                className="text-sm leading-5"
                style={{
                  color: isDark
                    ? colors.semantic.error.dark
                    : colors.semantic.error.light,
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* BUTTONS */}

          <View className="mt-6 flex-row gap-3">
            {/* CANCEL */}

            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="flex-1 items-center rounded-2xl border px-4 py-3.5"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Batal
              </Text>
            </Pressable>

            {/* CONFIRM */}

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 items-center rounded-2xl px-4 py-3.5"
              style={{
                backgroundColor: colors.semantic.error.light,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator
                    size="small"
                    color={colors.neutral.white}
                  />

                  <Text className="ml-2 text-sm font-bold text-white">
                    Menghapus...
                  </Text>
                </View>
              ) : (
                <Text className="text-sm font-bold text-white">Hapus</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
