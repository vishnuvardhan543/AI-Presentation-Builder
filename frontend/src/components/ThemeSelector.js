import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Label } from "./ui/Label";
import { cn } from "../lib/utils";

export function ThemeSelector({ value, variant, onChange, onVariantChange }) {
  const themes = [
    { id: "corporate", name: "Corporate", description: "Sleek and professional for business" },
    { id: "creative", name: "Creative", description: "Vibrant and dynamic for innovation" },
    { id: "minimal", name: "Minimal", description: "Clean and simple elegance" },
    { id: "bold", name: "Bold", description: "Striking and high-impact" },
  ];

  const variants = [
    { id: "professional", name: "Professional", description: "Clean and structured layout" },
    { id: "creative", name: "Creative", description: "Dynamic and expressive design" },
    { id: "minimal", name: "Minimal", description: "Simple and uncluttered presentation" },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="theme-select">Presentation Theme</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="theme-select" className="w-full bg-white">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent className="w-full max-w-[350px] bg-white z-50">
              {themes.map((theme) => (
                <SelectItem 
                  key={theme.id} 
                  value={theme.id} 
                  className="focus:bg-gray-100 focus:text-gray-900"
                >
                  <div className="flex flex-col py-1">
                    <span className="font-medium">{theme.name}</span>
                    <span className="text-xs text-gray-500">{theme.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant-select">Style Variant</Label>
          <Select value={variant} onValueChange={onVariantChange}>
            <SelectTrigger id="variant-select" className="w-full bg-white">
              <SelectValue placeholder="Select a variant" />
            </SelectTrigger>
            <SelectContent className="w-full max-w-[350px] bg-white z-50">
              {variants.map((item) => (
                <SelectItem 
                  key={item.id} 
                  value={item.id}
                  className="focus:bg-gray-100 focus:text-gray-900"
                >
                  <div className="flex flex-col py-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={cn(
        "mt-4 p-4 rounded-md border",
        value === "corporate" && "bg-blue-50 border-blue-200",
        value === "creative" && "bg-purple-50 border-purple-200",
        value === "minimal" && "bg-gray-50 border-gray-200",
        value === "bold" && "bg-orange-50 border-orange-200"
      )}>
        <div className="text-sm text-gray-600">
          Preview: <span className="font-medium">{themes.find(t => t.id === value)?.name || "Theme"}</span> + 
          <span className="font-medium"> {variants.find(v => v.id === variant)?.name || "Variant"}</span>
        </div>
      </div>
    </div>
  );
}