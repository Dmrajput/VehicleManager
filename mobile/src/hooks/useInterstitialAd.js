import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, INTERSTITIAL_ACTION_THRESHOLD } from '../constants';

/**
 * Tracks "actions" and signals when an interstitial ad should be shown
 * (every Nth action). Real display requires react-native-google-mobile-ads
 * in a custom dev client; here we just count and log.
 */
export default function useInterstitialAd() {
  const registerAction = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTION_COUNT);
      const count = (parseInt(raw || '0', 10) || 0) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.ACTION_COUNT, String(count));

      if (count % INTERSTITIAL_ACTION_THRESHOLD === 0) {
        // Hook point: show interstitial ad here.
        if (__DEV__) {
          console.log(`[Ads] Interstitial trigger at action #${count}`);
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  return { registerAction };
}
