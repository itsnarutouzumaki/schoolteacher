export type PushDeviceRegistration = {
  token: string;
  platform: 'android' | 'ios';
};

export interface TeacherNotificationApi {
  registerNotificationDevice(registration: PushDeviceRegistration): Promise<void>;
  unregisterNotificationDevice(token: string): Promise<void>;
}
