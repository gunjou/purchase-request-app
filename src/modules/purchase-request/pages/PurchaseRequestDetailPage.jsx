import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { colors } from "../../../theme/colors";
import {
  getPurchaseRequestDetail,
  deletePurchaseRequest,
  downloadPurchaseRequestPdf,
} from "../purchase-request.service";
import AttachmentPreviewModal from "../modal/AttachmentPreviewModal";
import DeleteConfirmModal from "../modal/DeleteConfirmModal";

export default function PurchaseRequestDetailPage({ navigation, route }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? colors.dark : colors.light;

  const idRequest = route?.params?.id;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [attachmentPreviewVisible, setAttachmentPreviewVisible] =
    useState(false);

  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ======================================================
  // LOAD DETAIL
  // ======================================================

  const loadDetail = useCallback(async () => {
    if (!idRequest) {
      setError("ID pengajuan tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getPurchaseRequestDetail(idRequest);

      setRequest(data);
    } catch (err) {
      console.error("Load purchase request detail error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal mengambil detail pengajuan.",
      );
    } finally {
      setLoading(false);
    }
  }, [idRequest]);

  // ======================================================
  // HANDLE DOWNLOAD PDF
  // ======================================================

  const handleDownloadPdf = async () => {
    try {
      if (!idRequest || !request) {
        return;
      }

      setDownloading(true);

      const response = await downloadPurchaseRequestPdf(idRequest);

      // ==================================================
      // GENERATE FILENAME
      // Pengajuan {nama pegawai} - {nama pekerjaan} DD-MM-YYYY.pdf
      // ==================================================

      const namaPegawai = request?.pegawai?.nama_lengkap || "Tidak Diketahui";

      const namaPekerjaan = request?.nama_pekerjaan || "Pengajuan";

      const tanggalPengajuan = formatDateForFilename(request?.tanggal_request);

      const filename = `Pengajuan ${namaPegawai} - ${namaPekerjaan} ${tanggalPengajuan}.pdf`;

      // ==================================================
      // FILE URI
      // ==================================================

      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // ==================================================
      // ARRAYBUFFER -> BASE64
      // ==================================================

      const bytes = new Uint8Array(response.data);

      let binary = "";

      const chunkSize = 0x8000;

      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);

        binary += String.fromCharCode(...chunk);
      }

      const base64Data = btoa(binary);

      // ==================================================
      // WRITE FILE
      // ==================================================

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // console.log("PDF saved:", fileUri);
      // console.log("PDF filename:", filename);

      // ==================================================
      // SHARE / SAVE
      // ==================================================

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "Simpan atau bagikan pengajuan",
          UTI: "com.adobe.pdf",
        });
      }
    } catch (error) {
      console.error("Download purchase request PDF error:", error);
    } finally {
      setDownloading(false);
    }
  };

  // ======================================================
  // HANDLE DELETE
  // ======================================================

  const handleDelete = async () => {
    if (!request?.id_request || request.status !== "REQUESTED") {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await deletePurchaseRequest(request.id_request);

      setDeleteModalVisible(false);

      navigation.goBack();
    } catch (err) {
      console.error("Delete purchase request error:", err);

      setDeleteError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal menghapus pengajuan.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // ======================================================
  // LOAD WHEN PAGE FOCUSED
  // ======================================================

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail]),
  );

  // ======================================================
  // REFRESH
  // ======================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDetail();
    } finally {
      setRefreshing(false);
    }
  };

  // ======================================================
  // OPEN ATTACHMENT
  // ======================================================

  const handleOpenAttachment = () => {
    if (!request?.attachment?.path) {
      return;
    }

    setAttachmentPreviewVisible(true);
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading && !request) {
    return (
      <View
        className="flex-1"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <DetailHeader
          navigation={navigation}
          idRequest={request?.id_request}
          requestNumber={request?.request_number}
          status={request?.status}
          theme={theme}
          isDark={isDark}
          onDelete={() => {
            setDeleteError("");
            setDeleteModalVisible(true);
          }}
        />

        <View className="flex-1 items-center justify-center">
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
            Memuat detail pengajuan...
          </Text>
        </View>
      </View>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error && !request) {
    return (
      <View
        className="flex-1"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <DetailHeader
          navigation={navigation}
          idRequest={request?.id_request}
          requestNumber={request?.request_number}
          status={request?.status}
          theme={theme}
          isDark={isDark}
          onDelete={() => {
            setDeleteError("");
            setDeleteModalVisible(true);
          }}
        />

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isDark
                ? `${colors.semantic.error.dark}18`
                : `${colors.semantic.error.light}12`,
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={
                isDark
                  ? colors.semantic.error.dark
                  : colors.semantic.error.light
              }
            />
          </View>

          <Text
            className="mt-4 text-center text-base font-semibold"
            style={{
              color: theme.textPrimary,
            }}
          >
            Gagal memuat pengajuan
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
            onPress={() => loadDetail()}
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
          STICKY HEADER
      ================================================== */}

      <DetailHeader
        navigation={navigation}
        idRequest={request?.id_request}
        requestNumber={request?.request_number}
        status={request?.status}
        theme={theme}
        isDark={isDark}
        onDelete={() => {
          setDeleteError("");
          setDeleteModalVisible(true);
        }}
      />

      {/* ==================================================
          SCROLLABLE CONTENT
      ================================================== */}

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
            REQUEST HERO
        ================================================== */}

        <RequestHero request={request} theme={theme} isDark={isDark} />

        {/* ==================================================
            DOWNLOAD PDF
        ================================================== */}

        <Pressable
          onPress={handleDownloadPdf}
          disabled={downloading}
          className="mt-4 flex-row items-center justify-center rounded-2xl px-4 py-4 active:opacity-70"
          style={{
            backgroundColor: colors.brand[600],
            opacity: downloading ? 0.6 : 1,
          }}
        >
          {downloading ? (
            <ActivityIndicator color={colors.neutral.white} />
          ) : (
            <Ionicons
              name="download-outline"
              size={19}
              color={colors.neutral.white}
            />
          )}

          <Text className="ml-2 text-sm font-black text-white">
            {downloading ? "Menyiapkan PDF..." : "Download PDF"}
          </Text>
        </Pressable>

        {/* ==================================================
            REQUEST INFORMATION
        ================================================== */}

        <SectionTitle
          icon="information-circle-outline"
          title="Informasi Pengajuan"
          theme={theme}
          isDark={isDark}
        />

        <View
          className="rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <InfoRow
            icon="briefcase-outline"
            label="Nama Pekerjaan"
            value={request.nama_pekerjaan}
            theme={theme}
            isDark={isDark}
          />

          <InfoRow
            icon="calendar-outline"
            label="Tanggal Pengajuan"
            value={formatDate(request.tanggal_request)}
            theme={theme}
            isDark={isDark}
          />

          <InfoRow
            icon="person-outline"
            label="Pemohon"
            value={request.pegawai?.nama_lengkap}
            theme={theme}
            isDark={isDark}
          />

          <InfoRow
            icon="business-outline"
            label="Departemen"
            value={request.departemen?.nama_departemen}
            theme={theme}
            isDark={isDark}
            last
          />
        </View>

        {/* ==================================================
            NOTE
        ================================================== */}

        {request.note ? (
          <>
            <SectionTitle
              icon="chatbox-ellipses-outline"
              title="Catatan Pengajuan"
              theme={theme}
              isDark={isDark}
            />

            <View
              className="rounded-3xl border p-5"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <Text
                className="text-sm leading-6"
                style={{
                  color: theme.textSecondary,
                }}
              >
                {request.note}
              </Text>
            </View>
          </>
        ) : null}

        {/* ==================================================
            ITEMS
        ================================================== */}

        <SectionTitle
          icon="list-outline"
          title="Rincian Pengajuan"
          theme={theme}
          isDark={isDark}
        />

        <View
          className="overflow-hidden rounded-3xl border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          {request.items?.map((item, index) => (
            <RequestItem
              key={item.id_item}
              item={item}
              index={index}
              theme={theme}
              isDark={isDark}
              last={index === request.items.length - 1}
            />
          ))}

          <View
            className="border-t px-5 py-4"
            style={{
              borderColor: theme.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm font-medium"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Total Pengajuan
              </Text>

              <Text
                className="text-xl font-bold"
                style={{
                  color: colors.brand[600],
                }}
              >
                {formatCurrency(request.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================
            PAYMENT
        ================================================== */}

        {request.payment ? (
          <>
            <SectionTitle
              icon="card-outline"
              title="Informasi Pembayaran"
              theme={theme}
              isDark={isDark}
            />

            <View
              className="rounded-3xl border p-5"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <InfoRow
                icon="document-text-outline"
                label="Keterangan"
                value={request.payment.description}
                theme={theme}
                isDark={isDark}
              />

              <InfoRow
                icon="business-outline"
                label="Bank"
                value={request.payment.bank}
                theme={theme}
                isDark={isDark}
              />

              <InfoRow
                icon="keypad-outline"
                label="Nomor Rekening"
                value={request.payment.account_number}
                theme={theme}
                isDark={isDark}
              />

              <InfoRow
                icon="person-outline"
                label="Nama Rekening"
                value={request.payment.account_name}
                theme={theme}
                isDark={isDark}
                last
              />
            </View>
          </>
        ) : null}

        {/* ==================================================
            ATTACHMENT
        ================================================== */}

        {request.attachment?.path ? (
          <>
            <SectionTitle
              icon="attach-outline"
              title="Lampiran"
              theme={theme}
              isDark={isDark}
            />

            <Pressable
              onPress={handleOpenAttachment}
              className="flex-row items-center rounded-3xl border p-4 active:opacity-70"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: isDark
                    ? `${colors.brand[100]}18`
                    : `${colors.brand[600]}10`,
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={isDark ? colors.brand[100] : colors.brand[600]}
                />
              </View>

              <View className="ml-3 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-sm font-semibold"
                  style={{
                    color: theme.textPrimary,
                  }}
                >
                  {request.attachment.name || "Lampiran"}
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{
                    color: theme.textMuted,
                  }}
                >
                  Ketuk untuk melihat lampiran
                </Text>
              </View>

              <Ionicons
                name="eye-outline"
                size={19}
                color={isDark ? colors.brand[100] : colors.brand[600]}
              />
            </Pressable>
          </>
        ) : null}

        {/* ==================================================
            HISTORY
        ================================================== */}

        <SectionTitle
          icon="git-branch-outline"
          title="Riwayat Pengajuan"
          theme={theme}
          isDark={isDark}
        />

        <View
          className="rounded-3xl border p-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <HistoryTimeline
            history={request.history || []}
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <View className="mt-6 items-center">
          <Text
            className="text-[11px]"
            style={{
              color: theme.textMuted,
            }}
          >
            Dibuat {formatDateTime(request.created_at)}
          </Text>

          <Text
            className="mt-1 text-[11px]"
            style={{
              color: theme.textMuted,
            }}
          >
            Diperbarui {formatDateTime(request.updated_at)}
          </Text>
        </View>
      </ScrollView>

      {/* ATTACHMENT PREVIEW */}
      <AttachmentPreviewModal
        visible={attachmentPreviewVisible}
        onClose={() => setAttachmentPreviewVisible(false)}
        attachment={request?.attachment}
        theme={theme}
        isDark={isDark}
      />

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        loading={deleting}
        error={deleteError}
        theme={theme}
        isDark={isDark}
        onCancel={() => {
          if (deleting) return;

          setDeleteModalVisible(false);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
      />
    </View>
  );
}

/* ============================================================
   STICKY HEADER
============================================================ */

/* ============================================================
   STICKY HEADER
============================================================ */

function DetailHeader({
  navigation,
  idRequest,
  requestNumber,
  status,
  theme,
  isDark,
  onDelete,
}) {
  const canModify = status === "REQUESTED";

  const handleEdit = () => {
    if (!canModify) {
      return;
    }

    navigation.navigate("PurchaseRequestEdit", {
      id_request: idRequest,
    });
  };

  const handleDelete = () => {
    if (!canModify) {
      return;
    }

    onDelete?.();
  };

  return (
    <View
      className="border-b px-4 py-3 pt-12"
      style={{
        backgroundColor: theme.background,
        borderColor: theme.border,
      }}
    >
      <View className="flex-row items-center">
        {/* BACK */}

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

        {/* TITLE */}

        <View className="ml-3 flex-1">
          <Text
            className="text-base font-bold"
            style={{
              color: theme.textPrimary,
            }}
          >
            Detail Pengajuan
          </Text>

          {requestNumber ? (
            <Text
              className="mt-0.5 text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              {requestNumber}
            </Text>
          ) : null}
        </View>

        {/* ACTIONS */}

        <View className="ml-3 flex-row items-center gap-2">
          {/* EDIT */}

          <Pressable
            onPress={handleEdit}
            disabled={!canModify}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: canModify ? theme.surface : theme.surfaceAlt,
              opacity: canModify ? 1 : 0.7,
            }}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={canModify ? theme.on : theme.on}
            />
          </Pressable>

          {/* DELETE */}

          <Pressable
            onPress={onDelete}
            disabled={status !== "REQUESTED"}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor:
                status === "REQUESTED" ? theme.surface : theme.surfaceAlt,
              opacity: status === "REQUESTED" ? 1 : 0.7,
            }}
          >
            <Ionicons
              name="trash-outline"
              size={19}
              color={
                status === "REQUESTED"
                  ? colors.semantic.error.light
                  : theme.textMuted
              }
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   REQUEST HERO
============================================================ */

