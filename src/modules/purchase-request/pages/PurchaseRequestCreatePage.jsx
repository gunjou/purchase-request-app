import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import AttachmentPicker from "../components/AttachmentPicker";
import {
  createPurchaseRequest,
  getDepartments,
} from "../purchase-request.service";

export default function PurchaseRequestCreatePage({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? colors.dark : colors.light;

  // ======================================================
  // FORM
  // ======================================================

  const [tanggalRequest, setTanggalRequest] = useState(getTodayDate());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [idDepartemen, setIdDepartemen] = useState(null);
  const [namaPekerjaan, setNamaPekerjaan] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [note, setNote] = useState("");

  // ======================================================
  // ITEMS
  // ======================================================

  const [items, setItems] = useState([
    {
      keterangan: "",
      unit: "",
      harga_satuan: "",
      jumlah: "1",
    },
  ]);

  // ======================================================
  // PAYMENT
  // ======================================================

  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentBank, setPaymentBank] = useState("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");

  // ======================================================
  // ATTACHMENT
  // ======================================================

  const [attachmentPath, setAttachmentPath] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState("");

  // ======================================================
  // DEPARTMENTS
  // ======================================================

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);

  // ======================================================
  // UI STATE
  // ======================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD DEPARTMENTS
  // ======================================================

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      setError("");

      const data = await getDepartments();

      setDepartments(data);
    } catch (err) {
      console.error("Load departments error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil data departemen.",
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ======================================================
  // ITEM HANDLER
  // ======================================================

  const updateItem = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        keterangan: "",
        unit: "",
        harga_satuan: "",
        jumlah: "1",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  // ======================================================
  // FORMAT DATE DISPLAY
  // ======================================================
  const formatDateDisplay = (value) => {
    if (!value) return "";

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
      return value;
    }

    return `${day}-${month}-${year}`;
  };

  const formatDatePayload = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const parseDateValue = (value) => {
    if (!value) {
      return new Date();
    }

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
      return new Date();
    }

    return new Date(year, month - 1, day);
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async () => {
    setError("");

    // ----------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------

    if (!tanggalRequest) {
      setError("Tanggal pengajuan wajib diisi.");
      return;
    }

    if (!idDepartemen) {
      setError("Departemen wajib dipilih.");
      return;
    }

    if (!namaPekerjaan.trim()) {
      setError("Nama pekerjaan wajib diisi.");
      return;
    }

    if (items.length === 0) {
      setError("Minimal harus ada satu item.");
      return;
    }

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!item.keterangan.trim()) {
        setError(`Keterangan item ${index + 1} wajib diisi.`);
        return;
      }

      if (!item.unit.trim()) {
        setError(`Unit item ${index + 1} wajib diisi.`);
        return;
      }

      if (!item.harga_satuan || Number(item.harga_satuan) <= 0) {
        setError(`Harga satuan item ${index + 1} harus lebih dari 0.`);
        return;
      }

      if (!item.jumlah || Number(item.jumlah) <= 0) {
        setError(`Jumlah item ${index + 1} harus lebih dari 0.`);
        return;
      }
    }

    try {
      setLoading(true);

      // --------------------------------------------------
      // BUILD PAYLOAD
      // --------------------------------------------------

      const payload = {
        tanggal_request: tanggalRequest,
        id_departemen: Number(idDepartemen),
        nama_pekerjaan: namaPekerjaan.trim(),
        priority,
        note: note.trim(),

        items: items.map((item) => ({
          keterangan: item.keterangan.trim(),
          unit: item.unit.trim(),
          harga_satuan: Number(item.harga_satuan),
          jumlah: Number(item.jumlah),
        })),

        payment_description: paymentDescription.trim(),
        payment_bank: paymentBank.trim(),
        payment_account_number: paymentAccountNumber.trim(),
        payment_account_name: paymentAccountName.trim(),

        attachment_name: attachmentName.trim(),
        attachment_path: attachmentPath.trim(),
      };

      await createPurchaseRequest(payload);

      navigation.goBack();
    } catch (err) {
      console.error("Create purchase request error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal membuat pengajuan.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // SELECTED DEPARTMENT
  // ======================================================

  const selectedDepartment = departments.find(
    (department) => department.id_departemen === Number(idDepartemen),
  );

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
        className="border-b px-4 pb-4"
        style={{
          paddingTop: 52,
          backgroundColor: theme.background,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: theme.surfaceAlt,
            }}
          >
            <Ionicons name="arrow-back" size={21} color={theme.textPrimary} />
          </Pressable>

          <View className="flex-1">
            <Text
              className="text-xs font-medium"
              style={{
                color: theme.textMuted,
              }}
            >
              Purchase Request
            </Text>

            <Text
              className="mt-0.5 text-xl font-bold"
              style={{
                color: theme.textPrimary,
              }}
            >
              Tambah Pengajuan
            </Text>
          </View>
        </View>
      </View>

      {/* ==================================================
          FORM
      ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* ==================================================
            ERROR
        ================================================== */}

        {error ? (
          <View
            className="mb-5 rounded-2xl border px-4 py-3"
            style={{
              backgroundColor: isDark ? "rgba(185,28,28,0.15)" : "#FEF2F2",

              borderColor: isDark ? "rgba(252,165,165,0.20)" : "#FECACA",
            }}
          >
            <Text
              className="text-sm leading-5"
              style={{
                color: isDark
                  ? colors.semantic.error.dark
                  : colors.semantic.error.light,
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* ==================================================
            GENERAL INFORMATION
        ================================================== */}

        <SectionTitle title="Informasi Pengajuan" theme={theme} />

        {/* TANGGAL */}

        <FieldLabel label="Tanggal Pengajuan" theme={theme} required />

        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center rounded-2xl border px-4 py-4"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={isDark ? colors.brand[100] : colors.brand[600]}
          />

          <Text
            className="ml-3 flex-1 text-base"
            style={{
              color: tanggalRequest ? theme.textPrimary : theme.textMuted,
            }}
          >
            {tanggalRequest
              ? formatDateDisplay(tanggalRequest)
              : "Pilih tanggal"}
          </Text>

          <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
        </Pressable>

        {showDatePicker ? (
          <DateTimePicker
            value={parseDateValue(tanggalRequest)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);

              if (!selectedDate) {
                return;
              }

              setTanggalRequest(formatDatePayload(selectedDate));
            }}
          />
        ) : null}

        {/* DEPARTMENT */}

        <FieldLabel
          label="Departemen"
          theme={theme}
          className="mt-5"
          required
        />

        <Pressable
          onPress={() => setDepartmentModalVisible(true)}
          className="flex-row items-center justify-between rounded-2xl border px-4 py-4"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <Text
            className="flex-1 text-base"
            style={{
              color: selectedDepartment ? theme.textPrimary : theme.textMuted,
            }}
          >
            {selectedDepartment?.nama_departemen || "Pilih departemen"}
          </Text>

          <Ionicons
            name="chevron-down-outline"
            size={19}
            color={theme.textMuted}
          />
        </Pressable>

        {/* PEKERJAAN */}

        <FieldLabel
          label="Nama Pekerjaan"
          theme={theme}
          className="mt-5"
          required
        />

        <TextInput
          value={namaPekerjaan}
          onChangeText={setNamaPekerjaan}
          placeholder="Contoh: Pengadaan material proyek"
          placeholderTextColor={theme.textMuted}
          className="rounded-2xl border px-4 py-4 text-base"
          style={inputStyle(theme)}
        />

        {/* PRIORITY */}

        <FieldLabel label="Prioritas" theme={theme} className="mt-5" />

        <View className="flex-row gap-3">
          {[
            {
              value: "NORMAL",
              label: "Normal",
            },
            {
              value: "URGENT",
              label: "Urgent",
            },
            {
              value: "TOP_URGENT",
              label: "Top Urgent",
            },
          ].map((item) => {
            const active = priority === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setPriority(item.value)}
                className="flex-1 rounded-2xl border px-3 py-3.5"
                style={{
                  backgroundColor: active ? colors.brand[600] : theme.surface,

                  borderColor: active ? colors.brand[600] : theme.border,
                }}
              >
                <Text
                  className="text-center text-xs font-semibold"
                  style={{
                    color: active ? colors.neutral.white : theme.textSecondary,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* NOTE */}

        <FieldLabel label="Catatan" theme={theme} className="mt-5" />

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Tambahkan catatan jika diperlukan"
          placeholderTextColor={theme.textMuted}
          multiline
          textAlignVertical="top"
          className="min-h-[110px] rounded-2xl border px-4 py-4 text-base"
          style={inputStyle(theme)}
        />

        {/* ==================================================
            ITEMS
        ================================================== */}

        <View className="mt-8 flex-row items-center justify-between">
          <SectionTitle title="Item Pengajuan" theme={theme} noMargin />

          <View
            className="rounded-full px-3 py-1"
            style={{
              backgroundColor: isDark
                ? "rgba(140,16,7,0.20)"
                : `${colors.brand[600]}12`,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{
                color: isDark ? colors.brand[100] : colors.brand[600],
              }}
            >
              {items.length} item
            </Text>
          </View>
        </View>

        <Text
          className="mt-1 text-xs leading-5"
          style={{
            color: theme.textMuted,
          }}
        >
          Tambahkan satu atau lebih barang/jasa yang diajukan.
        </Text>

        {items.map((item, index) => (
          <View
            key={index}
            className="mt-4 rounded-3xl border p-4"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                className="text-sm font-bold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                Item {index + 1}
              </Text>

              {items.length > 1 ? (
                <Pressable
                  onPress={() => removeItem(index)}
                  className="h-8 w-8 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(185,28,28,0.15)"
                      : "#FEF2F2",
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={
                      isDark
                        ? colors.semantic.error.dark
                        : colors.semantic.error.light
                    }
                  />
                </Pressable>
              ) : null}
            </View>

            {/* KETERANGAN */}

            <FieldLabel label="Keterangan" theme={theme} required />

            <TextInput
              value={item.keterangan}
              onChangeText={(value) => updateItem(index, "keterangan", value)}
              placeholder="Contoh: Semen Portland 50 kg"
              placeholderTextColor={theme.textMuted}
              className="rounded-2xl border px-4 py-4 text-base"
              style={inputStyle(theme)}
            />

            {/* UNIT */}

            <FieldLabel label="Unit" theme={theme} className="mt-4" required />

            <TextInput
              value={item.unit}
              onChangeText={(value) => updateItem(index, "unit", value)}
              placeholder="Contoh: sak, pcs, unit"
              placeholderTextColor={theme.textMuted}
              className="rounded-2xl border px-4 py-4 text-base"
              style={inputStyle(theme)}
            />

            {/* HARGA + JUMLAH */}

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <FieldLabel label="Harga Satuan" theme={theme} required />

                <TextInput
                  value={item.harga_satuan}
                  onChangeText={(value) =>
                    updateItem(
                      index,
                      "harga_satuan",
                      value.replace(/[^0-9]/g, ""),
                    )
                  }
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  className="rounded-2xl border px-4 py-4 text-base"
                  style={inputStyle(theme)}
                />
              </View>

              <View className="w-[110px]">
                <FieldLabel label="Jumlah" theme={theme} required />

                <TextInput
                  value={item.jumlah}
                  onChangeText={(value) =>
                    updateItem(index, "jumlah", value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="1"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  className="rounded-2xl border px-4 py-4 text-base"
                  style={inputStyle(theme)}
                />
              </View>
            </View>

            {/* ITEM TOTAL */}

            <View
              className="mt-4 rounded-2xl px-4 py-3"
              style={{
                backgroundColor: theme.surfaceAlt,
              }}
            >
              <Text
                className="text-xs"
                style={{
                  color: theme.textMuted,
                }}
              >
                Subtotal
              </Text>

              <Text
                className="mt-1 text-base font-bold"
                style={{
                  color: theme.textPrimary,
                }}
              >
                {formatCurrency(
                  Number(item.harga_satuan || 0) * Number(item.jumlah || 0),
                )}
              </Text>
            </View>
          </View>
        ))}

        {/* ADD ITEM */}

        <Pressable
          onPress={addItem}
          className="mt-4 flex-row items-center justify-center rounded-2xl border border-dashed px-4 py-4"
          style={{
            borderColor: colors.brand[600],
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.brand[600]}
          />

          <Text
            className="ml-2 text-sm font-bold"
            style={{
              color: colors.brand[600],
            }}
          >
            Tambah Item
          </Text>
        </Pressable>

        {/* ==================================================
            PAYMENT
        ================================================== */}

        <View className="mt-8">
          <SectionTitle title="Informasi Pembayaran" theme={theme} noMargin />

          <Text
            className="mt-1 text-xs leading-5"
            style={{
              color: theme.textMuted,
            }}
          >
            Isi informasi rekening tujuan pembayaran jika diperlukan.
          </Text>
        </View>

        <FieldLabel
          label="Deskripsi Pembayaran"
          theme={theme}
          className="mt-5"
        />

        <TextInput
          value={paymentDescription}
          onChangeText={setPaymentDescription}
          placeholder="Contoh: Pembayaran kepada supplier"
          placeholderTextColor={theme.textMuted}
          multiline
          textAlignVertical="top"
          className="min-h-[90px] rounded-2xl border px-4 py-4 text-base"
          style={inputStyle(theme)}
        />

        <FieldLabel label="Bank" theme={theme} className="mt-5" required />

        <TextInput
          value={paymentBank}
          onChangeText={setPaymentBank}
          placeholder="Contoh: BCA"
          placeholderTextColor={theme.textMuted}
          className="rounded-2xl border px-4 py-4 text-base"
          style={inputStyle(theme)}
        />

        <FieldLabel
          label="Nomor Rekening"
          theme={theme}
          className="mt-5"
          required
        />

        <TextInput
          value={paymentAccountNumber}
          onChangeText={setPaymentAccountNumber}
          placeholder="Nomor rekening"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          className="rounded-2xl border px-4 py-4 text-base"
          style={inputStyle(theme)}
        />

        <FieldLabel
          label="Nama Rekening"
          theme={theme}
          className="mt-5"
          required
        />

        <TextInput
          value={paymentAccountName}
          onChangeText={setPaymentAccountName}
          placeholder="Nama pemilik rekening"
          placeholderTextColor={theme.textMuted}
          className="rounded-2xl border px-4 py-4 text-base"
          style={inputStyle(theme)}
        />

        {/* ==================================================
            ATTACHMENT
        ================================================== */}

        <View className="mt-8">
          <SectionTitle title="Lampiran" theme={theme} noMargin />

          <Text
            className="mt-1 text-xs leading-5"
            style={{
              color: theme.textMuted,
            }}
          >
            Saat ini field lampiran dikirim sebagai nama dan path.
          </Text>
        </View>

        <FieldLabel label="Nama Lampiran" theme={theme} className="mt-5" />

        <TextInput
          value={attachmentName}
          onChangeText={setAttachmentName}
          placeholder="Contoh: Nota pembelian"
          placeholderTextColor={theme.textMuted}
          className="rounded-2xl border px-4 py-4 text-base"
          style={inputStyle(theme)}
        />

        <FieldLabel label="Lampiran" theme={theme} className="mt-5" />

        <AttachmentPicker
          value={
            attachmentPath
              ? {
                  path: attachmentPath,
                  name: attachmentName || "Lampiran",
                  type: attachmentType,
                }
              : null
          }
          onChange={(file) => {
            setAttachmentPath(file?.path || "");
            setAttachmentName(file?.name || "");
            setAttachmentType(file?.type || "");
          }}
          theme={theme}
          isDark={isDark}
        />

        {/* ==================================================
            SUBMIT
        ================================================== */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={loading}
          className="mt-8 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: colors.brand[600],
            opacity: loading ? 0.7 : 1,
          }}
        >
          <View className="items-center px-5 py-4">
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={colors.neutral.white} />

                <Text className="ml-3 text-base font-bold text-white">
                  Mengirim...
                </Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-white">
                Ajukan Pengajuan
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

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
            className="rounded-t-3xl px-5 pb-8 pt-5"
            style={{
              backgroundColor: theme.background,
            }}
          >
            {/* MODAL HEADER */}

            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-lg font-bold"
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
                  Pilih departemen pengajuan
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

            {loadingDepartments ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color={colors.brand[600]} />

                <Text
                  className="mt-3 text-sm"
                  style={{
                    color: theme.textSecondary,
                  }}
                >
                  Memuat departemen...
                </Text>
              </View>
            ) : departments.length === 0 ? (
              <View className="items-center py-8">
                <Text
                  className="text-sm"
                  style={{
                    color: theme.textSecondary,
                  }}
                >
                  Tidak ada departemen.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                  maxHeight: 420,
                }}
              >
                {departments.map((department) => {
                  const selected =
                    Number(idDepartemen) === department.id_departemen;

                  return (
                    <Pressable
                      key={department.id_departemen}
                      onPress={() => {
                        setIdDepartemen(department.id_departemen);
                        setDepartmentModalVisible(false);
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
                      <View className="flex-1">
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color: theme.textPrimary,
                          }}
                        >
                          {department.nama_departemen}
                        </Text>
                      </View>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color={colors.brand[600]}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ======================================================
// SECTION TITLE
// ======================================================

function SectionTitle({ title, theme, noMargin = false }) {
  return (
    <Text
      className={`${noMargin ? "" : "mb-4"} text-lg font-bold`}
      style={{
        color: theme.textPrimary,
      }}
    >
      {title}
    </Text>
  );
}

// ======================================================
// FIELD LABEL
// ======================================================

function FieldLabel({ label, theme, className = "", required = false }) {
  return (
    <Text
      className={`mb-2 text-sm font-medium ${className}`}
      style={{
        color: theme.textSecondary,
      }}
    >
      {label}

      {required ? (
        <Text
          style={{
            color: colors.semantic.error.light,
          }}
        >
          {" *"}
        </Text>
      ) : null}
    </Text>
  );
}

// ======================================================
// INPUT STYLE
// ======================================================

function inputStyle(theme) {
  return {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    color: theme.textPrimary,
  };
}

// ======================================================
// TODAY
// ======================================================

function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ======================================================
// CURRENCY
// ======================================================

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}
