import { useState } from "react";
import { Wifi, WifiOff, Loader } from "lucide-react";
import { useOPC } from "../../context/OPCContext";
import Button from "../common/Button";
import toast from "react-hot-toast";

const OPCStatusIndicator = () => {
  const { status, connect, disconnect, connecting } = useOPC();
  const [actionLoading, setActionLoading] = useState(false);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const result = await connect();
      if (result.success) {
        toast.success("OPC connection initiated");
      } else {
        toast.error(result.error || "Failed to connect to OPC");
      }
    } catch (error) {
      toast.error("Failed to connect to OPC");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setActionLoading(true);
    try {
      const result = await disconnect();
      if (result.success) {
        toast.success("OPC disconnected successfully");
      } else {
        toast.error(result.error || "Failed to disconnect from OPC");
      }
    } catch (error) {
      toast.error("Failed to disconnect from OPC");
    } finally {
      setActionLoading(false);
    }
  };

  const isLoading = actionLoading || connecting;

  return (
    <div
      data-tour="opc-status"
      className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-dark-200"
    >
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            status.connected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <span className="text-sm font-medium text-dark-700">
          {status.connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-dark-200" />

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!status.connected ? (
          <Button
            variant="success"
            size="sm"
            onClick={handleConnect}
            disabled={isLoading}
            loading={isLoading}
            className="!py-1 !px-3"
          >
            <Wifi className="w-4 h-4 mr-1" />
            Connect
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDisconnect}
            disabled={isLoading}
            loading={isLoading}
            className="!py-1 !px-3"
          >
            <WifiOff className="w-4 h-4 mr-1" />
            Disconnect
          </Button>
        )}
      </div>

      {/* Server URL (if connected) */}
      {status.connected && status.serverUrl && (
        <>
          <div className="h-6 w-px bg-dark-200" />
          <span className="text-xs text-dark-600 font-mono">
            {status.serverUrl}
          </span>
        </>
      )}
    </div>
  );
};

export default OPCStatusIndicator;
