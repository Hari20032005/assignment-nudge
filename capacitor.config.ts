
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.841fad9ccce94c97b5bc034efc348c29',
  appName: 'assignment-nudge',
  webDir: 'dist',
  server: {
    url: 'https://841fad9c-cce9-4c97-b5bc-034efc348c29.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  }
};

export default config;
