import { create } from 'zustand';

type SessionState = {
  accessToken?: string;
  tenantId?: string;
  storeId?: string;
  deviceId?: string;
  businessDate?: string;
  setToken: (token?: string) => void;
  setDevice: (
    device: Partial<
      Pick<
        SessionState,
        'tenantId' | 'storeId' | 'deviceId' | 'businessDate'
      >
    >,
  ) => void;
};

export const useSession = create<SessionState>((set) => ({
  setToken: (accessToken) => set({ accessToken }),
  setDevice: (device) => set(device as Partial<SessionState>),
}));
