import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCompliance, useComputeCB, useComputeComparison } from '@/application/hooks/useCompliance';
import { Input } from '@/ui/components/Input';
import { Button } from '@/ui/components/Button';
import { Select } from '@/ui/components/Select';
import { ComputeCBResult, ComputeComparisonResult } from '@/adapters/api/compliance-api';

export function CompareTab() {
  const [ghgIntensity, setGhgIntensity] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [cbResult, setCbResult] = useState<ComputeCBResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComputeComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: compliance = [], isLoading } = useCompliance(
    filterStatus ? { status: filterStatus } : undefined
  );
  const computeCB = useComputeCB();
  const computeComparison = useComputeComparison();

  const handleComputeCB = async () => {
    if (!ghgIntensity || !fuelConsumption) {
      setError('Please enter both GHG Intensity and Fuel Consumption values');
      setCbResult(null);
      setComparisonResult(null);
      return;
    }
    setError(null);
    setComparisonResult(null);
    try {
      const result = await computeCB.mutateAsync({
        actualGhgIntensity: Number(ghgIntensity),
        fuelConsumption: Number(fuelConsumption),
      });
      setCbResult(result);
    } catch (err: any) {
      console.error('Failed to compute CB:', err);
      setError(err?.message || 'Failed to compute Compliance Balance. Please check the console for details.');
      setCbResult(null);
    }
  };

  const handleComputeComparison = async () => {
    if (!ghgIntensity) {
      setError('Please enter GHG Intensity value');
      setCbResult(null);
      setComparisonResult(null);
      return;
    }
    setError(null);
    setCbResult(null);
    try {
      const result = await computeComparison.mutateAsync({
        actualGhgIntensity: Number(ghgIntensity),
      });
      setComparisonResult(result);
    } catch (err: any) {
      console.error('Failed to compute comparison:', err);
      setError(err?.message || 'Failed to compute comparison. Please check the console for details.');
      setComparisonResult(null);
    }
  };

  // Prepare chart data
  const intensityData = compliance.map((c) => ({
    name: c.voyageId,
    actual: c.ghgIntensity,
    target: 89.3368,
  }));

  const cbData = compliance.map((c) => {
    const cb = (89.3368 - c.ghgIntensity) * c.fuelConsumption * 41000;
    return {
      name: c.voyageId,
      cb: cb,
    };
  });

  const statusDistribution = compliance.reduce((acc, c) => {
    acc[c.complianceStatus] = (acc[c.complianceStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Compare & Analyze</h2>

      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Compute Compliance</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Input
            label="GHG Intensity (gCO2eq/MJ)"
            type="number"
            step="0.01"
            value={ghgIntensity}
            onChange={(e) => setGhgIntensity(e.target.value)}
            placeholder="e.g., 80"
          />
          <Input
            label="Fuel Consumption (metric tons)"
            type="number"
            step="0.01"
            value={fuelConsumption}
            onChange={(e) => setFuelConsumption(e.target.value)}
            placeholder="e.g., 100"
          />
          <div className="flex items-end gap-2">
            <Button onClick={handleComputeCB} disabled={computeCB.isPending}>
              Compute CB
            </Button>
            <Button onClick={handleComputeComparison} disabled={computeComparison.isPending}>
              Compare
            </Button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {(cbResult || comparisonResult || error) && (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Result
          </h3>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {cbResult && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Compliance Balance:</span>
                  <span className="text-2xl font-bold text-blue-700">{cbResult.cb.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      cbResult.isSurplus
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {cbResult.isSurplus ? 'Surplus' : 'Deficit'}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Target GHG Intensity:</span>
                    <span className="ml-2 font-semibold text-gray-800">{cbResult.target.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Actual GHG Intensity:</span>
                    <span className="ml-2 font-semibold text-gray-800">{cbResult.actual.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fuel Consumption:</span>
                    <span className="ml-2 font-semibold text-gray-800">{cbResult.fuelConsumption.toFixed(2)} tons</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {comparisonResult && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Actual GHG Intensity:</span>
                    <span className="ml-2 text-lg font-bold text-purple-700">{comparisonResult.actual.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Target GHG Intensity:</span>
                    <span className="ml-2 text-lg font-bold text-purple-700">{comparisonResult.target.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3 pt-3 border-t border-purple-200">
                  <span className="text-sm font-semibold text-gray-700">Difference:</span>
                  <span className={`text-xl font-bold ${comparisonResult.difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {comparisonResult.difference >= 0 ? '+' : ''}{comparisonResult.difference.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Compliance Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      comparisonResult.isCompliant
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {comparisonResult.isCompliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div className="mb-4">
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All' },
              { value: 'COMPLIANT', label: 'Compliant' },
              { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'UNDER_REVIEW', label: 'Under Review' },
            ]}
            className="max-w-xs"
          />
        </div>

        {isLoading && <div className="text-center py-8 text-gray-500">Loading...</div>}

        {!isLoading && compliance.length > 0 && (
          <div className="space-y-8">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">GHG Intensity Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={intensityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target (89.34)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Compliance Balance by Voyage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cbData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cb" fill="#8884d8" name="Compliance Balance" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!isLoading && compliance.length === 0 && (
          <div className="text-center py-8 text-gray-500">No compliance data available</div>
        )}
      </div>
    </div>
  );
}

