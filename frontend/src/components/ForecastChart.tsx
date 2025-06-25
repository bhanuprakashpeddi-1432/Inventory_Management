import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { salesData } from "../data/dummyData";

export const ForecastChart = () => {
  return (
    <Card className="p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">Forecast vs Actual Sales</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={salesData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="forecast" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
            <Area type="monotone" dataKey="actual" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#8884d8] rounded-full mr-2"></div>
          <span className="text-sm">Forecast</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#82ca9d] rounded-full mr-2"></div>
          <span className="text-sm">Actual</span>
        </div>
      </div>
    </Card>
  );
};