'use client';

import { useState, useEffect } from 'react';
import type { Room } from '@/types';
import { loadContracts } from './contractStorage';
import { loadTenants } from './tenantStorage';

export function useOccupantNames(rooms: Pick<Room, 'id' | 'status'>[]): Record<string, string> {
  // Key encodes both IDs and statuses so the effect re-runs whenever a room
  // becomes occupied or available (i.e. after a contract is created or finished).
  const key = rooms.map(r => `${r.id}:${r.status}`).join(',');

  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const roomIds = new Set(rooms.map(r => r.id));
    const contracts = loadContracts().filter(
      c => c.status === 'ACTIVE' && roomIds.has(c.roomId),
    );
    const tenantMap = new Map(loadTenants().map(t => [t.id, t.name]));
    const result: Record<string, string> = {};
    for (const contract of contracts) {
      const name = tenantMap.get(contract.tenantId);
      if (name) result[contract.roomId] = name;
    }
    setNames(result);
  // key is a stable string derived from rooms — safe to omit the array itself
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return names;
}
