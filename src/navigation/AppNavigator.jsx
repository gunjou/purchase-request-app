import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginPage from "../modules/auth/pages/LoginPage";
import MainTabNavigator from "./MainTabNavigator";
import ProfilePage from "../modules/profile/pages/ProfilePage";
import AboutPage from "../modules/profile/pages/AboutPage";
import ChangePasswordPage from "../modules/profile/pages/ChangePasswordPage";
import PurchaseRequestPage from "../modules/purchase-request/pages/PurchaseRequestPage";
import PurchaseRequestDetailPage from "../modules/purchase-request/pages/PurchaseRequestDetailPage";
import PurchaseRequestCreatePage from "../modules/purchase-request/pages/PurchaseRequestCreatePage";
import PurchaseRequestEditPage from "../modules/purchase-request/pages/PurchaseRequestEditPage";
import PurchaseRequestHistoryPage from "../modules/purchase-request/pages/PurchaseRequestHistoryPage";

import { getAccessToken, getUser } from "../modules/auth/auth.storage";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ======================================================
  // RESTORE AUTH SESSION
  // ======================================================

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const accessToken = await getAccessToken();
      const user = await getUser();

      console.log("Restore auth session:", {
        hasAccessToken: !!accessToken,
        hasUser: !!user,
      });

      if (accessToken && user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Restore auth session error:", error);

      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOADING
  // ======================================================

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#8A5F41" />

        <Text
          className="mt-3 text-sm"
          style={{
            color: "#666666",
          }}
        >
          Memuat aplikasi...
        </Text>
      </View>
    );
  }

  // ======================================================
  // NAVIGATION
  // ======================================================

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Main" : "Login"}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* ==================================================
            AUTH
        ================================================== */}

        <Stack.Screen name="Login" component={LoginPage} />

        {/* ==================================================
            MAIN APPLICATION
        ================================================== */}

        <Stack.Screen name="Main" component={MainTabNavigator} />

        <Stack.Screen name="PurchaseRequest" component={PurchaseRequestPage} />

        <Stack.Screen
          name="PurchaseRequestCreate"
          component={PurchaseRequestCreatePage}
        />

        <Stack.Screen
          name="PurchaseRequestDetail"
          component={PurchaseRequestDetailPage}
        />

        <Stack.Screen
          name="PurchaseRequestEdit"
          component={PurchaseRequestEditPage}
        />

        <Stack.Screen
          name="PurchaseRequestHistory"
          component={PurchaseRequestHistoryPage}
        />

        <Stack.Screen name="Profile" component={ProfilePage} />

        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordPage}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="About"
          component={AboutPage}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
