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
