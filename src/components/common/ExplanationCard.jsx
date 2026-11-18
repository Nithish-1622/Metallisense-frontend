import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock3,
  Gauge,
  ShieldCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { synthesizeSpeech } from "../../services/copilotService";

const ExplanationCard = ({ explanation, loading = false, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synthesisError, setSynthesisError] = useState("");
  const audioUrlRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  if (!explanation && !loading) return null;

  const confidence =
    typeof explanation?.confidence === "number"
      ? Math.max(0, Math.min(100, explanation.confidence * 100))
      : null;

  const handleSpeak = async () => {
    if (!explanation) return;
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      setSynthesisError("");
      const text = [
        explanation.summary,
        explanation.explanation,
        explanation.recommendation,
        Array.isArray(explanation.action_items)
          ? explanation.action_items.join(". ")
          : "",
      ]
        .filter(Boolean)
        .join(". ");
      const blob = await synthesizeSpeech(text);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setSynthesisError("The voice provider could not play this response.");
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
      };
      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
      setSynthesisError(
        error.response?.data?.message ||
          error.message ||
          "The voice provider could not synthesize speech."
      );
    }
  };

  const risk = String(explanation?.risk_level || "unknown").toLowerCase();
  const riskStyles = {
    low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700",
    medium: "border-amber-400/30 bg-amber-400/10 text-amber-700",
    high: "border-red-400/30 bg-red-400/10 text-red-700",
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,.08)]">
      <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300 shadow-lg">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Explainable AI
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">
                {loading ? "Preparing reasoning" : "Analysis reasoning"}
              </h3>
            </div>
          </div>
          {explanation && (
            <button
              type="button"
              onClick={handleSpeak}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                isSpeaking
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
              }`}
              aria-label={isSpeaking ? "Stop spoken explanation" : "Speak explanation"}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 px-5 py-6 sm:px-6">
          {[86, 68, 78].map((width, index) => (
            <div key={index} className="h-3 animate-pulse rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-200"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-5 sm:px-6">
          {explanation && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {explanation.risk_level && (
                  <div
                    className={`rounded-2xl border p-3 ${riskStyles[risk] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Risk
                    </div>
                    <p className="mt-2 text-sm font-semibold capitalize">{explanation.risk_level}</p>
                  </div>
                )}
                {confidence !== null && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                      <Gauge className="h-3.5 w-3.5" />
                      Confidence
                    </div>
                    <p className="mt-2 text-sm font-semibold">{confidence.toFixed(1)}%</p>
                  </div>
                )}
                {explanation.timestamp && (
                  <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700 sm:col-span-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                      <Clock3 className="h-3.5 w-3.5" />
                      Generated
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold">
                      {new Date(explanation.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Summary
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-800">
                  {explanation.summary || "No summary was returned."}
                </p>
              </div>

              {Array.isArray(explanation.action_items) &&
                explanation.action_items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      Recommended checks
                    </p>
                    {explanation.action_items.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-sm leading-5 text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                )}

              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                className="mt-4 flex w-full items-center justify-between rounded-xl px-1 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700"
                aria-expanded={isExpanded}
              >
                {isExpanded ? "Hide full reasoning" : "View full reasoning"}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  {explanation.explanation && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Explanation
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {explanation.explanation}
                      </p>
                    </div>
                  )}
                  {explanation.context && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Context
                      </p>
                      <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-5 text-slate-300">
                        {typeof explanation.context === "string"
                          ? explanation.context
                          : JSON.stringify(explanation.context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {explanation.recommendation && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Recommendation
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    {explanation.recommendation}
                  </p>
                </div>
              )}

              {synthesisError && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <span>{synthesisError}</span>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="ml-3 inline-flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retry
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                AI guidance is advisory. Human approval is required before operational action.
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default ExplanationCard;
