import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

export default function LogoutConfirmModal({
  visible,
  loading,
  onCancel,
  onConfirm,
  theme,
  isDark,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View
          className="w-full max-w-md rounded-3xl p-6"
          style={{
            backgroundColor: theme.surface,
          }}
        >
          {/* ICON */}

          <View className="items-center">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: isDark
                  ? `${colors.semantic.error.dark}18`
                  : `${colors.semantic.error.light}12`,
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={28}
                color={
                  isDark
                    ? colors.semantic.error.dark
                    : colors.semantic.error.light
                }
              />
            </View>
          </View>

          {/* TITLE */}

          <Text
            className="mt-5 text-center text-lg font-bold"
            style={{
              color: theme.textPrimary,
            }}
          >
            Keluar dari Akun?
          </Text>

          {/* DESCRIPTION */}

          <Text
            className="mt-2 text-center text-sm leading-5"
            style={{
              color: theme.textSecondary,
            }}
          >
            Apakah Anda yakin ingin keluar dari akun ini?
          </Text>

          {/* ACTIONS */}

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="flex-1 items-center rounded-2xl border px-4 py-3.5"
              style={{
                borderColor: theme.border,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Batal
              </Text>
            </Pressable>

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
                <ActivityIndicator size="small" color={colors.neutral.white} />
              ) : (
                <Text
                  className="text-sm font-bold"
                  style={{
                    color: colors.neutral.white,
                  }}
                >
                  Keluar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
