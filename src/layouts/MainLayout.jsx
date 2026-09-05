import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

import BottomNavigation from "../components/BottomNavigation";

export default function MainLayout({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-light-background dark:bg-dark-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <View className="flex-1">{children}</View>

      <View
        style={{
          paddingBottom: insets.bottom,
        }}
        className="bg-light-background dark:bg-dark-background"
      >
        <BottomNavigation />
      </View>
    </View>
  );
}
