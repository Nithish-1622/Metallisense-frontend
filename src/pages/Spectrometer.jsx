import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CircleGauge,
  Database,
  Gauge,
  Radio,
  RefreshCw,
  Thermometer,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { OPCContext } from "../context/OPCContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import {
  getAllReadings,
  deleteReading,
  requestOPCReading,
} from "../services/spectrometerService";
import toast from "react-hot-toast";
import { formatDate, formatPercentage } from "../utils/formatters";

const STORAGE_KEY = "metallisense-simulated-spectrometer-readings";

const ELEMENTS = [
  { key: "Fe", name: "Iron", unit: "%", target: 93.8, range: [92.8, 94.8] },
  { key: "C", name: "Carbon", unit: "%", target: 3.55, range: [3.2, 3.8] },
  { key: "Si", name: "Silicon", unit: "%", target: 2.35, range: [2.1, 2.6] },
  { key: "Mn", name: "Manganese", unit: "%", target: 0.42, range: [0.3, 0.6] },
  { key: "P", name: "Phosphorus", unit: "%", target: 0.055, range: [0.03, 0.08] },
  { key: "S", name: "Sulfur", unit: "%", target: 0.035, range: [0.02, 0.05] },
];

const createSimulatedReading = (index = 0) => {
  const drift = index * 0.018;
  const composition = {};

  ELEMENTS.forEach((element) => {
    const variance = (Math.random() - 0.5) * (element.range[1] - element.range[0]);
    composition[element.key] = Number(
      Math.max(
        element.range[0],
        Math.min(element.range[1], element.target + variance + drift)
      ).toFixed(element.key === "Fe" ? 2 : 3)
    );
  });

  const createdAt = new Date(Date.now() - index * 45000).toISOString();
  const carbonEquivalent =
    composition.C +
    composition.Si / 6 +
    (composition.Mn + composition.P + composition.S) / 3;

  return {
    _id: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    simulated: true,
    timestamp: createdAt,
    createdAt,
    metalGrade: "SG-IRON",
    temperature: Number((25.4 + Math.random() * 4.2).toFixed(1)),
    pressure: Number((1.01 + Math.random() * 0.06).toFixed(3)),
    carbonEquivalent: Number(carbonEquivalent.toFixed(3)),
    signalQuality: Math.floor(94 + Math.random() * 6),
    composition,
  };
};

const createInitialReadings = () =>
  Array.from({ length: 8 }, (_, index) => createSimulatedReading(index));

const loadLocalReadings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (error) {
    console.warn("Could not load simulated spectrometer history", error);
  }
  return createInitialReadings();
};

