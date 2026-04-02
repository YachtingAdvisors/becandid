import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import * as vpnFilter from '../lib/vpnFilter';

export default function VpnFilterToggle() {
  const [active, setActive] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(vpnFilter.isAvailable());
    vpnFilter.isActive().then(setActive);
  }, []);

  const handleToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable DNS Monitoring',
        'Be Candid will create a local VPN to monitor which sites you visit. All data stays on your device — nothing is sent to external servers.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const started = await vpnFilter.start();
              setActive(started);
            },
          },
        ]
      );
    } else {
      await vpnFilter.stop();
      setActive(false);
    }
  };

  if (!available) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#1a1a2e' }}>DNS Monitoring</Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          Detect which sites you visit using a local VPN. Data stays on your device.
        </Text>
      </View>
      <Switch
        value={active}
        onValueChange={handleToggle}
        trackColor={{ false: '#e5e7eb', true: '#226779' }}
        thumbColor={active ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}
