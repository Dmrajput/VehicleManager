import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { paperTheme } from './src/theme';
import { registerForPushNotifications } from './src/services/notifications';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    registerForPushNotifications();
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="dark" />
          {showSplash ? <SplashScreen /> : <RootNavigator />}
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
