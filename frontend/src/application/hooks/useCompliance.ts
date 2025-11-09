import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  complianceApi,
  Compliance,
  CreateComplianceInput,
  ComputeCBInput,
  ComputeComparisonInput,
} from '@/adapters/api/compliance-api';

export function useCompliance(params?: {
  shipId?: string;
  routeId?: string;
  reportingPeriod?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['compliance', params],
    queryFn: () => complianceApi.getAll(params),
  });
}

export function useComputeCB() {
  return useMutation({
    mutationFn: (input: ComputeCBInput) => complianceApi.computeCB(input),
  });
}

export function useComputeComparison() {
  return useMutation({
    mutationFn: (input: ComputeComparisonInput) => complianceApi.computeComparison(input),
  });
}

export function useComplianceMetrics(id: string | null) {
  return useQuery({
    queryKey: ['compliance-metrics', id],
    queryFn: () => (id ? complianceApi.getMetrics(id) : null),
    enabled: !!id,
  });
}

export function useCreateCompliance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateComplianceInput) => complianceApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });
}

