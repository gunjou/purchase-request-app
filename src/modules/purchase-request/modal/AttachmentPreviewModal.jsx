import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import { colors } from "../../../theme/colors";

export default function AttachmentPreviewModal({
  visible,
  onClose,
  attachment,
  theme,
  isDark,
}) {
  if (!attachment?.path) {
    return null;
  }

  const isImage = isImageFile(attachment.name, attachment.path);

  const pdfViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    attachment.path,
  )}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
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
          className="flex-row items-center border-b px-4 py-3 pt-12"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-xl active:opacity-60"
            style={{
              backgroundColor: theme.surface,
            }}
          >
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Lampiran
            </Text>

            <Text
              numberOfLines={1}
              className="mt-0.5 text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              {attachment.name || "Dokumen"}
            </Text>
          </View>
        </View>

        {/* ==================================================
            PREVIEW
        ================================================== */}

        <View className="flex-1">
          {isImage ? (
            <View className="flex-1 items-center justify-center">
              <Image
                source={{
                  uri: attachment.path,
                }}
                resizeMode="contain"
                className="h-full w-full"
              />
            </View>
          ) : (
            <WebView
              source={{
                uri: pdfViewerUrl,
              }}
              style={{
                flex: 1,
                backgroundColor: theme.background,
              }}
              startInLoadingState
              renderLoading={() => (
                <View
                  className="absolute inset-0 items-center justify-center"
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
                    Memuat dokumen...
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function isImageFile(name = "", path = "") {
  const value = `${name} ${path}`.toLowerCase();

  return (
    value.includes(".jpg") ||
    value.includes(".jpeg") ||
    value.includes(".png") ||
    value.includes(".webp") ||
    value.includes(".gif")
  );
}
