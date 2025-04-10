"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SensorData } from "@/app/api/route";

// Maximum number of data points to keep in history
const MAX_HISTORY_LENGTH = 20;

export default function Home() {
  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<Array<SensorData & { timestamp: number }>>([]);
  // Add this state to control animation duration
  const [animationActive, setAnimationActive] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:3000/data");
        const result: SensorData = await response.json();
        setData(result);
        
        // Add timestamp and update history
        const newDataPoint = { ...result, timestamp: Date.now() };
        setHistory(prev => {
          const updated = [...prev, newDataPoint];
          // Keep only the most recent MAX_HISTORY_LENGTH items
          return updated.slice(-MAX_HISTORY_LENGTH);
        });
      } catch (error) {
        const mockData = {
          acceleration: { x: Math.random() * 2, y: Math.random() * 2, z: Math.random() * 2 },
          gyro: { x: Math.random() * 0.05, y: Math.random() * 0.05, z: Math.random() * 0.05 },
          magneticField: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 },
          temperature: 20 + Math.random() * 10,
          uvOutputVoltage: 2.5 + Math.random() * 1,
        };
        setData(mockData);
        
        // Add timestamp and update history even for mock data
        const newDataPoint = { ...mockData, timestamp: Date.now() };
        setHistory(prev => {
          const updated = [...prev, newDataPoint];
          return updated.slice(-MAX_HISTORY_LENGTH);
        });
      }
      
      // Temporarily disable animation to prevent stacking animations
      setAnimationActive(false);
      // Re-enable animation after a short delay
      setTimeout(() => setAnimationActive(true), 50);
    }

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  // Format history data for charts (unchanged)
  const accelerationChartData = history.map((item, index) => ({
    time: index,
    x: item.acceleration.x,
    y: item.acceleration.y,
    z: item.acceleration.z,
  }));

  const gyroChartData = history.map((item, index) => ({
    time: index,
    x: item.gyro.x,
    y: item.gyro.y,
    z: item.gyro.z,
  }));

  const magneticFieldChartData = history.map((item, index) => ({
    time: index,
    x: item.magneticField.x,
    y: item.magneticField.y,
    z: item.magneticField.z,
  }));

  const temperatureChartData = history.map((item, index) => ({
    time: index,
    value: item.temperature,
  }));

  const uvOutputVoltageData = history.map((item, index) => ({
    time: index,
    value: item.uvOutputVoltage,
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Sensor Data Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Acceleration over time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accelerationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="x" 
                stroke="#4F46E5" 
                name="X-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#10B981" 
                name="Y-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="z" 
                stroke="#EF4444" 
                name="Z-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Gyro over time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gyroChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="x" 
                stroke="#4F46E5" 
                name="X-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#10B981" 
                name="Y-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="z" 
                stroke="#EF4444" 
                name="Z-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Magnetic Field over time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={magneticFieldChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="x" 
                stroke="#4F46E5" 
                name="X-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#10B981" 
                name="Y-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="z" 
                stroke="#EF4444" 
                name="Z-axis" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Temperature over time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#F59E0B" 
                name="Temperature" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">UV Output Voltage over time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uvOutputVoltageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                name="UV Voltage" 
                isAnimationActive={animationActive} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}