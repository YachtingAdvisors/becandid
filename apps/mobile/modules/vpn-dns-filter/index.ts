import { NativeModule, requireNativeModule } from 'expo-modules-core';

interface VpnDnsFilterModule extends NativeModule {
  start(): Promise<void>;
  stop(): Promise<void>;
  isActive(): Promise<boolean>;
  getRecentQueries(limit: number): Promise<Array<{ domain: string; timestamp: number }>>;
}

export default requireNativeModule<VpnDnsFilterModule>('VpnDnsFilter');
