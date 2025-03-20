import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "./ui/Form";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { ThemeSelector } from "./ThemeSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { useToast } from "../hooks/use-toast";
import { useState, useRef } from "react";
import { Loader2, Upload, FileText, ChartBar, BarChart, LineChart, PieChart, ScatterChart, Users, FileType } from "lucide-react";
import { usePresentation } from "../contexts/PresentationContext";

// Custom Toggle Switch component
const CustomToggle = ({ checked, onCheckedChange }) => {
  return (
    <div 
      className="relative inline-block w-[60px] h-[30px] cursor-pointer"
      onClick={() => onCheckedChange(!checked)}
    >
      <div 
        className="absolute inset-0 rounded-full bg-black transition-all duration-300 ease-in-out"
      />
      <div 
        className={`absolute w-[25px] h-[25px] bg-white rounded-full top-[2.5px] transition-all duration-300 ease-in-out ${
          checked ? 'left-[32.5px]' : 'left-[2.5px]'
        }`}
      />
    </div>
  );
};

export function PresentationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const { startCollaboration, stopCollaboration, isCollaborating } = usePresentation();

  const form = useForm({
    defaultValues: {
      topic: "",
      theme: "corporate",
      variant: "professional",
      language: "en",
      includeImages: true,
      summarize: false,
      chartType: undefined,
      exportFormat: "pptx",
    },
  });

  async function onSubmit(data) {
    setIsSubmitting(true);
    setDownloadUrl(null);
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (fileInputRef.current?.files?.[0]) {
      formData.append("textFile", fileInputRef.current.files[0]);
    }
    if (csvInputRef.current?.files?.[0]) {
      formData.append("csvFile", csvInputRef.current.files[0]);
    }

    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate presentation");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      const exportFormat = data.exportFormat;
      let message;
      if (exportFormat === "pptx") {
        message = "Your PowerPoint presentation is ready. Click the download link below.";
      } else if (exportFormat === "pdf") {
        message = "Your presentation has been generated as a .pptx file. Please convert it to PDF using PowerPoint or an online tool.";
      } else if (exportFormat === "google_slides") {
        message = "Your presentation has been generated as a .pptx file. Please upload it to Google Slides (File > Import).";
      }

      toast({
        title: "Success!",
        description: message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      const topic = form.getValues("topic").trim();
      const filename = topic ? `${topic}.pptx` : "presentation.pptx"; // Always .pptx since backend only generates PPTX
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvUploaded(true);
      form.setValue("chartType", "bar");
      toast({
        title: "Data uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  const handleTextUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Content uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Presentation Topic</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your presentation topic or title" 
                  className="focus:ring-2 focus:ring-primary/20" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Let AI create a compelling presentation about your topic
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-primary/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Upload Content
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-primary/5 transition-colors"
                onClick={() => csvInputRef.current?.click()}
              >
                <ChartBar className="w-4 h-4 mr-2 text-primary" />
                Upload Data
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt,.md"
              onChange={handleTextUpload}
            />
            <input
              type="file"
              ref={csvInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleCsvUpload}
            />
            <p className="text-xs text-muted-foreground text-center">
              Support for TXT, MD, and CSV files
            </p>
          </div>

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full max-w-[200px] bg-white z-50">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Theme & Style</FormLabel>
              <ThemeSelector
                value={field.value}
                variant={form.watch("variant")}
                onChange={field.onChange}
                onVariantChange={(variant) => form.setValue("variant", variant)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {csvUploaded && (
          <FormField
            control={form.control}
            name="chartType"
            render={({ field }) => (
              <FormItem className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <FormLabel className="font-medium">Chart Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full max-w-[200px] bg-white z-50">
                    <SelectItem value="bar">
                      <div className="flex items-center">
                        <BarChart className="w-4 h-4 mr-2 text-blue-500" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center">
                        <LineChart className="w-4 h-4 mr-2 text-green-500" />
                        Line Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center">
                        <PieChart className="w-4 h-4 mr-2 text-orange-500" />
                        Pie Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="scatter">
                      <div className="flex items-center">
                        <ScatterChart className="w-4 h-4 mr-2 text-purple-500" />
                        Scatter Plot
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose how to visualize your uploaded data
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="includeImages"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4 shadow-sm">
                <div>
                  <FormLabel className="font-medium">AI-Generated Images</FormLabel>
                  <FormDescription>Add relevant visuals to your slides</FormDescription>
                </div>
                <FormControl>
                  <CustomToggle
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summarize"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4 shadow-sm">
                <div>
                  <FormLabel className="font-medium">Smart Summarization</FormLabel>
                  <FormDescription>Condense content for better impact</FormDescription>
                </div>
                <FormControl>
                  <CustomToggle
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between space-y-0 rounded-lg border p-4 shadow-sm col-span-2 md:col-span-1">
            <div>
              <FormLabel className="font-medium">Real-time Collaboration</FormLabel>
              <FormDescription>Work together in real-time</FormDescription>
            </div>
            <Button
              type="button"
              variant={isCollaborating ? "destructive" : "outline"}
              className={isCollaborating ? "bg-red-500 hover:bg-red-600" : "border-primary text-primary hover:bg-primary/5"}
              onClick={() => {
                if (isCollaborating) {
                  stopCollaboration();
                  toast({
                    title: "Collaboration ended",
                    description: "You've left the collaboration session.",
                  });
                } else {
                  startCollaboration();
                  toast({
                    title: "Collaboration started",
                    description: "Share the URL with others to collaborate.",
                  });
                }
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              {isCollaborating ? "Stop Sharing" : "Start Sharing"}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="exportFormat"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel className="font-medium">Export Format</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select export format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full max-w-[200px] bg-white z-50">
                    <SelectItem value="pptx">PowerPoint (.pptx)</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="google_slides">Google Slides</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating your presentation...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Generate Presentation
            </>
          )}
        </Button>

        {downloadUrl && (
          <Button
            type="button"
            variant="link"
            className="w-full text-primary hover:text-primary/80 transition-colors"
            onClick={handleDownload}
          >
            <FileType className="w-4 h-4 mr-2" />
            Download Presentation
          </Button>
        )}
      </form>
    </Form>
  );
}