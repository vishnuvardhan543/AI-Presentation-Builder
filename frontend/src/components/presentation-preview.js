import { Card, CardContent } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { THEMES } from "../lib/themes";

export function PresentationPreview() {
  // Create a default useState to avoid FormContext errors
  const [formValues, setFormValues] = useState({
    theme: "corporate",
    variant: "professional",
    topic: "My Presentation",
    includeImages: true
  });

  // Try to use form context if available
  const formContext = useFormContext();
  
  // If form context exists, watch for changes
  useEffect(() => {
    if (formContext) {
      const subscription = formContext.watch((value) => {
        setFormValues({
          theme: value.theme || "corporate",
          variant: value.variant || "professional",
          topic: value.topic || "My Presentation",
          includeImages: value.includeImages !== undefined ? value.includeImages : true
        });
      });
      
      return () => subscription.unsubscribe();
    }
  }, [formContext]);
  
  // State for theme colors
  const [themeColors, setThemeColors] = useState({
    gradient: "linear-gradient(135deg, #0033CC, #ADD8E6)",
    titleColor: "#FFFFFF",
    textColor: "#FFFFFF",
    accentColor: "#FFD700",
  });
  
  // Update theme colors when theme changes
  useEffect(() => {
    if (formValues.theme && THEMES[formValues.theme]) {
      const themeData = THEMES[formValues.theme];
      setThemeColors({
        gradient: `linear-gradient(135deg, ${hexToRgb(themeData.gradientStart)}, ${hexToRgb(themeData.gradientEnd)})`,
        titleColor: hexToRgb(themeData.titleColor),
        textColor: hexToRgb(themeData.textColor),
        accentColor: hexToRgb(themeData.accentColor),
      });
    }
  }, [formValues.theme, formValues.variant]);

  // Helper to convert hex to rgb
  function hexToRgb(hex) {
    return hex || "#000000";
  }

  return (
    <div className="space-y-8">
      {/* Title Slide Preview */}
      <div className="aspect-video rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div 
          className="h-full flex flex-col items-center justify-center p-8"
          style={{ background: themeColors.gradient }}
        >
          <h2 
            className="text-2xl font-bold mb-4 text-center"
            style={{ color: themeColors.titleColor }}
          >
            {formValues.topic}
          </h2>
          <p 
            className="text-sm opacity-90"
            style={{ color: themeColors.textColor }}
          >
            Powered by AI
          </p>
        </div>
      </div>

      {/* Content Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Slide */}
        <div className="aspect-video rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div 
            className="h-full p-6"
            style={{ background: themeColors.gradient }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: themeColors.titleColor }}
            >
              Key Concepts
            </h3>
            <div 
              className="space-y-2"
              style={{ color: themeColors.textColor }}
            >
              <p className="text-sm">The main concepts and ideas will appear here in paragraph form, adjusted to the selected theme and variant style.</p>
              <p className="text-sm">Additional content provides depth and context to your presentation topic.</p>
            </div>
          </div>
        </div>

        {/* Image and Text Slide */}
        <div className="aspect-video rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div 
            className="h-full p-6"
            style={{ background: themeColors.gradient }}
          >
            <div className="grid grid-cols-2 gap-4 h-full">
              <div>
                <h3 
                  className="text-lg font-semibold mb-3"
                  style={{ color: themeColors.titleColor }}
                >
                  Visual Examples
                </h3>
                <div 
                  className="text-sm space-y-2"
                  style={{ color: themeColors.textColor }}
                >
                  <p>Your content will be enhanced with relevant visuals.</p>
                  {!formValues.includeImages && (
                    <p className="text-xs opacity-70 italic">Enable images for visual slides</p>
                  )}
                </div>
              </div>
              {formValues.includeImages ? (
                <div className="bg-white/20 rounded-md backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center p-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-70" style={{ color: themeColors.textColor }}>
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span 
                      className="text-xs"
                      style={{ color: themeColors.textColor }}
                    >
                      AI-generated image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="opacity-0">No image</div>
              )}
            </div>
          </div>
        </div>

        {/* Bullet Points Slide */}
        <div className="aspect-video rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div 
            className="h-full p-6"
            style={{ background: themeColors.gradient }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: themeColors.titleColor }}
            >
              Key Points
            </h3>
            <div 
              className="space-y-3"
              style={{ color: themeColors.textColor }}
            >
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div 
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: themeColors.accentColor }}
                  />
                  <p className="text-sm">Bullet point {i+1} highlighting important information about your topic</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Visualization Slide */}
        <div className="aspect-video rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div 
            className="h-full p-6"
            style={{ background: themeColors.gradient }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: themeColors.titleColor }}
            >
              Data Insights
            </h3>
            <div className="flex items-center justify-center h-[calc(100%-2rem)]">
              <div 
                className="bg-white/20 backdrop-blur-sm rounded-md p-4 w-full h-32 flex items-center justify-center"
              >
                <div className="text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-70" style={{ color: themeColors.textColor }}>
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                  </svg>
                  <span 
                    className="text-xs"
                    style={{ color: themeColors.textColor }}
                  >
                    Data visualization from uploaded CSV
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
