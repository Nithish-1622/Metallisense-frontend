import React, { createContext, useState, useEffect } from "react";
import {
  getOPCStatus,
  connectOPC,
  disconnectOPC,
} from "../services/opcService";
import { OPC_POLL_INTERVAL } from "../utils/constants";

export const OPCContext = createContext();

export const OPCProvider = ({ children }) => {
  const [opcStatus, setOpcStatus] = useState({
    connected: false,
    serverUrl: null,
    lastUpdate: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getOPCStatus();
        setOpcStatus({
          connected: response.data.data?.connected || false,
          serverUrl: response.data.data?.serverUrl || null,
          lastUpdate: new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch OPC status:", error);
        setOpcStatus((prev) => ({ ...prev, connected: false }));
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, OPC_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      await connectOPC();
      // Status will be updated by the polling interval
      return { success: true };
    } catch (error) {
      console.error("Failed to connect OPC:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await disconnectOPC();
      // Status will be updated by the polling interval
      return { success: true };
    } catch (error) {
      console.error("Failed to disconnect OPC:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <OPCContext.Provider value={{ opcStatus, connect, disconnect, loading }}>
      {children}
    </OPCContext.Provider>
  );
};
