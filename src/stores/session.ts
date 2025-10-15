import { create } from 'zustand';
import { settingsRepo } from '@/db/repositories/settingsRepo';

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
  hydrateDevice: () => Promise<void>;
};

export const useSession = create<SessionState>((set, get) => ({
  setToken: (accessToken) => set({ accessToken }),
  setDevice: (device) => {
    set(device as Partial<SessionState>);
    const state = get();
    const payload = {
      tenantId: state.tenantId,
      storeId: state.storeId,
      deviceId: state.deviceId,
      businessDate: state.businessDate,
    };

    const hasAny = Object.values(payload).some((value) => Boolean(value));

    if (hasAny) {
      void settingsRepo.save(payload);
    } else {
      void settingsRepo.clear();
    }
  },
  hydrateDevice: async () => {
    const stored = await settingsRepo.get();
    if (!stored) {
      return;
    }

    set({
      tenantId: stored.tenantId,
      storeId: stored.storeId,
      deviceId: stored.deviceId,
      businessDate: stored.businessDate,
    });
  },
}));