const Spectrometer = () => {
  const { opcStatus, connect, disconnect } = useContext(OPCContext);
  const [readings, setReadings] = useState(loadLocalReadings);
  const [latestReading, setLatestReading] = useState(
    () => loadLocalReadings()[0]
  );
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    fetchReadings();
  }, []);

  useEffect(() => {
    if (!autoScan) return undefined;

    const interval = window.setInterval(() => {
      if (!requesting) generateReading(true);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [autoScan, requesting]);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const response = await getAllReadings();
      const serverData =
        response.data?.data?.data ||
        response.data?.data ||
        response.data?.readings ||
        [];
      const serverReadings = Array.isArray(serverData) ? serverData : [];

      if (serverReadings.length) {
        setReadings((current) => {
          const local = current.filter((reading) => reading.simulated);
          const merged = [...serverReadings, ...local].slice(0, 30);
          setLatestReading(merged[0]);
          return merged;
        });
      } else {
        setLatestReading((current) => {
          if (current) return current;
          return readings[0] || createInitialReadings()[0];
        });
      }
    } catch (error) {
      console.info("Using frontend spectrometer simulator", error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReading = async (isAuto = false) => {
    if (requesting) return;
    setRequesting(true);

    try {
      let result = null;
      if (opcStatus?.connected) {
        try {
          const response = await requestOPCReading();
          result =
            response.data?.data?.reading ||
            response.data?.reading ||
            response.data?.data ||
            null;
        } catch (error) {
          console.info("OPC reading unavailable; using local instrument sample");
        }
      }

      const reading =
        result && typeof result === "object"
          ? {
              ...result,
              timestamp: result.timestamp || result.createdAt || new Date().toISOString(),
              simulated: false,
              composition: result.composition || {
                Fe: result.Fe,
                C: result.C,
                Mn: result.Mn,
                Si: result.Si,
                P: result.P,
                S: result.S,
              },
            }
          : createSimulatedReading();

      setReadings((current) => [reading, ...current].slice(0, 30));
      setLatestReading(reading);
      if (!isAuto) toast.success("Spectrometer reading captured");
    } finally {
      setRequesting(false);
    }
  };

  const handleRequestReading = () => generateReading(false);

  const handleConnection = async () => {
    setConnectionLoading(true);
    try {
      if (opcStatus.connected) {
        await disconnect();
        setAutoScan(false);
        toast.success("Simulator disconnected");
      } else {
        await connect();
        toast.success("Simulator connected");
      }
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleDeleteReading = async (id) => {
    const reading = readings.find((item) => item._id === id);
    if (!reading) return;

    if (!reading.simulated) {
      try {
        await deleteReading(id);
      } catch (error) {
        console.warn("Backend delete failed; removing from local view");
      }
    }

    setReadings((current) => {
      const next = current.filter((item) => item._id !== id);
      setLatestReading(next[0] || null);
      return next;
    });
    toast.success("Reading removed");
  };

  const composition = latestReading?.composition || {};
  const chartData = useMemo(
    () => readings.slice(0, 12).reverse(),
    [readings]
  );

  const columns = [
    {
      header: "Sample",
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-bold text-slate-900">
            {(row._id || "SIM").toString().slice(-10).toUpperCase()}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {row.metalGrade || "SG-IRON"}
          </p>
        </div>
      ),
    },
    {
      header: "Captured",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-slate-600">
          {formatDate(row.timestamp || row.createdAt)}
        </span>
      ),
    },
    ...ELEMENTS.map((element) => ({
      header: element.key,
      render: (row) => (
        <span
          className={`font-mono font-bold ${
            Number(row.composition?.[element.key] || row[element.key] || 0) >
            element.range[1]
              ? "text-red-600"
              : "text-slate-900"
          }`}
        >
          {formatPercentage(
            row.composition?.[element.key] || row[element.key] || 0,
            element.key === "Fe" ? 2 : 3
          )}
        </span>
      ),
    })),
    {
      header: "",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleDeleteReading(row._id)}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete reading"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CircleGauge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Spectrometer console
              </h2>
              <p className="text-sm text-slate-500">
                Simulated optical emission instrument
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoScan((current) => !current)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              autoScan
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <Radio className={`h-4 w-4 ${autoScan ? "animate-pulse" : ""}`} />
            {autoScan ? "Live scanning" : "Start live scan"}
          </button>
          <Button
            variant={opcStatus.connected ? "danger" : "success"}
            onClick={handleConnection}
            loading={connectionLoading}
            size="sm"
          >
            {opcStatus.connected ? (
              <><WifiOff className="mr-2 h-4 w-4" /> Disconnect</>
            ) : (
              <><Wifi className="mr-2 h-4 w-4" /> Connect</>
            )}
          </Button>
          <Button
            onClick={handleRequestReading}
            loading={requesting}
            size="sm"
          >
            <Zap className="mr-2 h-4 w-4" />
            Fetch Readings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden border-slate-200/80">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,.16),transparent_38%),linear-gradient(145deg,#111827,#020617)] p-5 text-white">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/5 blur-3xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Last acquisition
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {latestReading?.metalGrade || "SG-IRON"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {latestReading
                    ? formatDate(latestReading.timestamp || latestReading.createdAt)
                    : "No reading captured"}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                {opcStatus.connected ? "Instrument linked" : "Simulation mode"}
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <Thermometer className="h-4 w-4 text-emerald-300" />
                <p className="mt-3 text-xl font-bold">
                  {latestReading?.temperature?.toFixed?.(1) ||
                    latestReading?.temperature ||
                    "25.8"}°
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Temperature C</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <Gauge className="h-4 w-4 text-emerald-300" />
                <p className="mt-3 text-xl font-bold">
                  {latestReading?.pressure?.toFixed?.(3) ||
                    latestReading?.pressure ||
                    "1.02"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Pressure atm</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <Activity className="h-4 w-4 text-emerald-300" />
                <p className="mt-3 text-xl font-bold">
                  {latestReading?.carbonEquivalent?.toFixed?.(3) ||
                    latestReading?.carbonEquivalent ||
                    "4.31"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Carbon equiv.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <Database className="h-4 w-4 text-emerald-300" />
                <p className="mt-3 text-xl font-bold">
                  {latestReading?.signalQuality ||
                    (opcStatus.connected ? "98" : "96")}%
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Signal quality</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Emission profile">
          <div className="grid grid-cols-2 gap-3">
            {ELEMENTS.map((element) => {
              const value =
                composition[element.key] ||
                latestReading?.[element.key] ||
                element.target;
              const range = element.range[1] - element.range[0];
              const position = Math.max(
                8,
                Math.min(92, ((value - element.range[0]) / range) * 100)
              );
              return (
                <div
                  key={element.key}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {element.key}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {element.name}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {formatPercentage(value, element.key === "Fe" ? 2 : 3)}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      style={{ width: `${position}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="Acquisition trend">
        <div className="flex h-44 items-end gap-2 overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white px-3 pb-3 pt-6">
          {chartData.length ? (
            chartData.map((reading, index) => {
              const iron =
                reading.composition?.Fe ||
                reading.Fe ||
                ELEMENTS[0].target;
              const height = 48 + ((iron - 92) / 3) * 70;
              return (
                <div
                  key={reading._id || index}
                  className="group flex h-full flex-1 items-end"
                  title={`Fe ${formatPercentage(iron, 2)}`}
                >
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-300 transition-all duration-500 group-hover:from-teal-600 group-hover:to-cyan-300"
                    style={{ height: `${Math.max(18, Math.min(100, height))}%` }}
                  />
                </div>
              );
            })
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              No acquisition trend yet
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Fe concentration</span>
          <span>{readings.length} stored samples</span>
        </div>
      </Card>

      <Card title="Reading history">
        <Table
          columns={columns}
          data={readings}
          loading={loading}
          emptyMessage="No spectrometer readings have been captured"
        />
      </Card>
    </div>
  );
};

export default Spectrometer;
