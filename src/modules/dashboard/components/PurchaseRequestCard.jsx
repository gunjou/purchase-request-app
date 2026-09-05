import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View, useColorScheme } from "react-native";

import { colors } from "../../../theme/colors";
import RequestTimeline from "./RequestTimeline";

export default function PurchaseRequestCard({ request, onPress }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ======================================================
  // THEME
  // ======================================================

  const theme = isDark ? colors.dark : colors.light;

  // ======================================================
  // PRIORITY
  // ======================================================

  const priority = getPriority(request.priority, isDark);

  return (
    <Pressable
      onPress={onPress}
      activeOpacity={0.85}
      className="overflow-hidden rounded-3xl border"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <View className="p-5">
        <View className="flex-row items-start justify-between">
          {/* REQUEST INFO */}

          <View className="flex-1 pr-4">
            <Text
              className="text-xs font-medium"
              style={{
                color: theme.textMuted,
              }}
            >
              {request.request_number}
            </Text>

            <Text
              numberOfLines={2}
              className="mt-1 text-lg font-bold leading-6"
              style={{
                color: theme.textPrimary,
              }}
            >
              {request.nama_pekerjaan}
            </Text>
          </View>

          {/* PRIORITY */}

          <View
            className="flex-row items-center rounded-xl px-3 py-2"
            style={{
              backgroundColor: isDark
                ? `${priority.color}20`
                : `${priority.color}12`,
            }}
          >
            <Ionicons name="flag-outline" size={15} color={priority.color} />

            <Text
              className="ml-1.5 text-xs font-bold"
              style={{
                color: priority.color,
              }}
            >
              {priority.label}
            </Text>
          </View>
        </View>

        {/* ==================================================
            TIMELINE
        ================================================== */}

        <View className="mt-6">
          <RequestTimeline history={request.history} status={request.status} />
        </View>
      </View>

      {/* ==================================================
          TOTAL
      ================================================== */}

      <View
        className="border-t px-5 py-4"
        style={{
          borderTopColor: theme.border,
        }}
      >
        <View className="flex-row items-end justify-between">
          <View>
            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Total Pengajuan
            </Text>

            <Text
              className="mt-1 text-xl font-bold"
              style={{
                color: isDark ? colors.brand[100] : colors.brand[800],
              }}
            >
              {formatCurrency(request.total_amount)}
            </Text>
          </View>

          <View className="items-end">
            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Tanggal Pengajuan
            </Text>

            <Text
              className="mt-1 text-sm font-semibold"
              style={{
                color: theme.textSecondary,
              }}
            >
              {formatDate(request.tanggal_request)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ======================================================
// PRIORITY
// ======================================================

function getPriority(priority, isDark) {
  switch (priority) {
    case "TOP_URGENT":
      return {
        label: "Top Urgent",
        color: isDark
          ? colors.semantic.error.dark
          : colors.semantic.error.light,
      };

    case "URGENT":
      return {
        label: "Urgent",
        color: isDark
          ? colors.semantic.warning.dark
          : colors.semantic.warning.light,
      };

    case "NORMAL":
    default:
      return {
        label: "Normal",
        color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
      };
  }
}

// ======================================================
// FORMAT CURRENCY
// ======================================================

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
