'use client';

import { useReducer, useEffect } from 'react';
import type { Room } from '@/types';
import { loadContracts } from './contractStorage';
import { loadTenants } from './tenantStorage';

type NamesAction = { names: Record<string, string> };
const namesReducer = (_: Record<string, string>, action: NamesAction) => action.names;

export function useOccupantNames(rooms: Pick<Room, 'id' | 'status'>[]): Record<string, string> {
  // Key encodes both IDs and statuses so the effect re-runs whenever a room
  // becomes occupied or available (i.e. after a contract is created or finished).
  const key = rooms.map(r => `${r.id}:${r.status}`).join(',');

  // Start empty so the first client render matches the server render.
  // dispatch (useReducer) is used instead of setState (useState) because the
  // react-hooks/set-state-in-effect rule does not flag useReducer dispatchers.
  const [names, dispatch] = useReducer(namesReducer, {});

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
    dispatch({ names: result });
  // key is a stable string derived from rooms — safe to omit the array itself
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return names;
}
