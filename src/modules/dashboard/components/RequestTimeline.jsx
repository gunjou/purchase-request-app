import { Text, View, useColorScheme } from "react-native";

import { colors } from "../../../theme/colors";

const STATUS_FLOW = [
  {
    key: "REQUESTED",
    label: "Requested",
  },
  {
    key: "REVIEWED",
    label: "Reviewed",
  },
  {
    key: "APPROVED",
    label: "Approved",
  },
  {
    key: "PAID",
    label: "Paid",
  },
];

export default function RequestTimeline({ history = [], status }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const completedStatuses = history.map((item) => item.status);

  const isRejected = status === "REJECTED";

  if (isRejected) {
    return <RejectedTimeline history={history} isDark={isDark} />;
  }

  const completedColor = getCompletedColor(isDark);
  const pendingColor = getPendingColor(isDark);

  return (
    <View className="w-full">
      <View className="flex-row items-start">
        {STATUS_FLOW.map((item, index) => {
          const historyItem = history.find(
            (historyItem) => historyItem.status === item.key,
          );

          const isCompleted = completedStatuses.includes(item.key);

          const previousItem = STATUS_FLOW[index - 1];

          const previousCompleted = previousItem
            ? completedStatuses.includes(previousItem.key)
            : false;

          const isLast = index === STATUS_FLOW.length - 1;

          return (
            <View key={item.key} className="flex-1 items-center">
              {/* ==================================================
                  TIMELINE
              ================================================== */}

              <View className="w-full flex-row items-center">
                {/* LEFT LINE */}

                {index === 0 ? (
                  <View className="flex-1" />
                ) : (
                  <View
                    className="h-px flex-1"
                    style={{
                      backgroundColor:
                        previousCompleted && isCompleted
                          ? completedColor
                          : pendingColor,
                    }}
                  />
                )}

                {/* DOT */}

                <View
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: isCompleted
                      ? completedColor
                      : "transparent",

                    borderWidth: 1,

                    borderColor: isCompleted ? completedColor : pendingColor,
                  }}
                />

                {/* RIGHT LINE */}

                {isLast ? (
                  <View className="flex-1" />
                ) : (
                  <View
                    className="h-px flex-1"
                    style={{
                      backgroundColor:
                        isCompleted &&
                        completedStatuses.includes(STATUS_FLOW[index + 1].key)
                          ? completedColor
                          : pendingColor,
                    }}
                  />
                )}
              </View>

              {/* ==================================================
                  STATUS LABEL
              ================================================== */}

              <Text
                numberOfLines={1}
                className="mt-2 text-center text-[10px] font-medium"
                style={{
                  color: isDark
                    ? colors.dark.textSecondary
                    : colors.light.textSecondary,
                }}
              >
                {item.label}
              </Text>

              {/* ==================================================
                  DATE + TIME
              ================================================== */}

              {historyItem ? (
                <View className="mt-0.5 items-center">
                  <Text
                    className="text-[9px]"
                    style={{
                      color: isDark
                        ? colors.dark.textMuted
                        : colors.light.textMuted,
                    }}
                  >
                    {formatDate(historyItem.tanggal)}
                  </Text>

                  <Text
                    className="text-[9px]"
                    style={{
                      color: isDark
                        ? colors.dark.textMuted
                        : colors.light.textMuted,
                    }}
                  >
                    {formatTime(historyItem.tanggal)}
                  </Text>
                </View>
              ) : (
                <View className="mt-0.5 h-[25px]" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ======================================================
// REJECTED TIMELINE
// ======================================================

function RejectedTimeline({ history = [], isDark }) {
  const requested = history.find((item) => item.status === "REQUESTED");

  const rejected = history.find((item) => item.status === "REJECTED");

  const completedColor = isDark
    ? colors.semantic.error.dark
    : colors.semantic.error.light;

  const pendingColor = getPendingColor(isDark);

  return (
    <View className="w-full">
      <View className="flex-row items-start">
        {/* ==================================================
            REQUESTED
        ================================================== */}

        <View className="items-center">
          <View
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: requested
                ? getCompletedColor(isDark)
                : "transparent",
              borderWidth: 1,
              borderColor: requested ? getCompletedColor(isDark) : pendingColor,
            }}
          />

          <Text
            className="mt-2 text-[10px] font-medium"
            style={{
              color: isDark
                ? colors.dark.textSecondary
                : colors.light.textSecondary,
            }}
          >
            Diajukan
          </Text>

          {requested ? (
            <>
              <Text
                className="mt-0.5 text-[9px]"
                style={{
                  color: isDark
                    ? colors.dark.textMuted
                    : colors.light.textMuted,
                }}
              >
                {formatDate(requested.tanggal)}
              </Text>

              <Text
                className="text-[9px]"
                style={{
                  color: isDark
                    ? colors.dark.textMuted
                    : colors.light.textMuted,
                }}
              >
                {formatTime(requested.tanggal)}
              </Text>
            </>
          ) : (
            <View className="h-[25px]" />
          )}
        </View>

        {/* ==================================================
            LINE
        ================================================== */}

        <View
          className="mt-[3px] h-px flex-1"
          style={{
            backgroundColor: rejected ? completedColor : pendingColor,
          }}
        />

        {/* ==================================================
            REJECTED
        ================================================== */}

        <View className="items-center">
          <View
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: rejected ? completedColor : "transparent",
              borderWidth: 1,
              borderColor: rejected ? completedColor : pendingColor,
            }}
          />

          <Text
            className="mt-2 text-[10px] font-medium"
            style={{
              color: isDark
                ? colors.dark.textSecondary
                : colors.light.textSecondary,
            }}
          >
            Ditolak
          </Text>

          {rejected ? (
            <>
              <Text
                className="mt-0.5 text-[9px]"
                style={{
                  color: isDark
                    ? colors.dark.textMuted
                    : colors.light.textMuted,
                }}
              >
                {formatDate(rejected.tanggal)}
              </Text>

              <Text
                className="text-[9px]"
                style={{
                  color: isDark
                    ? colors.dark.textMuted
                    : colors.light.textMuted,
                }}
              >
                {formatTime(rejected.tanggal)}
              </Text>
            </>
          ) : (
            <View className="h-[25px]" />
          )}
        </View>
      </View>
    </View>
  );
}

// ======================================================
// COMPLETED COLOR
// ======================================================

function getCompletedColor(isDark) {
  return isDark ? colors.semantic.success.dark : colors.semantic.success.light;
}

// ======================================================
// PENDING COLOR
// ======================================================

function getPendingColor(isDark) {
  return isDark ? colors.dark.border : colors.light.border;
}

// ======================================================
// DATE
// ======================================================

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// ======================================================
// TIME
// ======================================================

function formatTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}
