import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../../theme/colors";
import { getMySummary } from "../dashboard.service";

import DashboardSummary from "../components/DashboardSummary";
import PurchaseRequestCard from "../components/PurchaseRequestCard";

export default function DashboardPage({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? colors.dark : colors.light;

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  const loadDashboard = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const data = await getMySummary();

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil data dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ======================================================
  // REFRESH WHEN PAGE FOCUSED
  // ======================================================

  useFocusEffect(
    useCallback(() => {
      loadDashboard();

      return undefined;
    }, []),
  );

  // ======================================================
  // PULL TO REFRESH
  // ======================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard(false);
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading && !dashboard) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.status.paid.dark : colors.brand[600]}
        />

        <Text
          className="mt-3 text-sm"
          style={{
            color: theme.textSecondary,
          }}
        >
          Memuat dashboard...
        </Text>
      </View>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error && !dashboard) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <Text
          className="text-center text-base font-semibold"
          style={{
            color: isDark
              ? colors.semantic.error.dark
              : colors.semantic.error.light,
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  // ======================================================
  // DATA
  // ======================================================

  const summary = dashboard?.summary ?? {};
  const requests = dashboard?.requests ?? [];

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* ==================================================
          FIXED HEADER + SUMMARY
      ================================================== */}

      <View
        className="px-4"
        style={{
          backgroundColor: theme.background,
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View className="px-2 pt-12">
          <Text
            className="text-sm font-medium"
            style={{
              color: theme.textSecondary,
            }}
          >
            Dashboard
          </Text>

          <Text
            className="mt-1 text-2xl font-bold"
            style={{
              color: theme.textPrimary,
            }}
          >
            Pengajuan Saya
          </Text>

          <Text
            className="mt-1 text-sm leading-5"
            style={{
              color: theme.textSecondary,
            }}
          >
            Pantau seluruh pengajuan dan status prosesnya.
          </Text>
        </View>

        {/* ==================================================
            SUMMARY
        ================================================== */}
      </View>

      {/* ==================================================
          SCROLLABLE REQUEST AREA
          ================================================== */}

      <View className="mt-5 flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? colors.status.paid.dark : colors.brand[600]}
            />
          }
        >
          <DashboardSummary summary={summary} />

          {/* ==================================================
              REQUEST HEADER
          ================================================== */}

          <View className="mb-4 flex-row items-end justify-between">
            <View className="flex-1 pr-4">
              <Text
                className="text-lg font-bold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Pengajuan Terbaru
              </Text>

              <Text
                className="mt-1 text-xs leading-5"
                style={{
                  color: theme.textMuted,
                }}
              >
                Pengajuan yang sedang atau baru diproses
              </Text>
            </View>

            <Text
              className="text-sm font-semibold"
              style={{
                color: colors.brand[600],
              }}
            >
              {requests.length} pengajuan
            </Text>
          </View>

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {requests.length === 0 ? (
            <View
              className="items-center rounded-3xl border px-6 py-10"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: theme.surfaceAlt,
                }}
              >
                <Text
                  className="text-2xl"
                  style={{
                    color: theme.textSecondary,
                  }}
                >
                  📄
                </Text>
              </View>

              <Text
                className="mt-4 text-base font-semibold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Belum ada pengajuan
              </Text>

              <Text
                className="mt-2 text-center text-sm leading-5"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Pengajuan yang Anda buat akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {requests.map((request) => (
                <PurchaseRequestCard
                  key={request.id_request}
                  request={request}
                  onPress={() =>
                    navigation.navigate("PurchaseRequestDetail", {
                      id: request.id_request,
                    })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
