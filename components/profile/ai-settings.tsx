"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  AiProvider,
  AI_MODELS,
  AI_PROVIDERS,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GROQ_MODEL,
  DEFAULT_AI_PROVIDER,
  AiModelOption,
} from "@/lib/ai-config";
import {
  Sparkles,
  Key,
  Save,
  Trash2,
  PenSquare,
  Check,
  Search,
  ChevronDown,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

export function AiExtractionSettings() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Active Provider Selection
  const [activeProvider, setActiveProvider] = useState<AiProvider>(DEFAULT_AI_PROVIDER);

  // Gemini State
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState(DEFAULT_GEMINI_MODEL);
  const [isEditingGeminiKey, setIsEditingGeminiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  // Groq State
  const [groqApiKey, setGroqApiKey] = useState("");
  const [groqModel, setGroqModel] = useState(DEFAULT_GROQ_MODEL);
  const [isEditingGroqKey, setIsEditingGroqKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [testingGroq, setTestingGroq] = useState(false);
  const [groqTestResult, setGroqTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  // Model Picker State
  const [modelSearch, setModelSearch] = useState("");
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [customModelInput, setCustomModelInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);

    const savedProvider = (localStorage.getItem("ai_provider") as AiProvider) || DEFAULT_AI_PROVIDER;
    setActiveProvider(savedProvider);

    const savedGeminiKey = localStorage.getItem("gemini_api_key") || "";
    setGeminiApiKey(savedGeminiKey);

    const savedGeminiModel = localStorage.getItem("gemini_model") || DEFAULT_GEMINI_MODEL;
    setGeminiModel(savedGeminiModel);

    const savedGroqKey = localStorage.getItem("groq_api_key") || "";
    setGroqApiKey(savedGroqKey);

    const savedGroqModel = localStorage.getItem("groq_model") || DEFAULT_GROQ_MODEL;
    setGroqModel(savedGroqModel);
  }, []);

  const handleSetActiveProvider = (provider: AiProvider) => {
    setActiveProvider(provider);
    localStorage.setItem("ai_provider", provider);
    toast({
      title: "Active AI Provider Changed",
      description: `${provider === "gemini" ? "Google Gemini" : "Groq Cloud"} is now your default AI extraction engine.`,
    });
  };

  // Gemini Key Actions
  const handleSaveGeminiKey = () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Gemini API key",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("gemini_api_key", geminiApiKey.trim());
    setIsEditingGeminiKey(false);
    setShowGeminiKey(false);
    setGeminiTestResult(null);
    toast({
      title: "Gemini Key Saved",
      description: "Your Gemini API key has been securely saved locally.",
    });
  };

  const handleDeleteGeminiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setGeminiApiKey("");
    setIsEditingGeminiKey(false);
    setShowGeminiKey(false);
    setGeminiTestResult(null);
    toast({
      title: "Gemini Key Removed",
      description: "Gemini API key removed from local storage.",
    });
  };

  // Groq Key Actions
  const handleSaveGroqKey = () => {
    if (!groqApiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Groq API key",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("groq_api_key", groqApiKey.trim());
    setIsEditingGroqKey(false);
    setShowGroqKey(false);
    setGroqTestResult(null);
    toast({
      title: "Groq Key Saved",
      description: "Your Groq API key has been securely saved locally.",
    });
  };

  const handleDeleteGroqKey = () => {
    localStorage.removeItem("groq_api_key");
    setGroqApiKey("");
    setIsEditingGroqKey(false);
    setShowGroqKey(false);
    setGroqTestResult(null);
    toast({
      title: "Groq Key Removed",
      description: "Groq API key removed from local storage.",
    });
  };

  // Model Selection Actions
  const handleSelectModel = (modelId: string) => {
    if (activeProvider === "gemini") {
      setGeminiModel(modelId);
      localStorage.setItem("gemini_model", modelId);
    } else {
      setGroqModel(modelId);
      localStorage.setItem("groq_model", modelId);
    }
    setIsModelPickerOpen(false);
    setModelSearch("");
    setShowCustomInput(false);
    toast({
      title: "Model Updated",
      description: `Active model set to ${modelId}`,
    });
  };

  const handleApplyCustomModel = () => {
    if (!customModelInput.trim()) return;
    handleSelectModel(customModelInput.trim());
    setCustomModelInput("");
  };

  // Connectivity Test
  const handleTestConnection = async (provider: AiProvider) => {
    const key = provider === "gemini" ? geminiApiKey : groqApiKey;
    const model = provider === "gemini" ? geminiModel : groqModel;

    if (!key || !key.trim()) {
      toast({
        title: "Missing API Key",
        description: `Please enter and save a ${provider === "gemini" ? "Gemini" : "Groq"} API key before testing.`,
        variant: "destructive",
      });
      return;
    }

    if (provider === "gemini") {
      setTestingGemini(true);
      setGeminiTestResult(null);
    } else {
      setTestingGroq(true);
      setGroqTestResult(null);
    }

    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: key.trim(),
          model,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errMsg = data.error || "Connection test failed";
        if (provider === "gemini") {
          setGeminiTestResult({ success: false, error: errMsg });
        } else {
          setGroqTestResult({ success: false, error: errMsg });
        }
        toast({
          title: "Connection Failed",
          description: errMsg,
          variant: "destructive",
        });
      } else {
        if (provider === "gemini") {
          setGeminiTestResult({ success: true, latencyMs: data.latencyMs });
        } else {
          setGroqTestResult({ success: true, latencyMs: data.latencyMs });
        }
        toast({
          title: "Connection Verified ✓",
          description: `${provider === "gemini" ? "Gemini" : "Groq"} responded in ${data.latencyMs}ms using ${data.model}`,
        });
      }
    } catch (err: any) {
      const msg = err.message || "Failed to reach AI service";
      if (provider === "gemini") {
        setGeminiTestResult({ success: false, error: msg });
      } else {
        setGroqTestResult({ success: false, error: msg });
      }
      toast({
        title: "Test Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      if (provider === "gemini") setTestingGemini(false);
      else setTestingGroq(false);
    }
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Extraction Settings
          </CardTitle>
          <CardDescription>Loading AI configuration...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentModels = AI_MODELS[activeProvider] || [];
  const currentModelId = activeProvider === "gemini" ? geminiModel : groqModel;

  // Filter models by search query
  const filteredModels = currentModels.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(modelSearch.toLowerCase())
  );

  // Group models by category
  const categories: Record<string, AiModelOption[]> = {};
  filteredModels.forEach((m) => {
    if (!categories[m.category]) {
      categories[m.category] = [];
    }
    categories[m.category].push(m);
  });

  const isGeminiActive = activeProvider === "gemini";
  const isGroqActive = activeProvider === "groq";

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
              AI Extraction Settings
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Configure Google Gemini or Groq Cloud API keys and select your preferred model for AI invoice extraction.
            </CardDescription>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full sm:w-auto bg-muted/60 p-1 rounded-xl border border-border/40 shrink-0">
            <Button
              type="button"
              size="sm"
              variant={isGeminiActive ? "default" : "ghost"}
              onClick={() => handleSetActiveProvider("gemini")}
              className={`h-8 text-xs font-medium gap-1.5 transition-all justify-center ${
                isGeminiActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Gemini
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isGroqActive ? "default" : "ghost"}
              onClick={() => handleSetActiveProvider("groq")}
              className={`h-8 text-xs font-medium gap-1.5 transition-all justify-center ${
                isGroqActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Groq Cloud
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Active Engine Summary Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Active Engine
                </span>
                <Badge variant="outline" className="text-[11px] font-mono border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
                  {activeProvider === "gemini" ? "Google Gemini" : "Groq Cloud"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Model: <span className="text-foreground font-semibold">{currentModelId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(activeProvider === "gemini" ? geminiApiKey : groqApiKey) ? (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                API Key Configured
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 gap-1 py-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Free Tier Active
              </Badge>
            )}
          </div>
        </div>

        {/* Gemini Configuration Section */}
        {isGeminiActive && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="geminiApiKey" className="text-sm font-medium flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-muted-foreground" />
                    Gemini API Key
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get a free API key with generous rate limits from Google AI Studio.
                  </p>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Get Gemini Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {isEditingGeminiKey || !geminiApiKey ? (
                <div className="space-y-2.5">
                  <div className="relative">
                    <Input
                      id="geminiApiKey"
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveGeminiKey}
                      disabled={!geminiApiKey.trim()}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Key
                    </Button>
                    {geminiApiKey && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const saved = localStorage.getItem("gemini_api_key") || "";
                          setGeminiApiKey(saved);
                          setIsEditingGeminiKey(false);
                        }}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-muted/30 gap-2">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <Key className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">
                      {showGeminiKey ? geminiApiKey : "AIzaSy••••••••••••••••••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="text-muted-foreground hover:text-foreground ml-1 p-0.5 rounded"
                    >
                      {showGeminiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection("gemini")}
                      disabled={testingGemini}
                      className="h-7 text-xs gap-1"
                    >
                      {testingGemini ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingGeminiKey(true)}
                      className="h-7 text-xs gap-1"
                    >
                      <PenSquare className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteGeminiKey}
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Test Connection Status Banner */}
              {geminiTestResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                    geminiTestResult.success
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  }`}
                >
                  {geminiTestResult.success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Verified! Latency: <strong>{geminiTestResult.latencyMs}ms</strong> with model <strong>{geminiModel}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{geminiTestResult.error}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Groq Configuration Section */}
        {isGroqActive && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="groqApiKey" className="text-sm font-medium flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-muted-foreground" />
                    Groq API Key
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get an ultra-fast free API key from the Groq Cloud Console.
                  </p>
                </div>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Get Groq Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {isEditingGroqKey || !groqApiKey ? (
                <div className="space-y-2.5">
                  <div className="relative">
                    <Input
                      id="groqApiKey"
                      type={showGroqKey ? "text" : "password"}
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showGroqKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveGroqKey}
                      disabled={!groqApiKey.trim()}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Key
                    </Button>
                    {groqApiKey && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const saved = localStorage.getItem("groq_api_key") || "";
                          setGroqApiKey(saved);
                          setIsEditingGroqKey(false);
                        }}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-muted/30 gap-2">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <Key className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">
                      {showGroqKey ? groqApiKey : "gsk_••••••••••••••••••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="text-muted-foreground hover:text-foreground ml-1 p-0.5 rounded"
                    >
                      {showGroqKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection("groq")}
                      disabled={testingGroq}
                      className="h-7 text-xs gap-1"
                    >
                      {testingGroq ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingGroqKey(true)}
                      className="h-7 text-xs gap-1"
                    >
                      <PenSquare className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteGroqKey}
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Test Connection Status Banner */}
              {groqTestResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                    groqTestResult.success
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  }`}
                >
                  {groqTestResult.success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Verified! Latency: <strong>{groqTestResult.latencyMs}ms</strong> with model <strong>{groqModel}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{groqTestResult.error}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Model Selection Dropdown (Categorized, Searchable, with Badges & Custom Input) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
              {activeProvider === "gemini" ? "Gemini Model" : "Groq Model"}
            </Label>
            <span className="text-xs text-muted-foreground">
              Select or search any supported model
            </span>
          </div>

          <Popover open={isModelPickerOpen} onOpenChange={setIsModelPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isModelPickerOpen}
                className="w-full justify-between h-11 px-3.5 border-border/80 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1 rounded bg-primary/10 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-medium truncate">
                    {currentModelId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex uppercase">
                    {activeProvider}
                  </Badge>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] p-0 border border-border/80 shadow-xl bg-popover rounded-xl"
              align="start"
            >
              {/* Search Bar */}
              <div className="flex items-center border-b px-3 py-2.5 gap-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Models..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                {modelSearch && (
                  <button
                    onClick={() => setModelSearch("")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Model List by Category */}
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-3">
                {Object.keys(categories).length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No models found matching &quot;{modelSearch}&quot;
                  </div>
                ) : (
                  Object.entries(categories).map(([categoryName, models]) => (
                    <div key={categoryName} className="space-y-1">
                      <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {categoryName}
                      </div>
                      {models.map((m) => {
                        const isSelected = currentModelId === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleSelectModel(m.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground font-medium"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <div className="space-y-0.5 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs sm:text-sm">
                                  {m.name}
                                </span>
                                {m.badge && (
                                  <Badge
                                    variant={isSelected ? "outline" : "secondary"}
                                    className={`text-[9px] px-1.5 py-0 ${
                                      isSelected
                                        ? "border-primary-foreground/40 text-primary-foreground"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                  >
                                    {m.badge}
                                  </Badge>
                                )}
                              </div>
                              <p
                                className={`text-[11px] line-clamp-1 ${
                                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                                }`}
                              >
                                {m.description}
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Custom Model Input Footer */}
              <div className="border-t p-2 bg-muted/40 rounded-b-xl space-y-2">
                {!showCustomInput ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Enter Custom Model Identifier...
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Input
                      placeholder="e.g. qwen/qwen3.8-27b"
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCustomModel();
                        }
                      }}
                      className="h-8 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplyCustomModel}
                      disabled={!customModelInput.trim()}
                      className="h-8 text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <p className="text-xs text-muted-foreground">
            This model will be used whenever you click &quot;Extract Invoice With AI&quot; on uploaded invoices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
