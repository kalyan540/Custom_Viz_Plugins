import React, { useState, useEffect } from "react";
import { GaugeChart } from "@superset-ui/legacy-plugin-chart-gauge"; // Assuming you're using the Apache Superset Gauge Chart

interface ChartData {
  label: string;
  value: number;
  min: number;
  max: number;
}

interface GaugeChartComponentProps {
  selectedNode: any; // Data from the selected node
}

const GaugeChartComponent: React.FC<GaugeChartComponentProps> = ({
  selectedNode,
}) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Logic to update chart based on selected node data
  useEffect(() => {
    if (selectedNode) {
      const chartData: ChartData = {
        label: `${selectedNode.label} - Filtered Data`,
        value: Math.random() * 100, // Simulate a dynamic value (replace with real data if needed)
        min: 0,
        max: 100,
      };

      setChartData(chartData);
    }
  }, [selectedNode]);

  return (
    <div>
      {chartData ? (
        <GaugeChart
          data={{
            label: chartData.label,
            value: chartData.value,
            min: chartData.min,
            max: chartData.max,
          }}
        />
      ) : (
        <p>Loading Gauge Chart...</p>
      )}
    </div>
  );
};

export default GaugeChartComponent;
