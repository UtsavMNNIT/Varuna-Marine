import { useQuery, useMutation } from '@tanstack/react-query';
import {
  bankingApi,
  BankSurplusInput,
  ApplyBankedInput,
} from '@/adapters/api/banking-api';

export function useBankEntries(params?: { shipId?: string; expired?: boolean }) {
  return useQuery({
    queryKey: ['bank-entries', params],
    queryFn: () => bankingApi.getEntries(params),
  });
}

export function useBankSurplus() {
  return useMutation({
    mutationFn: (input: BankSurplusInput) => bankingApi.bankSurplus(input),
  });
}

export function useApplyBanked() {
  return useMutation({
    mutationFn: (input: ApplyBankedInput) => bankingApi.applyBanked(input),
  });
}

