import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PresentationForm } from "../components/presentation-form";
import { PresentationPreview } from "../components/presentation-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Presentation Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning presentations instantly with AI-powered content generation, professional themes, and data visualization
          </p>
          <div className="flex gap-2 justify-center text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> AI Content
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Smart Layout
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Data Viz
            </span>
          </div>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="create">Create Presentation</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle>Create New Presentation</CardTitle>
              </CardHeader>
              <CardContent>
                <PresentationForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preview">
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PresentationPreview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
