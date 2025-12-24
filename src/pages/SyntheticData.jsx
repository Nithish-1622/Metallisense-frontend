import React, { useState, useContext } from "react";
import { OPCContext } from "../context/OPCContext";
import { GradeContext } from "../context/GradeContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Slider from "../components/common/Slider";
import Select from "../components/common/Select";
import Badge from "../components/common/Badge";
import { generateSyntheticReading } from "../services/opcService";
import toast from "react-hot-toast";
import { ELEMENT_SYMBOLS, DEVIATION_LIMITS } from "../utils/constants";
import { formatPercentage } from "../utils/formatters";

const SyntheticData = () => {
  const {
    opcStatus,
    connect,
    disconnect,
    loading: opcLoading,
  } = useContext(OPCContext);
  const { grades } = useContext(GradeContext);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [deviationElements, setDeviationElements] = useState([]);
  const [deviationPercentage, setDeviationPercentage] = useState(
    DEVIATION_LIMITS.DEFAULT
  );
  const [generatedReading, setGeneratedReading] = useState(null);
  const [generating, setGenerating] = useState(false);

  const gradeOptions = grades.map((g) => ({
    value: g.gradeName,
    label: g.gradeName,
  }));

  const handleToggleElement = (element) => {
    if (deviationElements.includes(element)) {
      setDeviationElements(deviationElements.filter((el) => el !== element));
    } else {
      setDeviationElements([...deviationElements, element]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedGrade) {
      toast.error("Please select a grade");
      return;
    }

    setGenerating(true);
    try {
      const response = await generateSyntheticReading({
        gradeName: selectedGrade,
        deviationElements,
        deviationPercentage,
      });

      setGeneratedReading(response.data.data);
      toast.success("Synthetic reading generated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate synthetic reading"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleConnect = async () => {
    const result = await connect();
    if (result.success) {
      toast.success("OPC Server connected");
    } else {
      toast.error(result.error || "Failed to connect to OPC Server");
    }
  };

  const handleDisconnect = async () => {
    const result = await disconnect();
    if (result.success) {
      toast.success("OPC Server disconnected");
    } else {
      toast.error(result.error || "Failed to disconnect from OPC Server");
    }
  };

  return (
    <div className="space-y-6">
      {/* OPC Connection Control */}
      <Card title="OPC Connection">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                opcStatus.connected
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="font-medium">
              Status: {opcStatus.connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleConnect}
              loading={opcLoading}
              disabled={opcStatus.connected}
              variant={opcStatus.connected ? "secondary" : "primary"}
            >
              Connect
            </Button>
            <Button
              onClick={handleDisconnect}
              loading={opcLoading}
              disabled={!opcStatus.connected}
              variant="danger"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>

      {/* Configuration */}
      <Card title="Synthetic Data Configuration">
        <div className="space-y-6">
          <Select
            label="Select Grade"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            options={[
              { value: "", label: "Select a grade..." },
              ...gradeOptions,
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-3">
              Deviation Elements
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {ELEMENT_SYMBOLS.map((element) => (
                <button
                  key={element}
                  type="button"
                  onClick={() => handleToggleElement(element)}
                  className={`px-4 py-2 rounded-lg border-2 font-mono font-semibold transition-all ${
                    deviationElements.includes(element)
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-dark-200 bg-white text-dark-600 hover:border-dark-300"
                  }`}
                >
                  {element}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Deviation Percentage"
            value={deviationPercentage}
            onChange={setDeviationPercentage}
            min={DEVIATION_LIMITS.MIN}
            max={DEVIATION_LIMITS.MAX}
            step={1}
          />

          <Button
            onClick={handleGenerate}
            loading={generating}
            className="w-full"
          >
            Generate Synthetic Reading
          </Button>
        </div>
      </Card>

      {/* Generated Reading */}
      {generatedReading && (
        <Card title="Generated Reading">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(generatedReading.syntheticReading).map(
                ([element, value]) => {
                  const isDeviated =
                    generatedReading.metadata?.deviatedElements?.includes(
                      element
                    );
                  return (
                    <div
                      key={element}
                      className={`p-4 rounded-lg border-2 ${
                        isDeviated
                          ? "border-yellow-300 bg-yellow-50"
                          : "border-dark-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-lg">
                          {element}
                        </span>
                        {isDeviated && (
                          <Badge variant="warning">Deviated</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-dark-900">
                        {formatPercentage(value)}
                      </p>
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleGenerate} variant="outline">
                Generate New
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(generatedReading.syntheticReading, null, 2)
                  );
                  toast.success("Copied to clipboard");
                }}
                variant="secondary"
              >
                Copy JSON
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SyntheticData;
