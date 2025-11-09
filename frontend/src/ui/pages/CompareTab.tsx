import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCompliance, useComputeCB, useComputeComparison } from '@/application/hooks/useCompliance';
import { Input } from '@/ui/components/Input';
import { Button } from '@/ui/components/Button';
import { Select } from '@/ui/components/Select';

export function CompareTab() {
  const [ghgIntensity, setGhgIntensity] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: compliance = [], isLoading } = useCompliance(
    filterStatus ? { status: filterStatus } : undefined
  );
  const computeCB = useComputeCB();
  const computeComparison = useComputeComparison();

  const handleComputeCB = async () => {
    if (!ghgIntensity || !fuelConsumption) return;
    try {
      const result = await computeCB.mutateAsync({
        actualGhgIntensity: Number(ghgIntensity),
        fuelConsumption: Number(fuelConsumption),
      });
      alert(`Compliance Balance: ${result.cb.toFixed(2)}\n${result.isSurplus ? 'Surplus' : 'Deficit'}`);
    } catch (err) {
      console.error('Failed to compute CB:', err);
    }
  };

  const handleComputeComparison = async () => {
    if (!ghgIntensity) return;
    try {
      const result = await computeComparison.mutateAsync({
        actualGhgIntensity: Number(ghgIntensity),
      });
      alert(
        `Actual: ${result.actual}\nTarget: ${result.target}\nDifference: ${result.difference.toFixed(2)}\nCompliant: ${result.isCompliant ? 'Yes' : 'No'}`
      );
    } catch (err) {
      console.error('Failed to compute comparison:', err);
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
      <h2 className="text-2xl font-bold text-gray-900">Compare & Analyze</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Compute Compliance</h3>
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

      <div className="bg-white p-6 rounded-lg shadow">
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

        {isLoading && <div className="text-center py-8">Loading...</div>}

        {!isLoading && compliance.length > 0 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">GHG Intensity Comparison</h3>
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

            <div>
              <h3 className="text-lg font-semibold mb-4">Compliance Balance by Voyage</h3>
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

            <div>
              <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
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

