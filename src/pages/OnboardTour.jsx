import React, { useState, useEffect } from "react";
import Joyride from "react-joyride";
import Card from "../components/common/Card";
import Button from "../components/common/Button"; 
import { useNavigate } from "react-router-dom";
import logo from "../assets/Metallisense-logo.png";

const OnboardTour = () => {
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboardTourCompleted");
    setTourCompleted(completed === "true");
  }, []);

  const steps = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-3">
            Welcome to MetalliSense! 🚀
          </h2>
          <p>
            MetalliSense is an industrial-grade metal analysis and quality
            control system that integrates with OPC UA servers for real-time
            spectrometer readings.
          </p>
        </div>
      ),
      placement: "center",
    },
    {
      target: '[data-tour="sidebar"]',
      content:
        "Use this sidebar to navigate between different sections of the application.",
    },
    {
      target: '[data-tour="opc-status"]',
      content:
        "Monitor your OPC server connection status here. The indicator updates every 3 seconds.",
    },
  ];

  const handleStartTour = () => {
    setRunTour(true);
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRunTour(false);
      localStorage.setItem("onboardTourCompleted", "true");
      setTourCompleted(true);
    }
  };

  return (
    <div className="space-y-6">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#16a34a",
            zIndex: 10000,
          },
        }}
      />

      <Card title="Welcome to MetalliSense">
        <div className="space-y-6">
          <div className="text-center py-12 bg-gradient-to-br from-primary-50 via-white to-metal-50 rounded-xl">
            <div className="inline-block mb-6">
              <img 
                src={logo} 
                alt="MetalliSense Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-lg text-metal-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Industrial-grade metal analysis and quality control system with
              AI-powered anomaly detection, alloy recommendations, and real-time
              OPC UA integration.
            </p>

            {!tourCompleted ? (
              <Button onClick={handleStartTour} size="lg" className="shadow-metal-lg">
                Start Interactive Tour
              </Button>
            ) : (
              <div>
                <Button onClick={handleStartTour} size="lg" variant="outline">
                  Restart Tour
                </Button>
                <p className="text-sm text-metal-500 mt-4">
                  Tour completed! You can restart it anytime.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border-2 border-primary-200 hover:shadow-metal-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xl shadow-metal">
                  🔍
                </div>
                <h3 className="font-bold text-primary-900 text-lg">
                  Anomaly Detection
                </h3>
              </div>
              <p className="text-sm text-primary-700 leading-relaxed">
                Detect anomalies in spectrometer readings with AI-powered
                analysis.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200 hover:shadow-metal-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                  💡
                </div>
                <h3 className="font-bold text-blue-900 text-lg">
                  Alloy Recommendations
                </h3>
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">
                Get AI-powered grade recommendations based on composition.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-xl border-2 border-accent-200 hover:shadow-metal-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                  🤖
                </div>
                <h3 className="font-bold text-accent-900 text-lg">AI Agent</h3>
              </div>
              <p className="text-sm text-accent-700 leading-relaxed">
                Comprehensive AI analysis with quality assessment and
                suggestions.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200 hover:shadow-metal-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                  📊
                </div>
                <h3 className="font-bold text-purple-900 text-lg">
                  Grade Specs
                </h3>
              </div>
              <p className="text-sm text-purple-700 leading-relaxed">
                Manage metal grade specifications and composition ranges.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl border-2 border-yellow-200 hover:shadow-metal-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                  ⚡
                </div>
                <h3 className="font-bold text-yellow-900 text-lg">
                  Synthetic Data
                </h3>
              </div>
              <p className="text-sm text-yellow-700 leading-relaxed">
                Generate synthetic readings with controlled deviations.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border-2 border-red-200 hover:shadow-metal-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                  🔬
                </div>
                <h3 className="font-bold text-red-900 text-lg">
                  Spectrometer
                </h3>
              </div>
              <p className="text-sm text-red-700 leading-relaxed">
                Manage real-time OPC readings and spectrometer data.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-metal-200">
            <Button onClick={() => navigate("/dashboard")} size="lg" className="shadow-metal-lg">
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate("/anomaly")}
              size="lg"
              variant="outline"
            >
              Try Anomaly Detection
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OnboardTour;
