import { create } from 'zustand';
import { settingsRepo } from '@/db/repositories/settingsRepo';
import { getDefaultBusinessDate } from '@/lib/idempotency';

type SessionState = {
  accessToken?: string;
  deviceId?: string;
  businessDate?: string;
  setToken: (token?: string) => void;
  setDevice: (
    device: Partial<
      Pick<
        SessionState,
        'deviceId' | 'businessDate'
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

    const deviceId =
      stored?.deviceId ??
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2));
    const businessDate = stored?.businessDate ?? getDefaultBusinessDate();

    set({ deviceId, businessDate });
    await settingsRepo.save({ deviceId, businessDate });
  },
}));
