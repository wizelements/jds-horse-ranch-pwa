"use client";

import { useState, useEffect } from "react";

export interface AccessibilitySettings {
  textSize: number; // 80-150, percentage
  contrast: "normal" | "high";
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 100,
  contrast: "normal",
};

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("a11y_settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        applySettings(parsed);
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply text size (affects all text via rem scaling)
    root.style.fontSize = `${(newSettings.textSize / 100) * 16}px`;

    // Apply contrast
    if (newSettings.contrast === "high") {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Save to localStorage
    localStorage.setItem("a11y_settings", JSON.stringify(newSettings));
  };

  const handleTextSizeChange = (delta: number) => {
    const newSize = Math.min(150, Math.max(80, settings.textSize + delta));
    const newSettings = { ...settings, textSize: newSize };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  const toggleContrast = () => {
    const newSettings: AccessibilitySettings = {
      ...settings,
      contrast: settings.contrast === "normal" ? "high" : "normal",
    };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Toolbar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 bg-ranch-dark hover:bg-ranch-brown text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition tooltip-button"
        title="Accessibility Options"
      >
        <span className="text-xl">♿</span>
      </button>

      {/* Toolbar Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 bg-white rounded-lg shadow-2xl p-6 w-64 border-2 border-ranch-dark">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-ranch-dark">Accessibility</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Text Size Control */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Text Size: {settings.textSize}%
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleTextSizeChange(-10)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded transition"
                title="Decrease text size"
              >
                A−
              </button>
              <button
                onClick={() => handleTextSizeChange(10)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded transition"
                title="Increase text size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Contrast Control */}
          <div className="mb-5">
            <button
              onClick={toggleContrast}
              className={`w-full py-2 rounded font-semibold transition ${
                settings.contrast === "high"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
              title="Toggle high contrast mode"
            >
              {settings.contrast === "high" ? "High Contrast: ON" : "High Contrast: OFF"}
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full bg-ranch-brown hover:bg-ranch-dark text-white font-semibold py-2 rounded transition"
          >
            Reset to Default
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your preferences are saved automatically
          </p>
        </div>
      )}

      {/* Inline Styles for High Contrast */}
      <style jsx global>{`
        :root.high-contrast {
          --bg-color: #000;
          --text-color: #fff;
          --border-color: #fff;
        }

        :root.high-contrast body {
          background-color: #000;
          color: #fff;
        }

        :root.high-contrast button,
        :root.high-contrast a {
          border: 2px solid #fff;
        }

        :root.high-contrast .high-contrast-text {
          font-weight: bold;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
