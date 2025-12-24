import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { OPCProvider } from "./context/OPCContext";
import { GradeProvider } from "./context/GradeContext";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AnomalyDetection from "./pages/AnomalyDetection";
import Recommendation from "./pages/Recommendation";
import AIAgent from "./pages/AIAgent";
import GradeSpecs from "./pages/GradeSpecs";
import SyntheticData from "./pages/SyntheticData";
import Spectrometer from "./pages/Spectrometer";
import TrainingData from "./pages/TrainingData";
import "./App.css";

function App() {
  return (
    <Router>
      <OPCProvider>
        <GradeProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="anomaly" element={<AnomalyDetection />} />
                <Route path="recommendation" element={<Recommendation />} />
                <Route path="agent" element={<AIAgent />} />
                <Route path="grades" element={<GradeSpecs />} />
                <Route path="synthetic" element={<SyntheticData />} />
                <Route path="spectrometer" element={<Spectrometer />} />
                <Route path="training-data" element={<TrainingData />} />
              </Route>
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid #e2e8f0",
                },
                success: {
                  iconTheme: {
                    primary: "#22c55e",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </div>
        </GradeProvider>
      </OPCProvider>
    </Router>
  );
}

export default App;
