export default function BottomNavigation() {
  const navigation = useNavigation();

  return (
    <View className="border-t-2 border-gray-200 bg-white dark:border-white/10 dark:bg-dark-background">
      <View className="h-16 flex-row items-center justify-around">
        {/* ==================================================
            DASHBOARD
        ================================================== */}

        <Pressable
          onPress={() =>
            navigation.navigate("Main", {
              screen: "Dashboard",
            })
          }
          className="items-center justify-center"
        >
          <FileText size={22} color="#71717A" />

          <Text className="mt-1 text-xs font-medium text-gray-500">
            Beranda
          </Text>
        </Pressable>

        {/* ==================================================
            PENGAJUAN
        ================================================== */}

        <Pressable
          onPress={() => navigation.navigate("PurchaseRequest")}
          className="items-center justify-center"
        >
          <FileText size={22} color="#8C1007" />

          <Text className="mt-1 text-xs font-bold text-[#8C1007]">
            Pengajuan
          </Text>
        </Pressable>

        {/* ==================================================
            ADD
        ================================================== */}

        <Pressable
          onPress={() => navigation.navigate("PurchaseRequestCreate")}
          className="-mt-8 h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#8C1007] dark:border-dark-background"
        >
          <Plus size={28} color="#FFFFFF" />
        </Pressable>

        {/* ==================================================
            HISTORY
        ================================================== */}

        <Pressable className="items-center justify-center">
          <History size={22} color="#71717A" />

          <Text className="mt-1 text-xs text-gray-500">History</Text>
        </Pressable>
      </View>
    </View>
  );
}
