import { NextResponse } from "next/server";
import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

export type SensorData = {
  acceleration: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  magneticField: { x: number; y: number; z: number };
  temperature: number;
  uvOutputVoltage: number;
};

let data: SensorData | undefined;

const port = new SerialPort({ path: "/dev/cu.usbserial-110", baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
    console.log("Serial Port Opened");
});

parser.on("data", (line) => {
  console.log(`Received: ${line}`);
  const parsedData = JSON.parse(line);
  data = parsedData;
});

export async function GET(request: Request) {
  const response = NextResponse.json({
    acceleration: {
      x: 123,
      y: 123,
      z: 123,
    },
    gyro: {
      x: 123,
      y: 123,
      z: 123,
    },
    magneticField: {
      x: 123,
      y: 123,
      z: 123,
    },
    temperature: 123,
    uvOutputVoltage: 123,
  });

  return response;
}
