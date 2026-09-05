import {
  ScrollView,
  Text,
  View,
  useColorScheme,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

export default function AboutPage({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const currentYear = new Date().getFullYear();

  const theme = isDark ? colors.dark : colors.light;

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
        className="border-b px-4 py-3 pt-12"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: theme.surface,
            }}
          >
            <Ionicons name="arrow-back" size={21} color={theme.textPrimary} />
          </Pressable>

          <Text
            className="ml-3 text-base font-bold"
            style={{
              color: theme.textPrimary,
            }}
          >
            Tentang Aplikasi
          </Text>
        </View>
      </View>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        {/* APP IDENTITY */}

        <View className="items-center">
          <View
            className="h-24 w-24 items-center justify-center rounded-3xl"
            style={{
              backgroundColor: isDark
                ? `${colors.brand[100]}18`
                : `${colors.brand[600]}10`,
            }}
          >
            <Ionicons
              name="receipt-outline"
              size={46}
              color={isDark ? colors.brand[100] : colors.brand[600]}
            />
          </View>

          <Text
            className="mt-5 text-2xl font-bold"
            style={{
              color: theme.textPrimary,
            }}
          >
            Purchase Request
          </Text>

          <Text
            className="mt-1 text-sm"
            style={{
              color: theme.textSecondary,
            }}
          >
            Aplikasi Pengajuan Pembelian
          </Text>

          <View
            className="mt-3 rounded-full px-3 py-1"
            style={{
              backgroundColor: isDark
                ? `${colors.brand[100]}18`
                : `${colors.brand[600]}10`,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: isDark ? colors.brand[100] : colors.brand[600],
              }}
            >
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}

        <View
          className="mt-8 rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark
                  ? `${colors.brand[100]}12`
                  : `${colors.brand[600]}08`,
              }}
            >
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={isDark ? colors.brand[100] : colors.brand[600]}
              />
            </View>

            <Text
              className="ml-3 text-base font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Tentang Aplikasi
            </Text>
          </View>

          <Text
            className="mt-4 text-sm leading-6"
            style={{
              color: theme.textSecondary,
            }}
          >
            Purchase Request merupakan aplikasi internal untuk membantu proses
            pengajuan pembelian barang dan kebutuhan perusahaan secara lebih
            mudah, cepat, dan terstruktur.
          </Text>
        </View>

        {/* APPLICATION INFO */}

        <View
          className="mt-5 rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark
                  ? `${colors.brand[100]}12`
                  : `${colors.brand[600]}08`,
              }}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color={isDark ? colors.brand[100] : colors.brand[600]}
              />
            </View>

            <Text
              className="ml-3 text-base font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Informasi Aplikasi
            </Text>
          </View>

          <View
            className="mt-5 border-b pb-4"
            style={{
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Nama Aplikasi
            </Text>

            <Text
              className="mt-1 text-sm font-semibold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Purchase Request
            </Text>
          </View>

          <View
            className="border-b py-4"
            style={{
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Versi
            </Text>

            <Text
              className="mt-1 text-sm font-semibold"
              style={{
                color: theme.textPrimary,
              }}
            >
              1.0.0
            </Text>
          </View>

          <View className="pt-4">
            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Platform
            </Text>

            <Text
              className="mt-1 text-sm font-semibold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Mobile Application
            </Text>
          </View>
        </View>

        {/* DEVELOPER */}

        <View
          className="mt-5 rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark
                  ? `${colors.brand[100]}12`
                  : `${colors.brand[600]}08`,
              }}
            >
              <Ionicons
                name="business-outline"
                size={18}
                color={isDark ? colors.brand[100] : colors.brand[600]}
              />
            </View>

            <Text
              className="ml-3 text-base font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Dikembangkan Oleh
            </Text>
          </View>

          <Text
            className="mt-4 text-sm font-semibold"
            style={{
              color: theme.textPrimary,
            }}
          >
            Outlook-Project
          </Text>
        </View>

        {/* FOOTER */}

        <View className="mt-8 items-center">
          <Text
            className="text-[11px]"
            style={{
              color: theme.textMuted,
            }}
          >
            © {currentYear} Outlook-Project. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
