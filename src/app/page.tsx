"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";

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
  gyml8511: {
    raw_adc_value: number;
    uv_index: number;
    voltage: number;
  };
  timestamp: number;
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

const MAX_HISTORY_LENGTH = 20;

const Home = () => {
  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<Array<SensorData>>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/sensors");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          );
        }
        const result: SensorData = await response.json();
        setData(result);

        setHistory((prev) => {
          const updated = [...prev, result];
          return updated.slice(-MAX_HISTORY_LENGTH);
        });
      } catch (error) {
        console.warn("Error fetching sensor data:", error);

        const mockData = {
          hmc5883l: {
            mag: {
              x: Math.random() * 10 - 5,
              y: Math.random() * 100 - 50,
              z: Math.random() * 100 - 50,
            },
          },
          mpu6050: {
            accel: {
              x: Math.random() * 0.001,
              y: Math.random() * 0.001,
              z: Math.random() * 0.001,
            },
            gyro: {
              x: Math.random() * 0.1 - 0.05,
              y: Math.random() * 0.1 - 0.05,
              z: Math.random() * 0.1 - 0.05,
            },
            temp_c: 25 + Math.random() * 10,
          },
          gyml8511: {
            raw_adc_value: Math.random() * 1024,
            uv_index: Math.random() * 11,
            voltage: Math.random() * 5,
          },
          timestamp: Date.now() / 1000,
        };
        setData(mockData);

        setHistory((prev) => {
          const updated = [...prev, mockData];
          return updated.slice(-MAX_HISTORY_LENGTH);
        });
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setPredictionResult(null);
  };

  const handlePredictClick = async () => {
    if (!imageUrl) return;

    setIsPredicting(true);
    setPredictionResult(null);

    try {
      const response = await fetch(
        `/predict?image_url=${encodeURIComponent(
          imageUrl
        )}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Prediction request failed: ${response.status}`);
      }

      const result = await response.json();
      setPredictionResult(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error predicting image:", error);
      setPredictionResult("Error: Failed to get prediction");
    } finally {
      setIsPredicting(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-700">
            Loading Sensor Data...
          </h1>
          <p className="text-gray-500">
            Please wait while we fetch the latest data.
          </p>
        </div>
      </div>
    );
  }

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

  const uvRawChartData = history.map((item, index) => ({
    time: index,
    value: item.gyml8511.raw_adc_value,
  }));

  const uvIndexChartData = history.map((item, index) => ({
    time: index,
    value: item.gyml8511.uv_index,
  }));

  const uvVoltageChartData = history.map((item, index) => ({
    time: index,
    value: item.gyml8511.voltage,
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Sensor Data Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-4 bg-blue-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            MPU6050 Acceleration over time (g)
          </h2>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={accelerationChartData}>
              <defs>
                <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorZ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{ value: "g", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={(value) => [`${value} g`, null]} />
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
              <Area
                type="monotone"
                dataKey="x"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#colorX)"
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorY)"
              />
              <Area
                type="monotone"
                dataKey="z"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorZ)"
              />
              <Line
                type="monotone"
                dataKey="x"
                stroke="#4F46E5"
                name="X-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                name="Y-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="z"
                stroke="#EF4444"
                name="Z-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="p-4 bg-green-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            MPU6050 Gyro over time (°/s)
          </h2>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={gyroChartData}>
              <defs>
                <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorZ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{ value: "°/s", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={(value) => [`${value} °/s`, null]} />
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
              <Area
                type="monotone"
                dataKey="x"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#colorX)"
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorY)"
              />
              <Area
                type="monotone"
                dataKey="z"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorZ)"
              />
              <Line
                type="monotone"
                dataKey="x"
                stroke="#4F46E5"
                name="X-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                name="Y-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="z"
                stroke="#EF4444"
                name="Z-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            HMC5883L Magnetic Field over time (μT)
          </h2>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={magneticFieldChartData}>
              <defs>
                <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorZ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{ value: "μT", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={(value) => [`${value} μT`, null]} />
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
              <Area
                type="monotone"
                dataKey="x"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#colorX)"
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorY)"
              />
              <Area
                type="monotone"
                dataKey="z"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorZ)"
              />
              <Line
                type="monotone"
                dataKey="x"
                stroke="#4F46E5"
                name="X-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                name="Y-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="z"
                stroke="#EF4444"
                name="Z-axis"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="p-4 bg-red-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            MPU6050 Temperature over time (°C)
          </h2>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={temperatureChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{ value: "°C", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={(value) => [`${value} °C`, null]} />
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#F59E0B"
                name="Temperature"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            GYML8511 Raw ADC Value over time
          </h2>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={uvRawChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "ADC Value",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip formatter={(value) => [`${value}`, null]} />
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#9333EA"
                name="ADC Value"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            GYML8511 UV Index over time
          </h2>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={uvIndexChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "UV Index",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip formatter={(value) => [`${value}`, null]} />
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                name="UV Index"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="p-4 bg-pink-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            GYML8511 Voltage over time (V)
          </h2>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={uvVoltageChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Voltage (V)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip formatter={(value) => [`${value} V`, null]} />
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#EC4899"
                name="Voltage"
                isAnimationActive={false}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Image Analysis</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {imageUrl && (
              <div className="mt-4">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-48 max-w-full mx-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = "block";
                  }}
                />
              </div>
            )}

            <button
              onClick={handlePredictClick}
              disabled={!imageUrl || isPredicting}
              className={`py-2 px-4 rounded-lg font-medium ${
                !imageUrl || isPredicting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isPredicting ? "Processing..." : "Predict"}
            </button>

            {predictionResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg overflow-auto max-h-48">
                <h3 className="font-medium mb-2">Prediction Result:</h3>
                <pre className="text-sm">{predictionResult}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">
            Current Sensor Readings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">
                MPU6050 Acceleration
              </h3>
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
              <h3 className="font-medium text-gray-700">
                HMC5883L Magnetometer
              </h3>
              <p>X: {data.hmc5883l.mag.x.toFixed(2)} μT</p>
              <p>Y: {data.hmc5883l.mag.y.toFixed(2)} μT</p>
              <p>Z: {data.hmc5883l.mag.z.toFixed(2)} μT</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">Temperature</h3>
              <p>{data.mpu6050.temp_c.toFixed(2)} °C</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">GYML8511 UV Sensor</h3>
              <p>Raw ADC: {data.gyml8511.raw_adc_value.toFixed(3)}</p>
              <p>UV Index: {data.gyml8511.uv_index.toFixed(2)}</p>
              <p>Voltage: {data.gyml8511.voltage.toFixed(2)} V</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700">Timestamp</h3>
              <p>{new Date(data.timestamp * 1000).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Camera Stream</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Suspense fallback={<div>Loading video stream...</div>}>
              <VideoStream />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoStream = lazy(() => import("@/components/VideoStream"));

export default Home;
