import { useSession } from '@/stores/session';

export type CommandName = 'CreateTicket' | 'AddLine' | 'PayCash' | 'PayMock';

export type DeviceKeyParams = {
  deviceId: string;
  businessDate: string;
  command: CommandName;
  entityId: string;
  part?: string;
  v?: number;
};

export function makeDeviceKey({
  deviceId,
  businessDate,
  command,
  entityId,
  part,
  v = 1,
}: DeviceKeyParams) {
  return `${deviceId}:${businessDate}:${command}:${entityId}:${part ?? '-'}:v${v}`;
}

export type DeviceContext = {
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

  if (!state.deviceId) {
    missing.push('deviceId');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing device context: ${missing.join(
        ', ',
      )}. The app must initialise device context before enqueueing commands.`,
    );
  }

  return {
    deviceId: state.deviceId!,
    businessDate: state.businessDate ?? getDefaultBusinessDate(),
  };
}

export type CommandKeyParams = {
  command: CommandName;
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
  return makeDeviceKey({
    deviceId: context.deviceId,
    businessDate: businessDateOverride ?? context.businessDate,
    command,
    entityId,
    part,
    v: version ?? 1,
  });
}
