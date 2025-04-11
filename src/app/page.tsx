"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Updated SensorData type to match the new API response format
interface SensorData {
  hmc5883l: {
    mag: {
      x: number;
      y: number;
      z: number;
    };
  };
  mpu6050: {
    accel: {
      x: number;
      y: number;
      z: number;
    };
    gyro: {
      x: number;
      y: number;
      z: number;
    };
    temp_c: number;
  };
  timestamp: number;
}

// Maximum number of data points to keep in history
const MAX_HISTORY_LENGTH = 20;

export default function Home() {
  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<Array<SensorData>>([]);
  const [error, setError] = useState<string | null>(null);
  // Add this state to control animation duration
  const [animationActive, setAnimationActive] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const response = await fetch("/api");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const result: SensorData = await response.json();
        setData(result);
        
        // Update history
        setHistory(prev => {
          const updated = [...prev, result];
          // Keep only the most recent MAX_HISTORY_LENGTH items
          return updated.slice(-MAX_HISTORY_LENGTH);
        });
      } catch (error) {
        console.warn("Error fetching sensor data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch sensor data");
        
        // Use mock data that matches the expected format
        const mockData = {
          hmc5883l: {
            mag: {
              x: Math.random() * 10 - 5,
              y: Math.random() * 100 - 50,
              z: Math.random() * 100 - 50
            }
          },
          mpu6050: {
            accel: {
              x: Math.random() * 0.001,
              y: Math.random() * 0.001,
              z: Math.random() * 0.001
            },
            gyro: {
              x: Math.random() * 0.1 - 0.05,
              y: Math.random() * 0.1 - 0.05,
              z: Math.random() * 0.1 - 0.05
            },
            temp_c: 25 + Math.random() * 10
          },
          timestamp: Date.now() / 1000
        };
        setData(mockData);
        
        // Update history with mock data
        setHistory(prev => {
          const updated = [...prev, mockData];
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

  // Format history data for charts with the new data structure
  const accelerationChartData = history.map((item, index) => ({
    time: index,
    x: item.mpu6050.accel.x,
    y: item.mpu6050.accel.y,
    z: item.mpu6050.accel.z,
  }));

  const gyroChartData = history.map((item, index) => ({
    time: index,
    x: item.mpu6050.gyro.x,
    y: item.mpu6050.gyro.y,
    z: item.mpu6050.gyro.z,
  }));

  const magneticFieldChartData = history.map((item, index) => ({
    time: index,
    x: item.hmc5883l.mag.x,
    y: item.hmc5883l.mag.y,
    z: item.hmc5883l.mag.z,
  }));

  const temperatureChartData = history.map((item, index) => ({
    time: index,
    value: item.mpu6050.temp_c,
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Sensor Data Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">MPU6050 Acceleration over time (g)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accelerationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis label={{ value: 'g', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} g`, null]} />
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
          <h2 className="text-lg font-semibold mb-4">MPU6050 Gyro over time (°/s)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gyroChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis label={{ value: '°/s', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} °/s`, null]} />
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
          <h2 className="text-lg font-semibold mb-4">HMC5883L Magnetic Field over time (μT)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={magneticFieldChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis label={{ value: 'μT', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} μT`, null]} />
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
          <h2 className="text-lg font-semibold mb-4">MPU6050 Temperature over time (°C)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} °C`, null]} />
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

        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Current Sensor Readings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">MPU6050 Acceleration</h3>
              <p>X: {data.mpu6050.accel.x.toFixed(6)} g</p>
              <p>Y: {data.mpu6050.accel.y.toFixed(6)} g</p>
              <p>Z: {data.mpu6050.accel.z.toFixed(6)} g</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">MPU6050 Gyroscope</h3>
              <p>X: {data.mpu6050.gyro.x.toFixed(6)} °/s</p>
              <p>Y: {data.mpu6050.gyro.y.toFixed(6)} °/s</p>
              <p>Z: {data.mpu6050.gyro.z.toFixed(6)} °/s</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">HMC5883L Magnetometer</h3>
              <p>X: {data.hmc5883l.mag.x.toFixed(2)} μT</p>
              <p>Y: {data.hmc5883l.mag.y.toFixed(2)} μT</p>
              <p>Z: {data.hmc5883l.mag.z.toFixed(2)} μT</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">Temperature</h3>
              <p>{data.mpu6050.temp_c.toFixed(2)} °C</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">Timestamp</h3>
              <p>{new Date(data.timestamp * 1000).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}