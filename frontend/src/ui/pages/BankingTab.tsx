import { useState } from 'react';
import { useBankEntries, useBankSurplus, useApplyBanked } from '@/application/hooks/useBanking';
import { Table } from '@/ui/components/Table';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { BankEntry } from '@/adapters/api/banking-api';

export function BankingTab() {
  const [showBankForm, setShowBankForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    surplusUnits: '',
    bankingDate: new Date().toISOString().split('T')[0],
    maxBankingCapacity: '',
    bankingValidityYears: '2',
  });
  const [applyFormData, setApplyFormData] = useState({
    deficit: '',
    applicationDate: new Date().toISOString().split('T')[0],
  });

  const { data: entries = [], isLoading, refetch } = useBankEntries();
  const bankSurplus = useBankSurplus();
  const applyBanked = useApplyBanked();

  const handleBankSurplus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bankSurplus.mutateAsync({
        surplusUnits: Number(bankFormData.surplusUnits),
        bankingDate: new Date(bankFormData.bankingDate).toISOString(),
        maxBankingCapacity: bankFormData.maxBankingCapacity
          ? Number(bankFormData.maxBankingCapacity)
          : undefined,
        bankingValidityYears: Number(bankFormData.bankingValidityYears),
      });
      setShowBankForm(false);
      setBankFormData({
        surplusUnits: '',
        bankingDate: new Date().toISOString().split('T')[0],
        maxBankingCapacity: '',
        bankingValidityYears: '2',
      });
      refetch();
    } catch (err) {
      console.error('Failed to bank surplus:', err);
    }
  };

  const handleApplyBanked = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applyBanked.mutateAsync({
        deficit: Number(applyFormData.deficit),
        applicationDate: new Date(applyFormData.applicationDate).toISOString(),
        availableBankedUnits: entries.map((e) => ({
          id: e.id,
          units: e.units,
          bankedAt: e.bankedAt,
          expiryDate: e.expiryDate,
        })),
      });
      setShowApplyForm(false);
      setApplyFormData({
        deficit: '',
        applicationDate: new Date().toISOString().split('T')[0],
      });
      refetch();
    } catch (err) {
      console.error('Failed to apply banked units:', err);
    }
  };

  const columns = [
    { header: 'Ship ID', accessor: 'shipId' as keyof BankEntry },
    { header: 'Units', accessor: 'units' as keyof BankEntry },
    { header: 'Banked At', accessor: 'bankedAt' as keyof BankEntry },
    {
      header: 'Expiry Date',
      accessor: (row: BankEntry) => {
        const expiry = new Date(row.expiryDate);
        const isExpired = expiry < new Date();
        return (
          <span className={isExpired ? 'text-red-600' : ''}>
            {expiry.toLocaleDateString()}
            {isExpired && ' (Expired)'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Banking</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowBankForm(!showBankForm)}>
            {showBankForm ? 'Cancel' : 'Bank Surplus'}
          </Button>
          <Button variant="secondary" onClick={() => setShowApplyForm(!showApplyForm)}>
            {showApplyForm ? 'Cancel' : 'Apply Banked'}
          </Button>
        </div>
      </div>

      {showBankForm && (
        <form onSubmit={handleBankSurplus} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">Bank Surplus Units</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Surplus Units"
              type="number"
              step="0.01"
              value={bankFormData.surplusUnits}
              onChange={(e) => setBankFormData({ ...bankFormData, surplusUnits: e.target.value })}
              required
            />
            <Input
              label="Banking Date"
              type="date"
              value={bankFormData.bankingDate}
              onChange={(e) => setBankFormData({ ...bankFormData, bankingDate: e.target.value })}
              required
            />
            <Input
              label="Max Banking Capacity (optional)"
              type="number"
              step="0.01"
              value={bankFormData.maxBankingCapacity}
              onChange={(e) =>
                setBankFormData({ ...bankFormData, maxBankingCapacity: e.target.value })
              }
            />
            <Input
              label="Validity Years"
              type="number"
              min="1"
              max="10"
              value={bankFormData.bankingValidityYears}
              onChange={(e) =>
                setBankFormData({ ...bankFormData, bankingValidityYears: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" disabled={bankSurplus.isPending}>
            {bankSurplus.isPending ? 'Banking...' : 'Bank Surplus'}
          </Button>
        </form>
      )}

      {showApplyForm && (
        <form onSubmit={handleApplyBanked} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">Apply Banked Units</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deficit"
              type="number"
              step="0.01"
              value={applyFormData.deficit}
              onChange={(e) => setApplyFormData({ ...applyFormData, deficit: e.target.value })}
              required
            />
            <Input
              label="Application Date"
              type="date"
              value={applyFormData.applicationDate}
              onChange={(e) =>
                setApplyFormData({ ...applyFormData, applicationDate: e.target.value })
              }
              required
            />
          </div>
          <div className="text-sm text-gray-600">
            Available banked units: {entries.filter((e) => new Date(e.expiryDate) >= new Date()).length}
          </div>
          <Button type="submit" disabled={applyBanked.isPending}>
            {applyBanked.isPending ? 'Applying...' : 'Apply Banked Units'}
          </Button>
        </form>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bank Entries</h3>
        {isLoading && <div className="text-center py-8">Loading...</div>}
        {!isLoading && <Table columns={columns} data={entries} emptyMessage="No bank entries" />}
      </div>
    </div>
  );
}

