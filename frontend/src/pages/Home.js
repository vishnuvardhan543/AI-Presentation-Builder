import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PresentationForm } from "../components/presentation-form";
import { PresentationPreview } from "../components/presentation-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { RocketIcon, SparklesIcon, LightbulbIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <div className="inline-block p-2 bg-primary/10 rounded-full animate-pulse mb-2">
            <RocketIcon className="h-6 w-6 text-primary" />
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-black">
            AI Presentation Builder
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning presentations instantly with AI-powered content generation, professional themes, and data visualization
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border">
              <span className="w-2 h-2 rounded-full bg-green-500" /> AI Content
            </span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Smart Layout
            </span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Data Viz
            </span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border">
              <SparklesIcon className="w-3 h-3 text-amber-500" /> AI Theming
            </span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border">
              <LightbulbIcon className="w-3 h-3 text-cyan-500" /> Smart Ideas
            </span>
          </div>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-sm rounded-full overflow-hidden">
            <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full py-2.5">
              Create Presentation
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full py-2.5">
              Live Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-6">
            <Card className="border shadow-md overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Create New Presentation</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PresentationForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <Card className="border shadow-md overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PresentationPreview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>Create professional presentations in minutes, not hours</p>
        </div>
      </div>
    </div>
  );
}