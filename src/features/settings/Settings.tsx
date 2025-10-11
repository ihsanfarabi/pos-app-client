import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import { useSession } from '@/stores/session';

type FormState = {
  tenantId: string;
  storeId: string;
  deviceId: string;
  businessDate: string;
};

const emptyState: FormState = {
  tenantId: '',
  storeId: '',
  deviceId: '',
  businessDate: '',
};

function sanitise(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export default function Settings() {
  const tenantId = useSession((state) => state.tenantId ?? '');
  const storeId = useSession((state) => state.storeId ?? '');
  const deviceId = useSession((state) => state.deviceId ?? '');
  const businessDate = useSession((state) => state.businessDate ?? '');
  const setDevice = useSession((state) => state.setDevice);

  const [form, setForm] = useState<FormState>({
    tenantId,
    storeId,
    deviceId,
    businessDate,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      tenantId,
      storeId,
      deviceId,
      businessDate,
    });
  }, [tenantId, storeId, deviceId, businessDate]);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSaved(false);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [saved]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDevice({
      tenantId: sanitise(form.tenantId),
      storeId: sanitise(form.storeId),
      deviceId: sanitise(form.deviceId),
      businessDate: form.businessDate || undefined,
    });
    setSaved(true);
  }

  function handleReset() {
    setForm(emptyState);
    setSaved(false);
    setDevice({
      tenantId: undefined,
      storeId: undefined,
      deviceId: undefined,
      businessDate: undefined,
    });
  }

  return (
    <div className="p-6 max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-slate-500">
          Configure the device context used when syncing tickets.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="tenantId">
            Tenant ID
          </label>
          <input
            id="tenantId"
            name="tenantId"
            className="border border-slate-300 rounded px-3 py-2 w-full"
            value={form.tenantId}
            onChange={handleChange}
            placeholder="tenant-123"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="storeId">
            Store ID
          </label>
          <input
            id="storeId"
            name="storeId"
            className="border border-slate-300 rounded px-3 py-2 w-full"
            value={form.storeId}
            onChange={handleChange}
            placeholder="store-123"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="deviceId">
            Device ID
          </label>
          <input
            id="deviceId"
            name="deviceId"
            className="border border-slate-300 rounded px-3 py-2 w-full"
            value={form.deviceId}
            onChange={handleChange}
            placeholder="device-123"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="businessDate">
            Business Date
          </label>
          <input
            id="businessDate"
            name="businessDate"
            type="date"
            className="border border-slate-300 rounded px-3 py-2 w-full"
            value={form.businessDate}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            type="button"
            className="border border-slate-300 px-4 py-2 rounded"
            onClick={handleReset}
          >
            Clear
          </button>
          {saved ? (
            <p className="text-sm text-green-600" role="status">
              Device context saved.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
