import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/** Map semantic icon names to Ionicons equivalents. */
export const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: 'home-outline',
  home: 'home-outline',
  edit_note: 'create-outline',
  edit: 'create-outline',
  timeline: 'time-outline',
  time: 'time-outline',
  settings: 'settings-outline',
  check_circle: 'checkmark-circle-outline',
  check: 'checkmark-outline',
  local_fire_department: 'flame-outline',
  flame: 'flame-outline',
  favorite: 'heart-outline',
  heart: 'heart-outline',
  warning: 'warning-outline',
  alert: 'alert-circle-outline',
  person: 'person-outline',
  people: 'people-outline',
  search: 'search-outline',
  close: 'close-outline',
  add: 'add-outline',
  remove: 'remove-outline',
  chevron_right: 'chevron-forward-outline',
  chevron_left: 'chevron-back-outline',
  arrow_back: 'arrow-back-outline',
  menu: 'menu-outline',
  notifications: 'notifications-outline',
  lock: 'lock-closed-outline',
  mail: 'mail-outline',
  camera: 'camera-outline',
  image: 'image-outline',
  trash: 'trash-outline',
  share: 'share-outline',
  calendar: 'calendar-outline',
  star: 'star-outline',
  info: 'information-circle-outline',
  help: 'help-circle-outline',
  copy: 'copy-outline',
  refresh: 'refresh-outline',
  logout: 'log-out-outline',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = '#313333' }: IconProps) {
  const ionName = iconMap[name] ?? (name as keyof typeof Ionicons.glyphMap);

  return (
    <Ionicons
      name={ionName as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
    />
  );
}
