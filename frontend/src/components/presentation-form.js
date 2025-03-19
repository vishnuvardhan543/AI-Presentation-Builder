import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPresentationSchema } from "../shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "./ui/Form";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { ThemeSelector } from "./ThemeSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Switch } from "./ui/Switch";
import { useToast } from "../hooks/use-toast";
import { useState, useRef } from "react";
import { Loader2, Upload, FileText, ChartBar, BarChart, LineChart, PieChart, ScatterChart, Users, FileType } from "lucide-react";
import { usePresentation } from "../contexts/PresentationContext";

export function PresentationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const { startCollaboration, stopCollaboration, isCollaborating } = usePresentation();

  const form = useForm({
    resolver: zodResolver(insertPresentationSchema),
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
    setDownloadUrl(null); // Reset previous download URL
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
      setDownloadUrl(url); // Store the URL for later download

      toast({
        title: "Success!",
        description: "Your presentation has been generated. Click the download link below.",
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
      const filename = form.getValues("topic").trim() 
        ? `${form.getValues("topic")}.pptx` 
        : "presentation.pptx";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Optionally revoke URL after download
      // window.URL.revokeObjectURL(downloadUrl);
      // setDownloadUrl(null);
    }
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvUploaded(true);
      form.setValue("chartType", "bar");
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
              <FormLabel>Presentation Topic</FormLabel>
              <FormControl>
                <Input placeholder="Enter your presentation topic or title" {...field} />
              </FormControl>
              <FormDescription>
                Let AI create a compelling presentation about your topic
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Upload Content
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => csvInputRef.current?.click()}
              >
                <ChartBar className="w-4 h-4 mr-2" />
                Upload Data
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt,.md"
            />
            <input
              type="file"
              ref={csvInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleCsvUpload}
            />
          </div>

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
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
              <FormLabel>Theme</FormLabel>
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
              <FormItem>
                <FormLabel>Chart Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="bar">
                      <div className="flex items-center">
                        <BarChart className="w-4 h-4 mr-2" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center">
                        <LineChart className="w-4 h-4 mr-2" />
                        Line Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center">
                        <PieChart className="w-4 h-4 mr-2" />
                        Pie Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="scatter">
                      <div className="flex items-center">
                        <ScatterChart className="w-4 h-4 mr-2" />
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
              <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                <div>
                  <FormLabel>AI-Generated Images</FormLabel>
                  <FormDescription>Add relevant visuals to your slides</FormDescription>
                </div>
                <FormControl>
                  <Switch
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
              <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                <div>
                  <FormLabel>Smart Summarization</FormLabel>
                  <FormDescription>Condense content for better impact</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
            <div>
              <FormLabel>Real-time Collaboration</FormLabel>
              <FormDescription>Work together in real-time</FormDescription>
            </div>
            <Button
              type="button"
              variant={isCollaborating ? "destructive" : "outline"}
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
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
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
            className="w-full"
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