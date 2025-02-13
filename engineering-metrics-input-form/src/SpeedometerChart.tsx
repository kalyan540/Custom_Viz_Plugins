import React from "react";
import { Chart } from "primereact/chart";

interface SpeedometerChartProps {
  data: {
    label: string;
    value: number;
    min: number;
    max: number;
  };
}

const SpeedometerChart: React.FC<SpeedometerChartProps> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false, // Disable tooltip
      },
    },
    scales: {
      r: {
        min: data.min,
        max: data.max,
        ticks: {
          display: false, // Hide ticks for a cleaner look
        },
        pointLabels: {
          display: false, // Hide point labels
        },
      },
    },
  };

  const chartData = {
    labels: ["Speedometer"],
    datasets: [
      {
        data: [data.value],
        backgroundColor: "rgba(0, 255, 0, 0.8)", // Green color for the speedometer
        borderColor: "#fff",
        borderWidth: 2,
        radius: "100%",
      },
    ],
  };

  return (
    <div style={{ maxWidth: "300px", margin: "0 auto" }}>
      <h3>{data.label}</h3>
      <Chart type="radar" data={chartData} options={options} />
    </div>
  );
};

export default SpeedometerChart;
