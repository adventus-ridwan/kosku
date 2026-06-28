'use client';

import { useState, useCallback } from 'react';
import type { Tenant, Contract } from './types';
import { addTenant, getTenantById } from './tenantStorage';
import { addContract, getActiveContractByRoomId, finishContract as finishContractInStorage } from './contractStorage';

interface TenantState {
  tenant: Tenant | null;
  contract: Contract | null;
  isLoading: boolean;
}

type ContractInput = Omit<Contract, 'id' | 'roomId' | 'tenantId' | 'createdAt' | 'status'>;
type TenantInput = Omit<Tenant, 'id'>;

export function useTenant(roomId: string | null) {
  const [state, setState] = useState<TenantState>(() => {
    if (!roomId) return { tenant: null, contract: null, isLoading: false };
    const contract = getActiveContractByRoomId(roomId);
    const tenant = contract ? getTenantById(contract.tenantId) : null;
    return { tenant, contract, isLoading: false };
  });

  const load = useCallback(() => {
    if (!roomId) {
      setState({ tenant: null, contract: null, isLoading: false });
      return;
    }
    const contract = getActiveContractByRoomId(roomId);
    const tenant = contract ? getTenantById(contract.tenantId) : null;
    setState({ tenant, contract, isLoading: false });
  }, [roomId]);

  // Re-read from storage when roomId changes (during-render update).
  const [prevRoomId, setPrevRoomId] = useState(roomId);
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId);
    if (!roomId) {
      setState({ tenant: null, contract: null, isLoading: false });
    } else {
      const contract = getActiveContractByRoomId(roomId);
      const tenant = contract ? getTenantById(contract.tenantId) : null;
      setState({ tenant, contract, isLoading: false });
    }
  }

  function createTenantAndContract(
    tenantInput: TenantInput,
    contractInput: ContractInput,
    onRoomOccupied: () => void,
  ) {
    if (!roomId) return;

    const tenantId = crypto.randomUUID();
    const contractId = crypto.randomUUID();

    const tenant: Tenant = { ...tenantInput, id: tenantId };
    const contract: Contract = {
      ...contractInput,
      id: contractId,
      roomId,
      tenantId,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    addTenant(tenant);
    addContract(contract);
    onRoomOccupied();

    setState({ tenant, contract, isLoading: false });
  }

  function finishContract(contractId: string, onComplete: () => void, endDate?: string) {
    finishContractInStorage(contractId, endDate);
    onComplete();
    load();
  }

  return { ...state, createTenantAndContract, finishContract, reload: load };
}
