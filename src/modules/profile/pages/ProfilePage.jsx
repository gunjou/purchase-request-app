import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../../theme/colors";
import { getAccountInfo } from "../profile.service";
import { clearAuthSession } from "../../auth/auth.storage";

import LogoutConfirmModal from "../modal/LogoutConfirmModal";

export default function ProfilePage({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? colors.dark : colors.light;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  const loadProfile = useCallback(async () => {
    try {
      setError("");

      const data = await getAccountInfo();

      setProfile(data);
    } catch (err) {
      console.error("Load account info error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal mengambil informasi akun.",
      );
    }
  }, []);

  // ======================================================
  // FOCUS
  // ======================================================

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          await loadProfile();
        } finally {
          setLoading(false);
        }
      };

      load();
    }, [loadProfile]),
  );

  // ======================================================
  // REFRESH
  // ======================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading && !profile) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.brand[100] : colors.brand[600]}
        />

        <Text
          className="mt-3 text-sm"
          style={{
            color: theme.textSecondary,
          }}
        >
          Memuat profil...
        </Text>
      </View>
    );
  }

  // ======================================================
  // HANDLE LOGOUT
  // ======================================================
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await clearAuthSession();

      setLogoutModalVisible(false);

      navigation.replace("Login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  // ======================================================
  // ERROR
  // ======================================================

  if (error && !profile) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <View
          className="h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: isDark
              ? `${colors.semantic.error.dark}18`
              : `${colors.semantic.error.light}12`,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={
              isDark ? colors.semantic.error.dark : colors.semantic.error.light
            }
          />
        </View>

        <Text
          className="mt-4 text-center text-base font-bold"
          style={{
            color: theme.textPrimary,
          }}
        >
          Gagal memuat profil
        </Text>

        <Text
          className="mt-2 text-center text-sm leading-5"
          style={{
            color: theme.textSecondary,
          }}
        >
          {error}
        </Text>

        <Pressable
          onPress={loadProfile}
          className="mt-5 rounded-2xl px-5 py-3"
          style={{
            backgroundColor: colors.brand[600],
          }}
        >
          <Text
            className="text-sm font-bold"
            style={{
              color: colors.neutral.white,
            }}
          >
            Coba Lagi
          </Text>
        </Pressable>
      </View>
    );
  }

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
        className="border-b px-5 pb-4 pt-12"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
        }}
      >
        <Text
          className="text-2xl font-bold"
          style={{
            color: theme.textPrimary,
          }}
        >
          Profil
        </Text>

        <Text
          className="mt-1 text-sm"
          style={{
            color: theme.textMuted,
          }}
        >
          Informasi akun dan pengaturan
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? colors.brand[100] : colors.brand[600]}
          />
        }
      >
        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <View
          className="rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <View className="items-center">
            {/* AVATAR */}

            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? `${colors.brand[100]}18`
                  : `${colors.brand[600]}10`,
              }}
            >
              <Ionicons
                name="person"
                size={38}
                color={isDark ? colors.brand[100] : colors.brand[600]}
              />
            </View>

            <Text
              className="mt-4 text-xl font-bold text-center"
              style={{
                color: theme.textPrimary,
              }}
            >
              {profile?.nama_lengkap || "-"}
            </Text>

            <Text
              className="mt-1 text-sm"
              style={{
                color: theme.textMuted,
              }}
            >
              @{profile?.username || "-"}
            </Text>
          </View>

          {/* ACCOUNT INFO */}

          <View
            className="mt-6 border-t pt-5"
            style={{
              borderColor: theme.border,
            }}
          >
            <ProfileInfo
              icon="card-outline"
              label="NIP"
              value={profile?.nip}
              theme={theme}
              isDark={isDark}
            />

            <ProfileInfo
              icon="mail-outline"
              label="Email"
              value={profile?.email || "-"}
              theme={theme}
              isDark={isDark}
            />

            <ProfileInfo
              icon="person-circle-outline"
              label="Username"
              value={profile?.username}
              theme={theme}
              isDark={isDark}
              last
            />
          </View>
        </View>

        {/* ==================================================
            SETTINGS
        ================================================== */}

        <Text
          className="mb-3 mt-7 text-base font-bold"
          style={{
            color: theme.textPrimary,
          }}
        >
          Pengaturan
        </Text>

        <View
          className="overflow-hidden rounded-3xl border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <SettingItem
            icon="lock-closed-outline"
            title="Keamanan & Password"
            description="Ubah password akun"
            onPress={() => navigation.navigate("ChangePassword")}
            theme={theme}
            isDark={isDark}
          />

          <SettingItem
            icon="information-circle-outline"
            title="Tentang Aplikasi"
            description="Informasi aplikasi"
            onPress={() => navigation.navigate("About")}
            theme={theme}
            isDark={isDark}
          />

          <SettingItem
            icon="log-out-outline"
            title="Keluar"
            description="Keluar dari akun"
            onPress={() => setLogoutModalVisible(true)}
            theme={theme}
            isDark={isDark}
            danger
            last
          />
        </View>
      </ScrollView>
      <LogoutConfirmModal
        visible={logoutModalVisible}
        loading={loggingOut}
        onCancel={() => {
          if (!loggingOut) {
            setLogoutModalVisible(false);
          }
        }}
        onConfirm={handleLogout}
        theme={theme}
        isDark={isDark}
      />
    </View>
  );
}

/* ============================================================
   PROFILE INFO
============================================================ */

function ProfileInfo({ icon, label, value, theme, isDark, last = false }) {
  return (
    <View
      className={`flex-row ${last ? "" : "mb-4 border-b pb-4"}`}
      style={{
        borderColor: theme.border,
      }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{
          backgroundColor: isDark
            ? `${colors.brand[100]}12`
            : `${colors.brand[600]}08`,
        }}
      >
        <Ionicons
          name={icon}
          size={17}
          color={isDark ? colors.brand[100] : colors.brand[600]}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-xs"
          style={{
            color: theme.textMuted,
          }}
        >
          {label}
        </Text>

        <Text
          className="mt-1 text-sm font-semibold"
          style={{
            color: theme.textPrimary,
          }}
        >
          {value || "-"}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   SETTING ITEM
============================================================ */

function SettingItem({
  icon,
  title,
  description,
  onPress,
  theme,
  isDark,
  last = false,
  disabled = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center px-5 py-4 active:opacity-70 ${
        last ? "" : "border-b"
      }`}
      style={{
        borderColor: theme.border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
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

      <View className="ml-3 flex-1">
        <Text
          className="text-sm font-semibold"
          style={{
            color: theme.textPrimary,
          }}
        >
          {title}
        </Text>

        <Text
          className="mt-1 text-xs"
          style={{
            color: theme.textMuted,
          }}
        >
          {description}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={19} color={theme.textMuted} />
    </Pressable>
  );
}
