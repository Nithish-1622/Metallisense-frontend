import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  OctagonX,
  Send,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Keyboard,
  RotateCcw,
  Sparkles,
  Globe2,
  ChevronDown,
  Play,
} from "lucide-react";
import {
  sendChatMessage,
  transcribeAudio,
  clearChatHistory,
  getSupportedLanguages,
  synthesizeSpeech,
} from "../../services/copilotService";
import toast from "react-hot-toast";
import copilotLogo from "../../assets/Metallisenselogo1.png";

const createSessionId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `copilot-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const formatAssistantResponse = (content) =>
  String(content || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const stripMarkdown = (value) =>
  String(value || "")
    .replace(/\*\*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-#>\s]+/, "")
    .trim();

const AssistantResponse = ({ content }) => {
  const lines = formatAssistantResponse(content);
  const tableIndex = lines.findIndex((line) => line.startsWith("|"));
  const tableBlocks = [];

  if (tableIndex >= 0) {
    const tableLines = lines.slice(tableIndex).filter(
      (line) => line.startsWith("|")
    );
    if (tableLines.length >= 2) {
      tableLines.forEach((line) => {
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((cell) => stripMarkdown(cell));
        if (!cells.every((cell) => /^-+$/.test(cell.replace(/\s/g, "")))) {
          tableBlocks.push(cells);
        }
      });
    }
  }

  const introLines = tableIndex >= 0 ? lines.slice(0, tableIndex) : lines;
  const title = introLines.find((line) => !/^[-*]/.test(line));
  const descriptionLines = introLines.filter((line) => line !== title);

  return (
    <div className="space-y-3">
      {title && (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-3.5 py-3">
          <p className="text-sm font-semibold text-slate-900">
            {stripMarkdown(title)}
          </p>
          {descriptionLines.length > 0 && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {descriptionLines.map(stripMarkdown).join(" ")}
            </p>
          )}
        </div>
      )}

      {tableBlocks.length > 1 && (
        <div className="grid gap-2">
          {tableBlocks.slice(1).map((cells, index) => (
            <div
              key={`${cells[0]}-${index}`}
              className="group rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-[0_8px_24px_rgba(15,23,42,.04)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {cells[0] || `Insight ${index + 1}`}
                  </p>
                  {cells.slice(1).map((cell, cellIndex) => (
                    <p
                      key={cellIndex}
                      className="mt-1 text-xs leading-5 text-slate-600"
                    >
                      {cell}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!tableBlocks.length &&
        lines
          .filter((line) => !line.startsWith("|"))
          .map((line, lineIndex) =>
            /^[-*]\s/.test(line) ? (
              <div
                key={lineIndex}
                className="flex items-start gap-2 rounded-xl bg-emerald-50/70 px-3 py-2"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-xs leading-5 text-slate-700">
                  {stripMarkdown(line)}
                </span>
              </div>
            ) : (
              <p key={lineIndex} className="text-sm leading-6 text-slate-700">
                {stripMarkdown(line)}
              </p>
            )
          )}
    </div>
  );
};

const AIChatInterface = ({ isOpen = false, onClose = () => {} }) => {
  const [open, setOpen] = useState(isOpen);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sessionId, setSessionId] = useState(createSessionId);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [providerError, setProviderError] = useState("");
  const recordingStartedAtRef = useRef(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [micLevels, setMicLevels] = useState([8, 10, 13, 9, 12, 8, 11, 9]);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechAudioRef = useRef(null);
  const speechUrlRef = useRef(null);
  const chatAbortRef = useRef(null);

  useEffect(() => setOpen(isOpen), [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    getSupportedLanguages()
      .then((response) => {
        const data =
          response.data?.languages ||
          response.data?.data?.languages ||
          response.data;
        if (Array.isArray(data)) setLanguages(data);
        else if (data && typeof data === "object")
          setLanguages(Object.keys(data));
      })
      .catch((error) => {
        setProviderError(
          error.response?.data?.message ||
            "Voice language service is unavailable."
        );
      });

    return () => {
      speechAudioRef.current?.pause();
      if (speechUrlRef.current) URL.revokeObjectURL(speechUrlRef.current);
      stopRecordingResources();
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        setOpen(true);
        if (!isRecording) startRecording();
        else stopRecording();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [isRecording]);

  const stopRecordingResources = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioContextRef.current?.state !== "closed")
      audioContextRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const closePanel = () => {
    quitCopilot();
    setOpen(false);
    onClose();
  };

  const quitCopilot = () => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;

    speechAudioRef.current?.pause();
    if (speechUrlRef.current) {
      URL.revokeObjectURL(speechUrlRef.current);
      speechUrlRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    stopRecordingResources();

    setIsLoading(false);
    setIsTranscribing(false);
    setIsRecording(false);
    setSpeakingIndex(null);
    setMicLevels([8, 10, 13, 9, 12, 8, 11, 9]);
  };

  const playAssistantResponse = async (text) => {
    if (!text?.trim()) return;

    try {
      setSpeakingIndex("auto");
      speechAudioRef.current?.pause();
      if (speechUrlRef.current) URL.revokeObjectURL(speechUrlRef.current);

      const blob = await synthesizeSpeech(text, selectedLanguage);
      const url = URL.createObjectURL(blob);
      speechUrlRef.current = url;

      const audio = new Audio(url);
      speechAudioRef.current = audio;
      audio.onended = () => {
        setSpeakingIndex(null);
        URL.revokeObjectURL(url);
        speechUrlRef.current = null;
      };
      audio.onerror = () => {
        setSpeakingIndex(null);
        setProviderError("The voice provider could not play the response.");
        URL.revokeObjectURL(url);
        speechUrlRef.current = null;
      };
      await audio.play();
    } catch (error) {
      setSpeakingIndex(null);
      setProviderError(
        error.response?.data?.message ||
          error.message ||
          "The voice provider could not synthesize speech."
      );
    }
  };

  const handleSendMessage = async (
    messageText = inputMessage,
    { autoSpeak = false, voiceMessage = false } = {}
  ) => {
    const text = messageText.trim();
    if (!text || isLoading) return;

    if (!voiceMessage) {
      setMessages((current) => [...current, { role: "user", content: text }]);
    }
    setInputMessage("");
    setIsLoading(true);
    setProviderError("");

    try {
      chatAbortRef.current?.abort();
      chatAbortRef.current = new AbortController();
      const response = await sendChatMessage(
        text,
        true,
        sessionId,
        chatAbortRef.current.signal
      );
      const data = response.data?.data || response.data;
      const serverSessionId = data?.session_id || response.data?.session_id;
      if (serverSessionId) setSessionId(serverSessionId);
      const reply =
        data?.response ||
        data?.message ||
        response.data?.response ||
        "No response was returned.";
      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
      if (autoSpeak) {
        await playAssistantResponse(reply);
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        setProviderError("");
        return;
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        "The AI provider is unavailable.";
      setProviderError(message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I could not complete that request. Check the provider status and retry.",
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory(sessionId);
      setMessages([]);
      setSessionId(createSessionId());
      setProviderError("");
      toast.success("New Copilot session started");
    } catch (error) {
      setProviderError(
        error.response?.data?.message || "Could not clear chat history."
      );
    }
  };

  const startRecording = async () => {
    try {
      setOpen(true);
      setProviderError("");
      recordingStartedAtRef.current = Date.now();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;
      audioContext.createMediaStreamSource(stream).connect(analyser);

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const animateLevels = () => {
        analyser.getByteFrequencyData(frequencyData);
        const levels = Array.from(frequencyData)
          .slice(1, 9)
          .map((value) => Math.max(8, Math.round((value / 255) * 42)));
        setMicLevels(levels);
        animationFrameRef.current = requestAnimationFrame(animateLevels);
      };
      animateLevels();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stopRecordingResources();
        setIsRecording(false);
        setMicLevels([8, 10, 13, 9, 12, 8, 11, 9]);
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        await transcribe(blob);
      };
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setProviderError(
        error.name === "NotAllowedError"
          ? "Microphone permission was denied."
          : "Could not start the microphone."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const transcribe = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const extension = audioBlob.type.includes("ogg")
        ? "ogg"
        : audioBlob.type.includes("mp4")
          ? "m4a"
          : "webm";
      const file = new File([audioBlob], `voice-note.${extension}`, {
        type: audioBlob.type,
      });
      const response = await transcribeAudio(file, selectedLanguage);
      const text = response.data?.text || response.data?.data?.text;
      if (!text) throw new Error("No transcription was returned.");
      const duration = Math.max(
        1,
        Math.round(
          (Date.now() - (recordingStartedAtRef.current || Date.now())) / 1000
        )
      );
      setMessages((current) => [
        ...current,
        {
          role: "voice",
          content: text,
          duration,
          levels: micLevels,
        },
      ]);
      setInputMessage("");
      setProviderError("");
      toast.success("Voice message sent");
      await handleSendMessage(text, {
        autoSpeak: true,
        voiceMessage: true,
      });
    } catch (error) {
      setProviderError(
        error.response?.data?.message ||
          error.message ||
          "The transcription provider is unavailable."
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSpeakMessage = async (text, index) => {
    if (speakingIndex === index) {
      speechAudioRef.current?.pause();
      setSpeakingIndex(null);
      return;
    }

    try {
      setSpeakingIndex(index);
      setProviderError("");
      speechAudioRef.current?.pause();
      if (speechUrlRef.current) URL.revokeObjectURL(speechUrlRef.current);
      const blob = await synthesizeSpeech(text, selectedLanguage);
      const url = URL.createObjectURL(blob);
      speechUrlRef.current = url;
      const audio = new Audio(url);
      speechAudioRef.current = audio;
      audio.onended = () => {
        setSpeakingIndex(null);
        URL.revokeObjectURL(url);
        speechUrlRef.current = null;
      };
      audio.onerror = () => {
        setSpeakingIndex(null);
        setProviderError("The voice provider could not play the response.");
        URL.revokeObjectURL(url);
        speechUrlRef.current = null;
      };
      await audio.play();
    } catch (error) {
      setSpeakingIndex(null);
      setProviderError(
        error.response?.data?.message ||
          error.message ||
          "The voice provider could not synthesize speech."
      );
    }
  };

  const suggestedPrompts = [
    "Explain this analysis",
    "What should I check next?",
    "Summarize the key risk",
  ];

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-[60] flex h-[72px] w-[72px] items-center justify-center rounded-full border border-emerald-200/90 bg-white/95 text-emerald-700 shadow-[0_18px_48px_rgba(16,185,129,.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(16,185,129,.38)]"
          aria-label="Open AI Copilot"
        >
          <span className="absolute -left-1 top-1 h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "0ms" }} />
          <span className="absolute bottom-1 right-0 h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: "160ms" }} />
          <span className="absolute right-[-3px] top-3 h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-300" style={{ animationDelay: "320ms" }} />
          <span className="absolute inset-1 rounded-full bg-[linear-gradient(135deg,rgba(236,253,245,.98),rgba(209,250,229,.92))]" />
          <img
            src={copilotLogo}
            alt="MetalliSense Copilot"
            className="relative h-[62px] w-[62px] rounded-full object-cover ring-2 ring-white"
          />
        </button>
      )}

      {open && (
        <div className="fixed bottom-3 right-3 z-[60] flex h-[min(720px,calc(100vh-1.5rem))] w-[calc(100vw-1.5rem)] max-w-[470px] flex-col overflow-hidden rounded-[30px] border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,.94),rgba(240,253,244,.88))] text-slate-900 shadow-[0_28px_90px_rgba(16,185,129,.24)] backdrop-blur-2xl sm:bottom-5 sm:right-5">
          <div className="relative overflow-hidden px-5 pb-4 pt-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(52,211,153,.20),transparent_38%),linear-gradient(135deg,rgba(255,255,255,.92),rgba(236,253,245,.72))]" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={copilotLogo}
                  alt=""
                  className="h-16 w-16 rounded-2xl border border-emerald-100 bg-white object-cover shadow-[0_8px_24px_rgba(16,185,129,.14)]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold tracking-wide text-slate-950">MetalliSense Copilot</h3>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Analysis-aware assistant</p>
                </div>
              </div>
              <div className="flex gap-1">
                {(isLoading || isRecording || isTranscribing || speakingIndex !== null) && (
                  <button
                    type="button"
                    onClick={quitCopilot}
                    className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                    title="Stop voice and AI response"
                    aria-label="Quit active AI input"
                  >
                    <OctagonX className="h-4 w-4" />
                    Quit
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="rounded-xl p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                  title="New session"
                  aria-label="Clear history and start a new session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-xl p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {providerError && (
            <div className="mx-4 mt-1 flex items-start justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <span>{providerError}</span>
              <button
                type="button"
                onClick={() => setProviderError("")}
                className="ml-2 text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="relative flex h-full flex-col items-center justify-end pb-3">
                <div className="absolute inset-x-0 top-8 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <span className="absolute inset-[-12px] animate-pulse rounded-full border border-emerald-200/70" />
                    <img
                      src={copilotLogo}
                      alt=""
                      className="relative h-20 w-20 rounded-full border-4 border-white object-cover shadow-[0_16px_40px_rgba(16,185,129,.20)]"
                    />
                  </div>
                  <p className="rounded-full border border-emerald-100 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
                    Context connected
                  </p>
                  <h4 className="mt-4 text-2xl font-bold text-slate-950">How can I help?</h4>
                  <p className="mt-2 max-w-[290px] text-sm leading-6 text-slate-500">
                    Ask about the current analysis, composition, or next recommended checks.
                  </p>
                </div>
                <div className="grid w-full gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full rounded-2xl border border-emerald-100/80 bg-white/65 px-4 py-3 text-left text-sm text-slate-700 shadow-sm backdrop-blur-md transition hover:border-emerald-300/70 hover:bg-emerald-50/80"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] ${
                        message.role === "user"
                          ? "rounded-[22px] rounded-br-md bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 text-sm text-white shadow-[0_8px_20px_rgba(16,185,129,.16)]"
                          : "rounded-[22px] rounded-bl-md border border-emerald-100/90 bg-white/90 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,.06)]"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div>
                          <AssistantResponse content={message.content} />
                          <button
                            type="button"
                            onClick={() => handleSpeakMessage(message.content, index)}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700"
                            disabled={speakingIndex !== null && speakingIndex !== index}
                          >
                            {speakingIndex === index ? (
                              <><VolumeX className="h-3.5 w-3.5" /> Stop</>
                            ) : (
                              <><Volume2 className="h-3.5 w-3.5" /> Speak</>
                            )}
                          </button>
                        </div>
                      ) : message.role === "voice" ? (
                        <div className="flex min-w-[210px] items-center gap-3">
                          <button
                            type="button"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                            aria-label="Voice message"
                          >
                            <Play className="h-4 w-4 fill-current" />
                          </button>
                          <div className="flex h-7 flex-1 items-center gap-[3px]">
                            {(message.levels || [8, 14, 20, 12, 24, 17, 9, 22, 15, 8])
                              .slice(0, 10)
                              .map((level, levelIndex) => (
                                <span
                                  key={levelIndex}
                                  className="w-1 rounded-full bg-emerald-400"
                                  style={{ height: `${Math.max(6, level * 0.55)}px` }}
                                />
                              ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            0:{String(message.duration || 1).padStart(2, "0")}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm leading-6">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
                          style={{ animationDelay: `${dot * 120}ms` }}
                        />
                      ))}
                    </div>
                    Generating response
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-emerald-100/70 bg-white/75 p-3 shadow-[0_-12px_36px_rgba(16,185,129,.06)] backdrop-blur-xl">
            {languages.length > 0 && (
              <div className="relative mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setLanguageMenuOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/85 px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                  aria-expanded={languageMenuOpen}
                >
                  <Globe2 className="h-3.5 w-3.5 text-emerald-600" />
                  {languages.find((language) =>
                    (typeof language === "string" ? language : language.code) === selectedLanguage
                  )?.name ||
                    (typeof languages.find((language) =>
                      (typeof language === "string" ? language : language.code) === selectedLanguage
                    ) === "string"
                      ? selectedLanguage
                      : selectedLanguage)}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {languageMenuOpen && (
                  <div className="absolute bottom-9 left-0 z-20 w-44 overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 p-1 shadow-[0_16px_40px_rgba(15,23,42,.14)] backdrop-blur-xl">
                    {languages.map((language) => {
                      const code =
                        typeof language === "string" ? language : language.code;
                      const label =
                        typeof language === "string"
                          ? language
                          : language.name || language.code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(code);
                            setLanguageMenuOpen(false);
                          }}
                          className={`w-full rounded-xl px-3 py-2 text-left text-xs ${
                            code === selectedLanguage
                              ? "bg-emerald-50 font-semibold text-emerald-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Keyboard className="h-3 w-3" /> Ctrl + Shift + M
                </span>
              </div>
            )}

            {isRecording && (
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-2">
                <div className="flex h-8 items-end gap-1">
                  {micLevels.map((level, index) => (
                    <span
                      key={index}
                      className="w-1 rounded-full bg-emerald-300 transition-[height] duration-75"
                      style={{ height: `${level}px` }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-emerald-700">
                  Listening
                </span>
              </div>
            )}

            {isTranscribing && (
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                Processing voice
              </div>
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-emerald-100/80 bg-white/75 p-2 shadow-sm">
              <textarea
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask Copilot..."
                className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                disabled={isLoading || isTranscribing}
              />
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  isRecording
                    ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,.35)]"
                    : "bg-emerald-50 text-slate-600 hover:bg-emerald-100"
                }`}
                aria-label={isRecording ? "Stop voice input" : "Start voice input"}
              >
                {isRecording ? (
                  <Square className="h-4 w-4 fill-current" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading || isTranscribing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatInterface;
