import { Ionicons } from "@expo/vector-icons";
import { Text, View, useColorScheme } from "react-native";

import { colors } from "../../../theme/colors";

export default function DashboardSummary({ summary }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ======================================================
  // THEME
  // ======================================================

  const theme = isDark ? colors.dark : colors.light;

  // ======================================================
  // STATUS ITEMS
  // ======================================================

  const statusItems = [
    {
      key: "requested",
      label: "Requested",
      value: summary?.requested ?? 0,
      icon: "paper-plane-outline",
      color: isDark
        ? colors.status.requested.dark
        : colors.status.requested.light,
    },
    {
      key: "reviewed",
      label: "Reviewed",
      value: summary?.reviewed ?? 0,
      icon: "eye-outline",
      color: isDark
        ? colors.status.reviewed.dark
        : colors.status.reviewed.light,
    },
    {
      key: "approved",
      label: "Approved",
      value: summary?.approved ?? 0,
      icon: "checkmark-circle-outline",
      color: isDark
        ? colors.status.approved.dark
        : colors.status.approved.light,
    },
    {
      key: "paid",
      label: "Paid",
      value: summary?.paid ?? 0,
      icon: "wallet-outline",
      color: isDark ? colors.status.paid.dark : colors.status.paid.light,
    },
  ];

  const rejected = summary?.rejected ?? 0;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <View className="pb-3">
      {/* ==================================================
          MAIN SUMMARY CARD
      ================================================== */}

      <View
        className="overflow-hidden rounded-3xl"
        style={{
          backgroundColor: isDark ? colors.brand[900] : colors.brand[800],
        }}
      >
        {/* ==================================================
            TOTAL
        ================================================== */}

        <View className="p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className="text-sm font-medium"
                style={{
                  color: "rgba(255,255,255,0.70)",
                }}
              >
                Pengajuan Aktif
              </Text>

              <Text className="mt-1 text-4xl font-bold text-white">
                {summary?.active ?? 0}
              </Text>
            </View>

            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: colors.brand[600],
              }}
            >
              <Ionicons
                name="documents-outline"
                size={24}
                color={colors.neutral.white}
              />
            </View>
          </View>

          <Text
            className="mt-3 text-xs"
            style={{
              color: "rgba(255,255,255,0.60)",
            }}
          >
            Ringkasan status seluruh pengajuan Anda
          </Text>
        </View>

        {/* ==================================================
            DIVIDER
        ================================================== */}

        <View
          className="mx-5 h-px"
          style={{
            backgroundColor: "rgba(255,255,255,0.10)",
          }}
        />

        {/* ==================================================
            STATUS SUMMARY
        ================================================== */}

        <View className="flex-row px-3 py-5">
          {statusItems.map((item, index) => (
            <View
              key={item.key}
              className="flex-1 items-center"
              style={{
                borderRightWidth: index !== statusItems.length - 1 ? 1 : 0,
                borderRightColor: "rgba(255,255,255,0.10)",
              }}
            >
              {/* COUNT */}

              <Text className="mt-2 text-xl font-bold text-white">
                {item.value}
              </Text>

              {/* LABEL */}

              <Text
                className="mt-0.5 text-[10px] font-medium"
                style={{
                  color: "rgba(255,255,255,0.60)",
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ==================================================
          REJECTED INDICATOR
      ================================================== */}

      {rejected > 0 && (
        <View
          className="mt-3 flex-row items-center rounded-2xl border px-4 py-3"
          style={{
            backgroundColor: isDark
              ? "rgba(252,165,165,0.08)"
              : "rgba(254,226,226,1)",

            borderColor: isDark
              ? "rgba(252,165,165,0.20)"
              : "rgba(185,28,28,0.15)",
          }}
        >
          <View
            className="h-8 w-8 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isDark
                ? `${colors.semantic.error.dark}18`
                : `${colors.semantic.error.light}12`,
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={
                isDark
                  ? colors.semantic.error.dark
                  : colors.semantic.error.light
              }
            />
          </View>

          <Text
            className="ml-3 flex-1 text-sm font-medium"
            style={{
              color: isDark
                ? colors.semantic.error.dark
                : colors.semantic.error.light,
            }}
          >
            {rejected} pengajuan ditolak
          </Text>
        </View>
      )}
    </View>
  );
}
