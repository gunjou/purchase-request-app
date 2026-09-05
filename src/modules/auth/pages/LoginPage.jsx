import { useState } from "react";
import { useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { login } from "../auth.service";
import { colors } from "../../../theme/colors";

export default function LoginPage({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentYear = new Date().getFullYear();

  // ======================================================
  // FORM STATE
  // ======================================================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ======================================================
  // UI STATE
  // ======================================================

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // THEME
  // ======================================================

  const theme = isDark ? colors.dark : colors.light;

  // ======================================================
  // LOGIN
  // ======================================================

  const handleLogin = async () => {
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(cleanUsername, password);

      navigation.replace("Main");
    } catch (err) {
      console.log("Login error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Username atau password salah.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className="flex-1 overflow-hidden"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <View className="absolute inset-0">
        <LinearGradient
          colors={
            isDark
              ? [colors.dark.background, "#160604", colors.dark.background]
              : [colors.light.background, "#FFF9F0", colors.light.background]
          }
          locations={[0, 0.5, 1]}
          className="absolute inset-0"
        />

        {/* ==================================================
            BRAND ACCENT
        ================================================== */}

        <LinearGradient
          colors={
            isDark
              ? ["rgba(140,16,7,0)", "rgba(140,16,7,0.18)", "rgba(102,11,5,0)"]
              : [
                  "rgba(255,240,196,0)",
                  "rgba(255,240,196,0.65)",
                  "rgba(255,240,196,0)",
                ]
          }
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="absolute -right-32 -top-16 h-72 w-[130%]"
        />

        <LinearGradient
          colors={
            isDark
              ? ["rgba(102,11,5,0)", "rgba(102,11,5,0.16)", "rgba(140,16,7,0)"]
              : ["rgba(140,16,7,0)", "rgba(140,16,7,0.06)", "rgba(140,16,7,0)"]
          }
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          className="absolute -left-20 top-28 h-80 w-[120%]"
        />

        <LinearGradient
          colors={
            isDark
              ? ["rgba(140,16,7,0)", "rgba(102,11,5,0.14)", "rgba(140,16,7,0)"]
              : [
                  "rgba(255,240,196,0)",
                  "rgba(255,240,196,0.40)",
                  "rgba(255,240,196,0)",
                ]
          }
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          className="absolute -bottom-32 left-[-15%] h-72 w-[130%]"
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ==================================================
              BRAND
          ================================================== */}

          <View className="mb-9 items-center">
            <Image
              source={
                isDark
                  ? require("../../../../assets/logo_white.png")
                  : require("../../../../assets/logo.png")
              }
              resizeMode="contain"
              className="mb-6 h-20 w-48"
            />

            <View className="items-center">
              <Text
                className="text-center text-4xl font-black tracking-tight"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Purchase
              </Text>

              <Text
                className="text-center text-4xl font-black tracking-tight"
                style={{
                  color: colors.brand[600],
                }}
              >
                Request.
              </Text>
            </View>

            <Text
              className="mt-4 max-w-sm text-center text-base leading-6"
              style={{
                color: theme.textSecondary,
              }}
            >
              Ajukan kebutuhan pengadaan dan pembayaran dengan lebih mudah.
            </Text>
          </View>

          {/* ==================================================
              LOGIN CARD
          ================================================== */}

          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: isDark
                ? colors.dark.surface
                : colors.light.surface,

              borderWidth: 2,
              borderColor: theme.border,
            }}
          >
            {/* ==================================================
                CARD HEADER
            ================================================== */}

            <View className="flex-row items-center">
              <View className="flex-1">
                <Text
                  className="text-xl font-black"
                  style={{
                    color: theme.textPrimary,
                  }}
                >
                  Login
                </Text>

                <Text
                  className="mt-0.5 text-sm"
                  style={{
                    color: theme.textSecondary,
                  }}
                >
                  Gunakan akun pegawai Anda.
                </Text>
              </View>
            </View>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error ? (
              <View
                className="mt-5 rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: isDark ? "rgba(185,28,28,0.16)" : "#FEF2F2",

                  borderWidth: 1.5,

                  borderColor: isDark ? colors.semantic.error.dark : "#FECACA",
                }}
              >
                <View className="flex-row items-start">
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
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
              </View>
            ) : null}

            {/* ==================================================
                USERNAME
            ================================================== */}

            <View className="mt-7">
              <Text
                className="mb-2 text-sm font-bold"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Username
              </Text>

              <View className="relative">
                <TextInput
                  value={username}
                  onChangeText={(value) => {
                    setUsername(value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Masukkan username"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  editable={!loading}
                  returnKeyType="next"
                  className="rounded-2xl px-4 py-4 pr-12 text-base"
                  style={{
                    backgroundColor: isDark
                      ? colors.dark.surfaceAlt
                      : colors.light.background,

                    borderWidth: 1.5,
                    borderColor: theme.border,

                    color: theme.textPrimary,
                  }}
                />

                <View className="absolute right-4 top-0 h-full justify-center">
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color={
                      isDark ? colors.dark.textMuted : colors.light.textMuted
                    }
                  />
                </View>
              </View>
            </View>

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <View className="mt-5">
              <Text
                className="mb-2 text-sm font-bold"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Password
              </Text>

              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Masukkan password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  className="rounded-2xl px-4 py-4 pr-20 text-base"
                  style={{
                    backgroundColor: isDark
                      ? colors.dark.surfaceAlt
                      : colors.light.background,

                    borderWidth: 1.5,
                    borderColor: theme.border,

                    color: theme.textPrimary,
                  }}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  activeOpacity={0.7}
                  className="absolute right-4 top-0 h-full justify-center"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={19}
                    color={isDark ? colors.brand[100] : colors.brand[800]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ==================================================
                LOGIN BUTTON
            ================================================== */}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loading}
              className={`mt-7 overflow-hidden rounded-2xl ${
                loading ? "opacity-70" : ""
              }`}
              style={{
                borderWidth: 1.5,
                borderColor: isDark ? colors.brand[100] : colors.brand[900],
              }}
            >
              <LinearGradient
                colors={[colors.brand[800], colors.brand[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="items-center px-5 py-4"
              >
                {loading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator
                      size="small"
                      color={colors.neutral.white}
                    />

                    <Text className="ml-3 text-base font-black text-white">
                      Memproses...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-base font-black text-white">
                      Login
                    </Text>

                    <Ionicons
                      name="arrow-forward-outline"
                      size={18}
                      color={colors.neutral.white}
                      style={{
                        marginLeft: 8,
                      }}
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <View className="mt-7 items-center">
            <View
              className="mb-3 h-px w-16"
              style={{
                backgroundColor: theme.border,
              }}
            />

            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              © {currentYear} Outlook-Project. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
