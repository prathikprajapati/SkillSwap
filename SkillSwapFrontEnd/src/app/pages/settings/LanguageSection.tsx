import { useState } from "react";
import { Save, Globe, Clock, Calendar } from "lucide-react";

export function LanguageSection() {
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC-5");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12h");

  const languages = [
    { value: "en", label: "English (US)", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
    { value: "it", label: "Italiano", flag: "🇮🇹" },
    { value: "pt", label: "Português", flag: "🇵🇹" },
    { value: "zh", label: "中文", flag: "🇨🇳" },
    { value: "ja", label: "日本語", flag: "🇯🇵" },
  ];

  const timezones = [
    { value: "UTC-8", label: "Pacific Time (UTC-8)" },
    { value: "UTC-7", label: "Mountain Time (UTC-7)" },
    { value: "UTC-6", label: "Central Time (UTC-6)" },
    { value: "UTC-5", label: "Eastern Time (UTC-5)" },
    { value: "UTC+0", label: "Greenwich Mean Time (UTC+0)" },
    { value: "UTC+1", label: "Central European Time (UTC+1)" },
    { value: "UTC+8", label: "China Standard Time (UTC+8)" },
    { value: "UTC+9", label: "Japan Standard Time (UTC+9)" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Language & Region</h2>
      
      {/* Language */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Language</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                language === lang.value 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:bg-accent"
              }`}
            >
              <span className="text-2xl mr-2">{lang.flag}</span>
              <span className="text-sm">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Timezone</h3>
        </div>
        
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="input-base w-full bg-background text-foreground"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Date & Time Format */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Date & Time Format</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="input-base w-full bg-background text-foreground"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Time Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFormat("12h")}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  timeFormat === "12h" 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:bg-accent"
                }`}
              >
                12-hour
              </button>
              <button
                onClick={() => setTimeFormat("24h")}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  timeFormat === "24h" 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:bg-accent"
                }`}
              >
                24-hour
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-border mt-8">
        <button className="btn-ghost py-2 px-4 w-full sm:w-auto">Cancel</button>
        <button className="btn-primary py-2 px-6 w-full sm:w-auto inline-flex items-center justify-center gap-2">
          <Save className="h-4 w-4 flex-shrink-0" /> Save Changes
        </button>
      </div>
    </div>
  );
}
