// src/shared/hooks/useTourneeData.ts - Hook personnalisé pour gestion fluide
import { useCallback,useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/libs/supabase/types';
// import { useOfflineStore } from '@/shared/stores/offline';
// TODO: créer ce module

// Use the typed view row for the dashboard view defined in our supabase types
type VDashboardRow = Database['public']['Views']['v_sapeur_dashboard']['Row']

export function useTourneeData(userId: string | undefined) {
  // centralized supabase client imported above
  const [tourneeActive, setTourneeActive] = useState<VDashboardRow | null>(null);
  // Start not-loading by default; we'll enable loading only when an explicit refresh is requested.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // const { 
  //   totalPendingAmount, 
  //   totalPendingCalendars, 
  //   pendingTransactions,
  // } = useOfflineStore();
  // TODO: replace with real store when available
  const totalPendingAmount = 0;
  const totalPendingCalendars = 0;
  const pendingTransactions: any[] = [];

  const refreshTourneeData = useCallback(async (showLoading = false) => {
    console.debug('[useTourneeData] refreshTourneeData called', { userId, showLoading });

    if (!userId) {
      // If there's no user yet, ensure we are not left in a permanent loading state
      if (showLoading) setIsLoading(false);
      console.debug('[useTourneeData] no userId, skipping refresh');
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('v_sapeur_dashboard')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'en_cours')
        .single();

      if (supabaseError && (supabaseError as any).code !== 'PGRST116') {
        throw supabaseError;
      }

      if (data) {
        // Data already matches the view row shape from our generated types
        setTourneeActive(data as VDashboardRow);
      } else {
        setTourneeActive(null);
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Erreur chargement tournée:', message);
      setError(message);
    } finally {
      // Always clear loading when refresh completes
      if (showLoading) setIsLoading(false);
      console.debug('[useTourneeData] refresh completed');
    }
  }, [userId]);

  useEffect(() => {
    refreshTourneeData(true);
  }, [refreshTourneeData]);

  const updateTourneeOptimistic = useCallback((newTransaction: {
    amount: number;
    calendars_given: number;
  }) => {
    if (!tourneeActive) return;

    setTourneeActive(prev => {
      if (!prev) return null;

      const prevTotalAmount = prev.total_amount ?? 0
      const prevTotalTransactions = prev.total_transactions ?? 0
      const prevCalendriersDistribues = prev.calendars_distributed ?? 0
      const prevCalendriersRestants = prev.calendars_remaining ?? 0

      return {
        ...prev,
        total_amount: prevTotalAmount + newTransaction.amount,
        total_transactions: prevTotalTransactions + 1,
        calendars_distributed: prevCalendriersDistribues + newTransaction.calendars_given,
        calendars_remaining: Math.max(0, prevCalendriersRestants - newTransaction.calendars_given),
      };
    });
  }, [tourneeActive]);

  const tourneeWithOfflineStats = tourneeActive ? {
    ...tourneeActive,
    total_amount: (tourneeActive.total_amount ?? 0) + totalPendingAmount,
    total_transactions: (tourneeActive.total_transactions ?? 0) + pendingTransactions.length,
    calendars_distributed: (tourneeActive.calendars_distributed ?? 0) + totalPendingCalendars,
    calendars_remaining: Math.max(0, (tourneeActive.calendars_remaining ?? 0) - totalPendingCalendars),
  } : null;

  const syncAfterOnlineSuccess = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await refreshTourneeData(false);
  }, [refreshTourneeData]);

  return {
    tourneeActive: tourneeWithOfflineStats,
    isLoading,
    error,
    refreshTourneeData,
    updateTourneeOptimistic,
    syncAfterOnlineSuccess,
  };
}
