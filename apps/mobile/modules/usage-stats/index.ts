import { requireNativeModule } from 'expo-modules-core';

interface UsageStatsModuleType {
  queryUsageStats(hours: number): Promise<Array<{ packageName: string; totalTimeInForeground: number }>>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<void>;
}

export default requireNativeModule<UsageStatsModuleType>('UsageStats');
