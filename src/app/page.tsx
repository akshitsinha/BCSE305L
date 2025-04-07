"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Define the type for the data response
interface SensorData {
  acceleration: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  magneticField: { x: number; y: number; z: number };
  temperature: number;
  uvOutputVoltage: number;
}

export default function Home() {
  const [data, setData] = useState<SensorData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:3000/data");
        const result: SensorData = await response.json();
        setData(result);
      } catch (error) {
        // Fallback sample data
        setData({
          acceleration: { x: 1.2, y: 0.8, z: 0.5 },
          gyro: { x: 0.02, y: 0.03, z: 0.01 },
          magneticField: { x: 30, y: 45, z: 60 },
          temperature: 25.5,
          uvOutputVoltage: 3.3,
        });
      }
    }
    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const accelerationData = [
    { axis: "x", value: data.acceleration.x },
    { axis: "y", value: data.acceleration.y },
    { axis: "z", value: data.acceleration.z },
  ];

  const gyroData = [
    { axis: "x", value: data.gyro.x },
    { axis: "y", value: data.gyro.y },
    { axis: "z", value: data.gyro.z },
  ];

  const magneticFieldData = [
    { axis: "x", value: data.magneticField.x },
    { axis: "y", value: data.magneticField.y },
    { axis: "z", value: data.magneticField.z },
  ];

  const temperatureData = [{ axis: "Temperature", value: data.temperature }];

  const uvOutputVoltageData = [{ axis: "UV Voltage", value: data.uvOutputVoltage }];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Sensor Data Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Acceleration (x, y, z)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accelerationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="axis" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4F46E5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Gyro (x, y, z)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gyroData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="axis" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Magnetic Field (x, y, z)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={magneticFieldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="axis" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#EF4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Temperature</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="axis" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#F59E0B" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">UV Output Voltage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uvOutputVoltageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="axis" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
