import { useSession } from '@/stores/session';

export type IdempotencyParams = {
  tenantId: string;
  storeId: string;
  deviceId: string;
  businessDate: string;
  command: 'CreateTicket' | 'AddLine' | 'PayCash' | 'PayMock';
  entityId: string;
  part?: string;
  v?: number;
};

export function makeKey({
  tenantId,
  storeId,
  deviceId,
  businessDate,
  command,
  entityId,
  part,
  v = 1,
}: IdempotencyParams) {
  return `${tenantId}:${storeId}:${deviceId}:${businessDate}:${command}:${entityId}:${part ?? '-'}:v${v}`;
}

export type DeviceContext = {
  tenantId: string;
  storeId: string;
  deviceId: string;
  businessDate: string;
};

export function getDefaultBusinessDate(now: Date = new Date()) {
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

export function getDeviceContext(): DeviceContext {
  const state = useSession.getState();
  const missing: string[] = [];

  if (!state.tenantId) {
    missing.push('tenantId');
  }
  if (!state.storeId) {
    missing.push('storeId');
  }
  if (!state.deviceId) {
    missing.push('deviceId');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing device context: ${missing.join(
        ', ',
      )}. Configure the device in settings before enqueueing commands.`,
    );
  }

  return {
    tenantId: state.tenantId!,
    storeId: state.storeId!,
    deviceId: state.deviceId!,
    businessDate: state.businessDate ?? getDefaultBusinessDate(),
  };
}

export type CommandKeyParams = {
  command: IdempotencyParams['command'];
  entityId: string;
  part?: string;
  version?: number;
  businessDateOverride?: string;
};

export function makeCommandKey({
  command,
  entityId,
  part,
  version,
  businessDateOverride,
}: CommandKeyParams) {
  const context = getDeviceContext();
  return makeKey({
    tenantId: context.tenantId,
    storeId: context.storeId,
    deviceId: context.deviceId,
    businessDate: businessDateOverride ?? context.businessDate,
    command,
    entityId,
    part,
    v: version ?? 1,
  });
}
