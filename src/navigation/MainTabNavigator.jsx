import React from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardPage from "../modules/dashboard/pages/DashboardPage";
import ProfilePage from "../modules/profile/pages/ProfilePage";
import PurchasePage from "../modules/purchase-request/pages/PurchaseRequestPage";
import PurchaseHistory from "../modules/purchase-request/pages/PurchaseRequestHistoryPage";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? colors.dark : colors.light;

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => (
        <CustomTabBar {...props} theme={theme} isDark={isDark} />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ==================================================
          BERANDA
      ================================================== */}

      <Tab.Screen
        name="Dashboard"
        component={DashboardPage}
        options={{
          title: "Beranda",
        }}
      />

      {/* ==================================================
          PENGAJUAN
      ================================================== */}

      <Tab.Screen
        name="Pengajuan"
        component={PurchasePage}
        options={{
          title: "Pengajuan",
        }}
      />

      {/* ==================================================
          HISTORY
      ================================================== */}

      <Tab.Screen
        name="History"
        component={PurchaseHistory}
        options={{
          title: "History",
        }}
      />

      {/* ==================================================
          PROFIL
      ================================================== */}

      <Tab.Screen
        name="Profil"
        component={ProfilePage}
        options={{
          title: "Profil",
        }}
      />
    </Tab.Navigator>
  );
}

// ======================================================
// CUSTOM TAB BAR
// ======================================================

function CustomTabBar({ state, descriptors, navigation, theme, isDark }) {
  const insets = useSafeAreaInsets();

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2, 4);

  const bottomInset = insets.bottom;

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderTopWidth: 2,
        borderTopColor: theme.border,

        // Menyesuaikan area gesture navigation atau
        // tombol navigasi Android 3-button.
        paddingBottom: bottomInset,
      }}
    >
      <View
        style={{
          height: 68,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
        }}
      >
        {/* ==================================================
            LEFT MENU
        ================================================== */}

        <View
          style={{
            flex: 1,
            flexDirection: "row",
          }}
        >
          {leftRoutes.map((route, index) => (
            <TabBarItem
              key={route.key}
              route={route}
              index={index}
              state={state}
              descriptors={descriptors}
              navigation={navigation}
              theme={theme}
              isDark={isDark}
            />
          ))}
        </View>

        {/* ==================================================
            CENTER ACTION SPACE
        ================================================== */}

        <View
          style={{
            width: 76,
            height: "100%",
          }}
        />

        {/* ==================================================
            RIGHT MENU
        ================================================== */}

        <View
          style={{
            flex: 1,
            flexDirection: "row",
          }}
        >
          {rightRoutes.map((route, index) => (
            <TabBarItem
              key={route.key}
              route={route}
              index={index + 2}
              state={state}
              descriptors={descriptors}
              navigation={navigation}
              theme={theme}
              isDark={isDark}
            />
          ))}
        </View>
      </View>

      {/* ==================================================
          CENTER FAB
      ================================================== */}

      <Pressable
        onPress={() => {
          navigation.getParent()?.navigate("PurchaseRequestCreate");
        }}
        style={{
          position: "absolute",
          alignSelf: "center",

          // FAB tetap berada di atas tab bar,
          // dan tidak masuk ke area system navigation.
          bottom: bottomInset + 30,

          width: 60,
          height: 60,

          borderRadius: 20,

          alignItems: "center",
          justifyContent: "center",

          backgroundColor: colors.brand[600],

          borderWidth: 2,
          borderColor: isDark ? colors.brand[100] : colors.brand[900],

          elevation: 7,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: isDark ? 0.35 : 0.18,
          shadowRadius: 5,
        }}
      >
        <Ionicons name="add" size={30} color={colors.neutral.white} />
      </Pressable>
    </View>
  );
}

// ======================================================
// TAB BAR ITEM
// ======================================================

function TabBarItem({ route, state, descriptors, navigation, theme, isDark }) {
  const isFocused = state.index === state.routes.indexOf(route);

  const color = isFocused
    ? isDark
      ? colors.brand[100]
      : colors.brand[600]
    : theme.textMuted;

  let iconName = "ellipse-outline";

  if (route.name === "Dashboard") {
    iconName = isFocused ? "home" : "home-outline";
  }

  if (route.name === "Pengajuan") {
    iconName = isFocused ? "document-text" : "document-text-outline";
  }

  if (route.name === "History") {
    iconName = isFocused ? "time" : "time-outline";
  }

  if (route.name === "Profil") {
    iconName = isFocused ? "person" : "person-outline";
  }

  const { options } = descriptors[route.key];

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={iconName} size={22} color={color} />

      <Text
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: isFocused ? "700" : "500",
          color,
        }}
      >
        {options.title || route.name}
      </Text>
    </Pressable>
  );
}
