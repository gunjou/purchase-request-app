import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { colors } from "../../../theme/colors";

import {
  getDepartments,
  getPurchaseRequestHistory,
} from "../purchase-request.service";

// ======================================================
// STATUS OPTIONS
// ======================================================

const STATUS_OPTIONS = [
  {
    value: "PAID",
    label: "Dibayar",
  },
  {
    value: "REJECTED",
    label: "Ditolak",
  },
];

const PER_PAGE = 10;

// ======================================================
// PAGE
// ======================================================

export default function PurchaseRequestHistoryPage({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? colors.dark : colors.light;

  // ======================================================
  // STATUS
  // ======================================================

  const [status, setStatus] = useState("PAID");

  // ======================================================
  // DATE FILTER
  // ======================================================

  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState(null);

  // ======================================================
  // DEPARTMENT FILTER
  // ======================================================

  const [departments, setDepartments] = useState([]);
  const [idDepartemen, setIdDepartemen] = useState(null);

  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);

  // ======================================================
  // DATA
  // ======================================================

  const [requests, setRequests] = useState([]);

  const [page, setPage] = useState(1);

  const [pageInfo, setPageInfo] = useState({
    page: 1,
    per_page: PER_PAGE,
    total: 0,
    total_pages: 1,
  });

  // ======================================================
  // UI
  // ======================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // ======================================================
  // DATE PICKER
  // ======================================================

  const openDatePicker = (target) => {
    setDatePickerTarget(target);
    setDatePickerVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setDatePickerVisible(false);

    if (!selectedDate) {
      setDatePickerTarget(null);
      return;
    }

    const value = formatDateForApi(selectedDate);

    if (datePickerTarget === "start") {
      setTanggalMulai(value);
    }

    if (datePickerTarget === "end") {
      setTanggalSelesai(value);
    }

    setDatePickerTarget(null);

    // Set kembali ke halaman pertama
    setPage(1);
  };

  // ======================================================
  // LOAD DEPARTMENTS
  // ======================================================

  const loadDepartments = useCallback(async () => {
    try {
      const result = await getDepartments();

      /*
       * Antisipasi apabila service mengembalikan:
       *
       * 1. data array langsung
       * 2. response.data array
       * 3. response.data.data
       */

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.data)
            ? result.data.data
            : [];

      setDepartments(data);
    } catch (err) {
      console.error("Load departments error:", err);
    }
  }, []);

  // ======================================================
  // LOAD HISTORY
  // ======================================================

  const loadHistory = useCallback(async () => {
    try {
      setError("");

      const params = {
        status,
        page,
        per_page: PER_PAGE,
      };

      // --------------------------------------------------
      // DATE
      // --------------------------------------------------

      if (tanggalMulai) {
        params.tanggal_mulai = tanggalMulai;
      }

      if (tanggalSelesai) {
        params.tanggal_selesai = tanggalSelesai;
      }

      // --------------------------------------------------
      // DEPARTMENT
      // --------------------------------------------------

      if (idDepartemen) {
        params.id_departemen = Number(idDepartemen);
      }

      // console.log("History params:", params);

      const result = await getPurchaseRequestHistory(params);

      /*
       * Endpoint:
       *
       * {
       *   code: 200,
       *   success: true,
       *   data: {
       *     data: [...],
       *     page_info: {...}
       *   }
       * }
       *
       * Apabila service sudah melakukan return response.data,
       * maka bentuknya menjadi:
       *
       * {
       *   data: [...],
       *   page_info: {...}
       * }
       */

      const payload = result?.data ?? result;

      const historyData = Array.isArray(payload?.data) ? payload.data : [];

      const historyPageInfo = payload?.page_info || {
        page,
        per_page: PER_PAGE,
        total: historyData.length,
        total_pages: 1,
      };

      setRequests(historyData);
      setPageInfo(historyPageInfo);
    } catch (err) {
      console.error("Load purchase request history error:", err);

      setRequests([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal mengambil riwayat pengajuan.",
      );
    }
  }, [status, page, tanggalMulai, tanggalSelesai, idDepartemen]);

  // ======================================================
  // INITIAL / FOCUS LOAD
  // ======================================================

  useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        setLoading(true);

        await Promise.all([loadHistory(), loadDepartments()]);

        setLoading(false);
      };

      loadInitialData();
    }, [loadHistory, loadDepartments]),
  );

  // ======================================================
  // REFRESH
  // ======================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      if (page !== 1) {
        setPage(1);
      }

      /*
       * Langsung reload menggunakan filter saat ini.
       * Tidak bergantung pada state page yang baru berubah.
       */
      const params = {
        status,
        page: 1,
        per_page: PER_PAGE,
      };

      if (tanggalMulai) {
        params.tanggal_mulai = tanggalMulai;
      }

      if (tanggalSelesai) {
        params.tanggal_selesai = tanggalSelesai;
      }

      if (idDepartemen) {
        params.id_departemen = Number(idDepartemen);
      }

      const result = await getPurchaseRequestHistory(params);

      const payload = result?.data ?? result;

      const historyData = Array.isArray(payload?.data) ? payload.data : [];

      const historyPageInfo = payload?.page_info || {
        page: 1,
        per_page: PER_PAGE,
        total: historyData.length,
        total_pages: 1,
      };

      setRequests(historyData);
      setPageInfo(historyPageInfo);
    } catch (err) {
      console.error("Refresh history error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal memperbarui riwayat.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ======================================================
  // STATUS
  // ======================================================

  const handleStatusChange = (value) => {
    if (value === status) {
      return;
    }

    setStatus(value);
    setPage(1);
  };

  // ======================================================
  // FILTER
  // ======================================================

  const resetFilter = () => {
    setTanggalMulai("");
    setTanggalSelesai("");
    setIdDepartemen(null);

    setPage(1);

    setFilterModalVisible(false);
  };

  const applyFilter = () => {
    setPage(1);
    setFilterModalVisible(false);
  };

  const activeFilterCount =
    Number(Boolean(idDepartemen)) +
    Number(Boolean(tanggalMulai)) +
    Number(Boolean(tanggalSelesai));

  // ======================================================
  // SELECTED DEPARTMENT
  // ======================================================

  const selectedDepartment = departments.find(
    (item) => Number(item.id_departemen) === Number(idDepartemen),
  );

  // ======================================================
  // PAGINATION
  // ======================================================

  const currentPage = Number(pageInfo.page || page);

  const totalPages = Number(pageInfo.total_pages || 1);

  const canPrevious = currentPage > 1;

  const canNext = currentPage < totalPages;

  const handlePreviousPage = () => {
    if (!canPrevious) {
      return;
    }

    setPage((current) => current - 1);
  };

  const handleNextPage = () => {
    if (!canNext) {
      return;
    }

    setPage((current) => current + 1);
  };

  // ======================================================
  // NAVIGATION
  // ======================================================

  const handleRequestPress = (item) => {
    navigation.navigate("PurchaseRequestDetail", {
      id: item.id_request,
    });
  };

  // ======================================================
  // RENDER
  // ======================================================

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
        className="border-b px-5 pb-4"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
          paddingTop: 52,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: colors.brand[600],
              }}
            >
              Purchase Request
            </Text>

            <Text
              className="mt-1 text-2xl font-black"
              style={{
                color: theme.textPrimary,
              }}
            >
              History
            </Text>

            <Text
              className="mt-1 text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Riwayat pengajuan yang telah selesai diproses.
            </Text>
          </View>

          {/* FILTER BUTTON */}

          <Pressable
            onPress={() => setFilterModalVisible(true)}
            className="relative ml-3 h-11 w-11 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <Ionicons
              name="options-outline"
              size={21}
              color={theme.textPrimary}
            />

            {activeFilterCount > 0 ? (
              <View
                className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full px-1"
                style={{
                  backgroundColor: colors.brand[600],
                }}
              >
                <Text className="text-[9px] font-black text-white">
                  {activeFilterCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      {/* ==================================================
          STATUS TABS
      ================================================== */}

      <View
        className="border-b"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          {STATUS_OPTIONS.map((item) => {
            const active = status === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => handleStatusChange(item.value)}
                className="mr-2 rounded-xl border px-5 py-2.5"
                style={{
                  backgroundColor: active ? colors.brand[600] : theme.surface,

                  borderColor: active ? colors.brand[600] : theme.border,
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{
                    color: active ? colors.neutral.white : theme.textSecondary,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[600]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 120,
        }}
      >
        {/* ERROR */}

        {error ? (
          <View
            className="mb-5 rounded-2xl border-2 px-4 py-3"
            style={{
              backgroundColor: isDark
                ? `${colors.semantic.error.dark}18`
                : `${colors.semantic.error.light}12`,

              borderColor: isDark
                ? `${colors.semantic.error.dark}40`
                : `${colors.semantic.error.light}30`,
            }}
          >
            <View className="flex-row items-start">
              <Ionicons
                name="alert-circle-outline"
                size={19}
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

        {/* LOADING */}

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="small" color={colors.brand[600]} />

            <Text
              className="mt-3 text-sm"
              style={{
                color: theme.textSecondary,
              }}
            >
              Memuat history...
            </Text>
          </View>
        ) : requests.length === 0 ? (
          <EmptyHistoryState theme={theme} isDark={isDark} status={status} />
        ) : (
          <>
            {/* RESULT INFO */}

            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-sm font-bold"
                  style={{
                    color: theme.textPrimary,
                  }}
                >
                  Riwayat Pengajuan
                </Text>

                <Text
                  className="mt-0.5 text-[10px]"
                  style={{
                    color: theme.textMuted,
                  }}
                >
                  {status === "PAID"
                    ? "Pengajuan telah dibayar"
                    : "Pengajuan ditolak"}
                </Text>
              </View>

              <Text
                className="text-xs font-semibold"
                style={{
                  color: theme.textMuted,
                }}
              >
                {pageInfo.total} data
              </Text>
            </View>

            {/* REQUEST LIST */}

            {requests.map((item) => (
              <HistoryRequestCard
                key={item.id_request}
                item={item}
                theme={theme}
                isDark={isDark}
                onPress={() => handleRequestPress(item)}
              />
            ))}

            {/* PAGINATION */}

            <View
              className="mt-2 flex-row items-center justify-between rounded-2xl border px-3 py-3"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              {/* PREVIOUS */}

              <Pressable
                onPress={handlePreviousPage}
                disabled={!canPrevious}
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: canPrevious
                    ? theme.surfaceAlt
                    : theme.background,

                  opacity: canPrevious ? 1 : 0.4,
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={theme.textPrimary}
                />
              </Pressable>

              {/* PAGE INFO */}

              <View className="items-center">
                <Text
                  className="text-xs font-bold"
                  style={{
                    color: theme.textPrimary,
                  }}
                >
                  Halaman {currentPage} dari {totalPages}
                </Text>

                <Text
                  className="mt-0.5 text-[10px]"
                  style={{
                    color: theme.textMuted,
                  }}
                >
                  {pageInfo.total} total pengajuan
                </Text>
              </View>

              {/* NEXT */}

              <Pressable
                onPress={handleNextPage}
                disabled={!canNext}
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: canNext
                    ? theme.surfaceAlt
                    : theme.background,

                  opacity: canNext ? 1 : 0.4,
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.textPrimary}
                />
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* ==================================================
          FILTER MODAL
      ================================================== */}

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
          onPress={() => setFilterModalVisible(false)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="rounded-t-[30px] border px-5 pb-8 pt-5"
            style={{
              backgroundColor: theme.background,
              borderColor: theme.border,
            }}
          >
            {/* HEADER */}

            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-xl font-black"
                  style={{
                    color: theme.textPrimary,
                  }}
                >
                  Filter History
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{
                    color: theme.textMuted,
                  }}
                >
                  Filter berdasarkan departemen dan periode.
                </Text>
              </View>

              <Pressable
                onPress={() => setFilterModalVisible(false)}
                className="h-10 w-10 items-center justify-center rounded-xl border"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }}
              >
                <Ionicons
                  name="close-outline"
                  size={21}
                  color={theme.textPrimary}
                />
              </Pressable>
            </View>

            {/* ==================================================
                DEPARTMENT
            ================================================== */}

            <Text
              className="mb-2 text-sm font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Departemen
            </Text>

            <Pressable
              onPress={() => setDepartmentModalVisible(true)}
              className="mb-5 flex-row items-center justify-between rounded-2xl border-2 px-4 py-4"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <Text
                className="flex-1 text-sm"
                style={{
                  color: selectedDepartment
                    ? theme.textPrimary
                    : theme.textMuted,
                }}
              >
                {selectedDepartment?.nama_departemen || "Semua departemen"}
              </Text>

              <Ionicons
                name="chevron-down-outline"
                size={19}
                color={theme.textMuted}
              />
            </Pressable>

            {/* ==================================================
                DATE
            ================================================== */}

            <Text
              className="mb-2 text-sm font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Periode
            </Text>

            <View className="flex-row gap-3">
              <DateInput
                label="Mulai"
                value={tanggalMulai}
                onPress={() => openDatePicker("start")}
                theme={theme}
              />

              <DateInput
                label="Selesai"
                value={tanggalSelesai}
                onPress={() => openDatePicker("end")}
                theme={theme}
              />
            </View>

            {/* ==================================================
                ACTION
            ================================================== */}

            <View className="mt-7 flex-row gap-3">
              <Pressable
                onPress={resetFilter}
                className="flex-1 items-center justify-center rounded-2xl border px-4 py-4"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{
                    color: theme.textPrimary,
                  }}
                >
                  Reset
                </Text>
              </Pressable>

              <Pressable
                onPress={applyFilter}
                className="flex-[1.5] items-center justify-center rounded-2xl border px-4 py-4"
                style={{
                  backgroundColor: colors.brand[600],
                  borderColor: colors.brand[800],
                }}
              >
                <Text className="text-sm font-black text-white">
                  Terapkan Filter
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>

        {/* ==================================================
            DATE PICKER
        ================================================== */}

        {datePickerVisible ? (
          <DateTimePicker
            value={
              datePickerTarget === "start" && tanggalMulai
                ? new Date(`${tanggalMulai}T00:00:00`)
                : datePickerTarget === "end" && tanggalSelesai
                  ? new Date(`${tanggalSelesai}T00:00:00`)
                  : new Date()
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
            themeVariant={isDark ? "dark" : "light"}
            maximumDate={new Date()}
          />
        ) : null}
      </Modal>

      {/* ==================================================
          DEPARTMENT MODAL
      ================================================== */}

      <Modal
        visible={departmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDepartmentModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
          onPress={() => setDepartmentModalVisible(false)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="rounded-t-[30px] px-5 pb-8 pt-5"
            style={{
              backgroundColor: theme.background,
            }}
          >
            {/* HEADER */}

            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-lg font-black"
                  style={{
                    color: theme.textPrimary,
                  }}
                >
                  Pilih Departemen
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{
                    color: theme.textMuted,
                  }}
                >
                  Filter berdasarkan departemen.
                </Text>
              </View>

              <Pressable
                onPress={() => setDepartmentModalVisible(false)}
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: theme.surfaceAlt,
                }}
              >
                <Ionicons
                  name="close-outline"
                  size={21}
                  color={theme.textPrimary}
                />
              </Pressable>
            </View>

            {/* ALL DEPARTMENT */}

            <Pressable
              onPress={() => {
                setIdDepartemen(null);
                setDepartmentModalVisible(false);
                setPage(1);
              }}
              className="mb-2 flex-row items-center rounded-2xl border-2 px-4 py-4"
              style={{
                backgroundColor: !idDepartemen
                  ? isDark
                    ? "rgba(140,16,7,0.20)"
                    : `${colors.brand[600]}10`
                  : theme.surface,

                borderColor: !idDepartemen ? colors.brand[600] : theme.border,
              }}
            >
              <Text
                className="flex-1 text-sm font-semibold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Semua departemen
              </Text>

              {!idDepartemen ? (
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={colors.brand[600]}
                />
              ) : null}
            </Pressable>

            {/* DEPARTMENT LIST */}

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                maxHeight: 400,
              }}
            >
              {departments.length === 0 ? (
                <View className="items-center py-8">
                  <Text
                    className="text-sm"
                    style={{
                      color: theme.textMuted,
                    }}
                  >
                    Tidak ada departemen.
                  </Text>
                </View>
              ) : (
                departments.map((department) => {
                  const selected =
                    Number(idDepartemen) === Number(department.id_departemen);

                  return (
                    <Pressable
                      key={department.id_departemen}
                      onPress={() => {
                        setIdDepartemen(department.id_departemen);

                        setDepartmentModalVisible(false);

                        setPage(1);
                      }}
                      className="mb-2 flex-row items-center rounded-2xl border px-4 py-4"
                      style={{
                        backgroundColor: selected
                          ? isDark
                            ? "rgba(140,16,7,0.20)"
                            : `${colors.brand[600]}10`
                          : theme.surface,

                        borderColor: selected
                          ? colors.brand[600]
                          : theme.border,
                      }}
                    >
                      <Text
                        className="flex-1 text-sm font-semibold"
                        style={{
                          color: theme.textPrimary,
                        }}
                      >
                        {department.nama_departemen}
                      </Text>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color={colors.brand[600]}
                        />
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ======================================================
// HISTORY CARD
// ======================================================

function HistoryRequestCard({ item, theme, isDark, onPress }) {
  const status = getStatusConfig(item.status, isDark);
  const priority = getPriority(item.priority, isDark);

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-[24px] border active:opacity-80"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      {/* STATUS ACCENT */}

      <View
        className="h-1.5"
        style={{
          backgroundColor: status.color,
        }}
      />

      <View className="p-4">
        {/* HEADER */}

        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-[10px] font-black uppercase tracking-wider"
              style={{
                color: colors.brand[600],
              }}
            >
              {item.request_number}
            </Text>

            <Text
              numberOfLines={2}
              className="mt-1 text-base font-black"
              style={{
                color: theme.textPrimary,
              }}
            >
              {item.nama_pekerjaan}
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

        {/* DIVIDER */}

        <View
          className="my-4 border-t"
          style={{
            borderColor: theme.border,
          }}
        />

        {/* INFO */}

        <View className="flex-row">
          {/* DATE */}

          <View className="flex-1">
            <Text
              className="text-[10px] font-semibold"
              style={{
                color: theme.textMuted,
              }}
            >
              Tanggal
            </Text>

            <Text
              className="mt-1 text-xs font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              {formatDisplayDate(item.tanggal_request)}
            </Text>
          </View>

          {/* DEPARTMENT */}

          <View className="flex-1">
            <Text
              className="text-[10px] font-semibold"
              style={{
                color: theme.textMuted,
              }}
            >
              Departemen
            </Text>

            <Text
              numberOfLines={1}
              className="mt-1 text-xs font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              {item.nama_departemen || "-"}
            </Text>
          </View>

          {/* STATUS */}

          <View
            className="rounded-xl border px-2.5 py-2"
            style={{
              backgroundColor: status.background,
              borderColor: status.color,
            }}
          >
            <Text
              className="text-[10px] font-black"
              style={{
                color: status.color,
              }}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* BOTTOM */}

        <View className="mt-4 flex-row items-end justify-between">
          <View>
            <Text
              className="text-[10px]"
              style={{
                color: theme.textMuted,
              }}
            >
              Total Pengajuan
            </Text>

            <Text
              className="mt-0.5 text-lg font-black"
              style={{
                color: theme.textPrimary,
              }}
            >
              {formatCurrency(item.total_amount)}
            </Text>
          </View>

          <View
            className="h-9 w-9 items-center justify-center rounded-xl border"
            style={{
              borderColor: theme.border,
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={17}
              color={theme.textPrimary}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyHistoryState({ theme, isDark, status }) {
  return (
    <View
      className="items-center rounded-[26px] border-2 px-6 py-10"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: isDark
            ? `${colors.brand[600]}20`
            : `${colors.brand[600]}12`,
        }}
      >
        <Ionicons
          name={
            status === "PAID"
              ? "checkmark-circle-outline"
              : "close-circle-outline"
          }
          size={32}
          color={colors.brand[600]}
        />
      </View>

      <Text
        className="mt-5 text-lg font-black"
        style={{
          color: theme.textPrimary,
        }}
      >
        Belum ada history
      </Text>

      <Text
        className="mt-2 text-center text-sm leading-5"
        style={{
          color: theme.textSecondary,
        }}
      >
        Belum ada pengajuan dengan status{" "}
        {status === "PAID" ? "dibayar" : "ditolak"}.
      </Text>
    </View>
  );
}

// ======================================================
// DATE INPUT
// ======================================================

function DateInput({ label, value, onPress, theme }) {
  return (
    <View className="flex-1">
      <Text
        className="mb-2 text-[10px] font-bold"
        style={{
          color: theme.textMuted,
        }}
      >
        {label}
      </Text>

      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between rounded-2xl border-2 px-3 py-3"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }}
      >
        <Text
          className="text-xs font-semibold"
          style={{
            color: value ? theme.textPrimary : theme.textMuted,
          }}
        >
          {value ? formatDisplayDate(value) : "Pilih tanggal"}
        </Text>

        <Ionicons name="calendar-outline" size={17} color={theme.textMuted} />
      </Pressable>
    </View>
  );
}

// ======================================================
// STATUS CONFIG
// ======================================================

function getStatusConfig(status, isDark) {
  switch (status) {
    case "PAID":
      return {
        label: "Dibayar",

        color: isDark ? colors.status.paid.dark : colors.status.paid.light,

        background: isDark
          ? `${colors.status.paid.dark}18`
          : `${colors.status.paid.light}12`,
      };

    case "REJECTED":
      return {
        label: "Ditolak",

        color: isDark
          ? colors.status.rejected.dark
          : colors.status.rejected.light,

        background: isDark
          ? `${colors.status.rejected.dark}18`
          : `${colors.status.rejected.light}12`,
      };

    default:
      return {
        label: status || "-",

        color: isDark ? colors.dark.textMuted : colors.light.textMuted,

        background: isDark ? colors.dark.surfaceAlt : colors.light.surfaceAlt,
      };
  }
}

// ======================================================
// PRIORITY
// ======================================================

function getPriority(priority, isDark) {
  switch (priority) {
    case "URGENT":
      return {
        label: "Urgent",

        color: isDark
          ? colors.semantic.warning.dark
          : colors.semantic.warning.light,
      };

    case "TOP_URGENT":
      return {
        label: "Top Urgent",

        color: isDark
          ? colors.semantic.error.dark
          : colors.semantic.error.light,
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
// HELPERS
// ======================================================

function formatDateForApi(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
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

  return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}
