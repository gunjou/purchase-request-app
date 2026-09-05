import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { changePassword } from "../profile.service";

export default function ChangePasswordPage({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? colors.dark : colors.light;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Semua field password wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak sesuai.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("Password baru harus berbeda dari password lama.");
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Password berhasil diubah.");
    } catch (err) {
      console.error("Change password error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal mengubah password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <View
        className="border-b px-4 pb-3 pt-12"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-xl active:opacity-60"
            style={{
              backgroundColor: theme.surface,
            }}
          >
            <Ionicons name="arrow-back" size={21} color={theme.textPrimary} />
          </Pressable>

          <View className="ml-3">
            <Text
              className="text-base font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Ubah Password
            </Text>

            <Text
              className="mt-0.5 text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Perbarui password akun kamu
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <View
          className="rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: isDark
                  ? `${colors.brand[100]}15`
                  : `${colors.brand[600]}10`,
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color={isDark ? colors.brand[100] : colors.brand[600]}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text
                className="text-sm font-bold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Keamanan Akun
              </Text>

              <Text
                className="mt-1 text-xs leading-5"
                style={{
                  color: theme.textMuted,
                }}
              >
                Gunakan password yang kuat dan mudah kamu ingat.
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error ? (
          <View
            className="mt-4 flex-row rounded-2xl border p-4"
            style={{
              backgroundColor: isDark
                ? `${colors.semantic.error.dark}10`
                : `${colors.semantic.error.light}08`,
              borderColor: isDark
                ? `${colors.semantic.error.dark}30`
                : `${colors.semantic.error.light}20`,
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={
                isDark
                  ? colors.semantic.error.dark
                  : colors.semantic.error.light
              }
            />

            <Text
              className="ml-2 flex-1 text-sm leading-5"
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

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success ? (
          <View
            className="mt-4 flex-row rounded-2xl border p-4"
            style={{
              backgroundColor: isDark
                ? `${colors.semantic.success.dark}10`
                : `${colors.semantic.success.light}08`,
              borderColor: isDark
                ? `${colors.semantic.success.dark}30`
                : `${colors.semantic.success.light}20`,
            }}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={
                isDark
                  ? colors.semantic.success.dark
                  : colors.semantic.success.light
              }
            />

            <Text
              className="ml-2 flex-1 text-sm leading-5"
              style={{
                color: isDark
                  ? colors.semantic.success.dark
                  : colors.semantic.success.light,
              }}
            >
              {success}
            </Text>
          </View>
        ) : null}

        {/* ==================================================
            FORM
        ================================================== */}

        <View
          className="mt-5 rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <PasswordInput
            label="Password Lama"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Masukkan password lama"
            secureTextEntry={!showOldPassword}
            showPassword={showOldPassword}
            onToggle={() => setShowOldPassword((prev) => !prev)}
            theme={theme}
          />

          <View className="mt-5">
            <PasswordInput
              label="Password Baru"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Masukkan password baru"
              secureTextEntry={!showNewPassword}
              showPassword={showNewPassword}
              onToggle={() => setShowNewPassword((prev) => !prev)}
              theme={theme}
            />
          </View>

          <View className="mt-5">
            <PasswordInput
              label="Konfirmasi Password Baru"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Masukkan kembali password baru"
              secureTextEntry={!showConfirmPassword}
              showPassword={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
              theme={theme}
            />
          </View>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="mt-7 h-12 items-center justify-center rounded-2xl active:opacity-80"
            style={{
              backgroundColor: colors.brand[600],
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.neutral.white} />
            ) : (
              <Text
                className="text-sm font-bold"
                style={{
                  color: colors.neutral.white,
                }}
              >
                Simpan Password
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   PASSWORD INPUT
============================================================ */

function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  showPassword,
  onToggle,
  theme,
}) {
  return (
    <View>
      <Text
        className="mb-2 text-xs font-semibold"
        style={{
          color: theme.textSecondary,
        }}
      >
        {label}
      </Text>

      <View
        className="flex-row items-center rounded-2xl border px-4"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
        }}
      >
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={theme.textMuted}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          className="h-12 flex-1 px-3 text-sm"
          style={{
            color: theme.textPrimary,
          }}
        />

        <Pressable onPress={onToggle} hitSlop={8}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={theme.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}