function RequestHero({ request, theme, isDark }) {
  const priority = getPriority(request.priority);

  return (
    <View
      className="overflow-hidden rounded-3xl border"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      <View className="p-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-xs font-medium"
              style={{
                color: theme.textMuted,
              }}
            >
              {request.request_number}
            </Text>

            <Text
              className="mt-1 text-xl font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              {request.nama_pekerjaan}
            </Text>
          </View>

          {/* PRIORITY */}

          <View
            className="flex-row items-center rounded-full px-3 py-2"
            style={{
              backgroundColor: isDark
                ? `${priority.color}20`
                : `${priority.color}12`,
            }}
          >
            <Ionicons name="flag-outline" size={14} color={priority.color} />

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

        <View className="mt-5 flex-row items-end justify-between">
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
              className="mt-1 text-2xl font-bold"
              style={{
                color: colors.brand[600],
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
              Diajukan
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
    </View>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({ icon, title, theme }) {
  return (
    <View className="mb-3 mt-7 flex-row items-center">
      <Ionicons name={icon} size={18} color={colors.brand[600]} />

      <Text
        className="ml-2 text-base font-bold"
        style={{
          color: theme.textPrimary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({ icon, label, value, theme, isDark, last = false }) {
  return (
    <View
      className={`flex-row ${last ? "" : "border-b pb-4"} ${
        last ? "" : "mb-4"
      }`}
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
          className="mt-1 text-sm font-semibold leading-5"
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
   REQUEST ITEM
============================================================ */

function RequestItem({ item, index, theme, isDark, last }) {
  return (
    <View
      className={`px-5 py-4 ${last ? "" : "border-b"}`}
      style={{
        borderColor: theme.border,
      }}
    >
      <View className="flex-row items-start">
        <View
          className="h-7 w-7 items-center justify-center rounded-lg"
          style={{
            backgroundColor: isDark
              ? `${colors.brand[100]}12`
              : `${colors.brand[600]}08`,
          }}
        >
          <Text
            className="text-xs font-bold"
            style={{
              color: isDark ? colors.brand[100] : colors.brand[600],
            }}
          >
            {index + 1}
          </Text>
        </View>

        <View className="ml-3 flex-1">
          <Text
            className="text-sm font-semibold"
            style={{
              color: theme.textPrimary,
            }}
          >
            {item.keterangan}
          </Text>

          <View className="mt-2 flex-row items-center">
            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              {item.jumlah} {item.unit}
            </Text>

            <View
              className="mx-2 h-1 w-1 rounded-full"
              style={{
                backgroundColor: theme.textMuted,
              }}
            />

            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              {formatCurrency(item.harga_satuan)} / unit
            </Text>
          </View>
        </View>

        <Text
          className="ml-3 text-sm font-bold"
          style={{
            color: theme.textPrimary,
          }}
        >
          {formatCurrency(item.total)}
        </Text>
      </View>
    </View>
  );
}

function HistoryTimeline({ history, theme, isDark }) {
  const statusFlow = [
    {
      status: "REQUESTED",
      label: "Requested",
    },
    {
      status: "REVIEWED",
      label: "Reviewed",
    },
    {
      status: "APPROVED",
      label: "Approved",
    },
    {
      status: "PAID",
      label: "Paid",
    },
  ];

  const historyMap = history.reduce((acc, item) => {
    acc[item.status] = item;
    return acc;
  }, {});

  const lastCompletedIndex = statusFlow.reduce((lastIndex, item, index) => {
    return historyMap[item.status] ? index : lastIndex;
  }, -1);

  const rejectedHistory = historyMap.REJECTED;

  const timelineItems = [
    ...statusFlow.map((item, index) => ({
      ...item,
      history: historyMap[item.status] || null,
      completed: index <= lastCompletedIndex,
    })),

    ...(rejectedHistory
      ? [
          {
            status: "REJECTED",
            label: "Ditolak",
            history: rejectedHistory,
            completed: true,
          },
        ]
      : []),
  ];

  const completedColor = isDark
    ? colors.semantic.success.dark
    : colors.semantic.success.light;

  const pendingColor = theme.border;

  if (!timelineItems.length) {
    return (
      <Text
        className="text-sm"
        style={{
          color: theme.textMuted,
        }}
      >
        Belum ada riwayat pengajuan.
      </Text>
    );
  }

  return (
    <View>
      {timelineItems.map((item, index) => {
        const isLast = index === timelineItems.length - 1;

        const dotColor = item.completed ? completedColor : pendingColor;

        const lineColor = item.completed ? theme.textMuted : theme.border;

        return (
          <View key={`${item.status}-${index}`} className="flex-row">
            {/* ==================================================
                TIMELINE
            ================================================== */}

            <View className="mr-4 w-5 items-center">
              <View
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: dotColor,
                }}
              />

              {!isLast ? (
                <View
                  className="absolute top-3 h-full w-px"
                  style={{
                    backgroundColor: lineColor,
                  }}
                />
              ) : null}
            </View>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <View className={`flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: theme.textPrimary,
                    }}
                  >
                    {item.label}
                  </Text>

                  <Text
                    className="mt-1 text-xs"
                    style={{
                      color: theme.textSecondary,
                    }}
                  >
                    {item.history?.nama_pegawai || "-"}
                  </Text>
                </View>

                <Text
                  className="text-[10px]"
                  style={{
                    color: theme.textMuted,
                  }}
                >
                  {item.history?.created_at
                    ? formatDateTime(item.history.created_at)
                    : "-"}
                </Text>
              </View>

              {item.history?.note ? (
                <View
                  className="mt-3 rounded-xl px-3 py-2.5"
                  style={{
                    backgroundColor: theme.surfaceAlt,
                  }}
                >
                  <Text
                    className="text-xs leading-5"
                    style={{
                      color: theme.textSecondary,
                    }}
                  >
                    {item.history.note}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ============================================================
   STATUS
============================================================ */

function getStatus(status) {
  switch (status) {
    case "REQUESTED":
      return {
        label: "Diajukan",
        color: colors.status.requested.light,
        darkColor: colors.status.requested.dark,
        icon: "paper-plane-outline",
      };

    case "REVIEWED":
      return {
        label: "Direview",
        color: colors.status.reviewed.light,
        darkColor: colors.status.reviewed.dark,
        icon: "eye-outline",
      };

    case "APPROVED":
      return {
        label: "Disetujui",
        color: colors.status.approved.light,
        darkColor: colors.status.approved.dark,
        icon: "checkmark-circle-outline",
      };

    case "PAID":
      return {
        label: "Dibayar",
        color: colors.status.paid.light,
        darkColor: colors.status.paid.dark,
        icon: "wallet-outline",
      };

    case "REJECTED":
      return {
        label: "Ditolak",
        color: colors.status.rejected.light,
        darkColor: colors.status.rejected.dark,
        icon: "close-circle-outline",
      };

    default:
      return {
        label: status || "-",
        color: colors.light.textMuted,
        darkColor: colors.dark.textMuted,
        icon: "help-circle-outline",
      };
  }
}

/* ============================================================
   PRIORITY
============================================================ */

function getPriority(priority) {
  switch (priority) {
    case "URGENT":
      return {
        label: "Urgent",
        color: colors.semantic.warning.light,
      };

    case "TOP_URGENT":
      return {
        label: "Top Urgent",
        color: colors.semantic.error.light,
      };

    case "NORMAL":
    default:
      return {
        label: "Normal",
        color: colors.light.textSecondary,
      };
  }
}

/* ============================================================
   FORMAT
============================================================ */

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

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

function formatDateForFilename(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
