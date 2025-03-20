import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PresentationForm } from "../components/presentation-form";
import { PresentationPreview } from "../components/presentation-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { RocketIcon, SparklesIcon, LightbulbIcon, PresentationIcon, StarIcon, TrendingUpIcon } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";

export default function Home() {
  // Create a form instance that will be shared between tabs
  const form = useForm({
    defaultValues: {
      theme: "corporate",
      variant: "professional",
      topic: "My Presentation",
      includeImages: true,
      language: "en",
      exportFormat: "pptx",
      slideCount: 5,
      summarize: false,
      chartType: "bar"
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-2 animate-bounce">
            <PresentationIcon className="h-6 w-6 text-primary" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 text-black bg-clip-text">
            AI Presentation Builder
          </h1>


          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning presentations in seconds with AI-powered content generation
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            <span className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-primary/10 transition-all hover:shadow-md hover:scale-105">
              <StarIcon className="w-3 h-3 text-amber-500" /> AI Content
            </span>
            <span className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-primary/10 transition-all hover:shadow-md hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Smart Layout
            </span>
            <span className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-primary/10 transition-all hover:shadow-md hover:scale-105">
              <TrendingUpIcon className="w-3 h-3 text-purple-500" /> Data Viz
            </span>
            <span className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-primary/10 transition-all hover:shadow-md hover:scale-105">
              <SparklesIcon className="w-3 h-3 text-amber-500" /> AI Theming
            </span>
            <span className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-primary/10 transition-all hover:shadow-md hover:scale-105">
              <LightbulbIcon className="w-3 h-3 text-cyan-500" /> Smart Ideas
            </span>
          </div>
        </div>

        <FormProvider {...form}>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-sm rounded-full overflow-hidden border">
              <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full py-2.5 transition-all">
                Create Presentation
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full py-2.5 transition-all">
                Live Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6">
              <Card className="border shadow-md overflow-hidden bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gray-50/80 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <RocketIcon className="h-5 w-5 text-primary" />
                    Create New Presentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <PresentationForm formContext={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card className="border shadow-md overflow-hidden bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gray-50/80 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-primary" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <PresentationPreview />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </FormProvider>

        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>Create professional presentations in minutes, not hours</p>
        </div>
      </div>
    </div>
  );
}