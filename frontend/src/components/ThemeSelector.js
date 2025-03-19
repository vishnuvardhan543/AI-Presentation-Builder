import { Card, CardContent } from "./ui/Card";
import { cn } from "../lib/utils";
import { Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Label } from "./ui/Label";

export function ThemeSelector({ value, variant, onChange, onVariantChange }) {
  const themes = [
    {
      id: "corporate",
      name: "Corporate",
      preview: "bg-gradient-to-br from-blue-500 to-blue-700",
      description: "Professional style for business presentations",
    },
    {
      id: "creative",
      name: "Creative",
      preview: "bg-gradient-to-br from-purple-500 to-pink-500",
      description: "Dynamic design for innovative content",
    },
    {
      id: "minimal",
      name: "Minimal",
      preview: "bg-gradient-to-br from-gray-100 to-gray-300",
      description: "Clean and simple design focus",
    },
    {
      id: "bold",
      name: "Bold",
      preview: "bg-gradient-to-br from-red-500 to-orange-500",
      description: "High-impact design for strong messages",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-105",
              value === theme.id && "ring-2 ring-primary"
            )}
            onClick={() => onChange(theme.id)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <div className={cn("h-24 rounded-md", theme.preview)} />
                {value === theme.id && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{theme.name}</p>
                <p className="text-sm text-muted-foreground">{theme.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Theme Variant</Label>
        <Select value={variant} onValueChange={onVariantChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select variant" />
          </SelectTrigger>
          <SelectContent className="bg-white">
          <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="tint">Tint</SelectItem>
            <SelectItem value="vibrant">Vibrant</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
