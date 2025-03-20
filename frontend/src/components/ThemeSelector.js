import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Label } from "./ui/Label";
import { cn } from "../lib/utils";
import { THEMES } from "../lib/themes";

export function ThemeSelector({ value, variant, onChange, onVariantChange }) {
  const themes = [
    { id: "corporate", name: "Corporate", description: "Sleek and professional for business" },
    { id: "creative", name: "Creative", description: "Vibrant and dynamic for innovation" },
    { id: "minimal", name: "Minimal", description: "Clean and simple for clarity" },
    { id: "bold", name: "Bold", description: "Strong and impactful for emphasis" },
  ];

  const variants = [
    { id: "professional", name: "Professional", description: "Clean and structured layout" },
    { id: "creative", name: "Creative", description: "Dynamic and expressive design" },
    { id: "minimal", name: "Minimal", description: "Simple and uncluttered presentation" },
  ];

  // Get the current theme's colors
  const themeColors = value ? THEMES[value] : THEMES.corporate;
  const gradientStyle = themeColors ? 
    `linear-gradient(135deg, ${themeColors.gradientStart}, ${themeColors.gradientEnd})` : 
    "linear-gradient(135deg, #003366, #ADD8E6)";

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="theme">Presentation Theme</Label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                value === theme.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              )}
              onClick={() => onChange(theme.id)}
            >
              <div 
                className="w-full h-8 rounded-md mb-2 ring-1 ring-inset ring-black/10"
                style={{
                  background: theme.id === "corporate" ? "linear-gradient(135deg, #003366, #ADD8E6)" :
                            theme.id === "creative" ? "linear-gradient(135deg, #9370DB, #FFB6C1)" :
                            theme.id === "minimal" ? "linear-gradient(135deg, #F5F5F5, #FFFFFF)" :
                            "linear-gradient(135deg, #FF4500, #FFD700)"
                }}
              ></div>
              <span className="font-medium text-sm">{theme.name}</span>
              <span className="text-xs text-gray-500 text-center mt-1">{theme.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="variant">Style Variant</Label>
        <div className="grid grid-cols-3 gap-2">
          {variants.map((v) => (
            <div
              key={v.id}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                variant === v.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              )}
              onClick={() => onVariantChange(v.id)}
            >
              <div className="flex justify-center items-center mb-2">
                {v.id === "professional" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="8" x2="16" y1="12" y2="12" />
                    <line x1="8" x2="16" y1="8" y2="8" />
                    <line x1="8" x2="16" y1="16" y2="16" />
                  </svg>
                ) : v.id === "creative" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                    <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                    <path d="M19 11h2m-1 -1v2" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                    <line x1="3" x2="21" y1="6" y2="6" />
                    <line x1="3" x2="16" y1="12" y2="12" />
                    <line x1="3" x2="12" y1="18" y2="18" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-sm">{v.name}</span>
              <span className="text-xs text-gray-500 text-center">{v.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div 
        className="p-3 rounded-lg border mt-2 bg-gradient-to-br from-gray-50 to-white"
        style={{ backgroundImage: value === 'minimal' ? 'none' : null }}
      >
        <div className="text-sm text-gray-600">
          <span className="font-medium">Preview:</span> {themes.find(t => t.id === value)?.name || "Theme"} + 
          <span className="font-medium"> {variants.find(v => v.id === variant)?.name || "Variant"}</span>
        </div>
        <div 
          className="h-8 w-full mt-2 rounded-md"
          style={{ background: gradientStyle }}
        ></div>
      </div>
    </div>
  );
}