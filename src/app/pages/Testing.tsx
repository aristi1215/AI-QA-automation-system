import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { generateAIResponse, createSession, createBug } from "../lib/api";
import { Loader2, Send, CheckCircle, AlertCircle, XCircle, Flag } from "lucide-react";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

const AI_MODELS = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

const CATEGORIES = [
  { value: "hallucination", label: "Hallucination" },
  { value: "incorrect", label: "Incorrect Output" },
  { value: "toxic", label: "Toxic Content" },
  { value: "formatting", label: "Formatting Issue" },
  { value: "other", label: "Other" },
];

export function Testing() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluated, setEvaluated] = useState(false);
  
  // Evaluation state
  const [ratings, setRatings] = useState({
    accuracy: 3,
    coherence: 3,
    relevance: 3,
    creativity: 3,
    safety: 3,
  });
  const [status, setStatus] = useState<"acceptable" | "needs-improvement" | "failed" | null>(null);
  const [comments, setComments] = useState("");
  
  // Bug report dialog
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const [bugForm, setBugForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "hallucination",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
  });

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setLoading(true);
      setResponse("");
      setEvaluated(false);
      setStatus(null);
      setComments("");
      
      const data = await generateAIResponse(prompt, model);
      setResponse(data.response);
      toast.success("Response generated successfully");
    } catch (error: any) {
      console.error("Error generating response:", error);
      toast.error(error.message || "Failed to generate response");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEvaluation() {
    try {
      const sessionData = {
        prompt,
        response,
        model,
        evaluation: {
          ratings,
          status,
          comments,
        },
      };
      
      await createSession(sessionData);
      setEvaluated(true);
      toast.success("Evaluation saved successfully");
    } catch (error: any) {
      console.error("Error saving evaluation:", error);
      toast.error(error.message || "Failed to save evaluation");
    }
  }

  async function handleReportBug() {
    try {
      const bugData = {
        ...bugForm,
        sessionData: {
          prompt,
          response,
          model,
        },
      };
      
      await createBug(bugData);
      setBugDialogOpen(false);
      setBugForm({
        title: "",
        description: "",
        severity: "medium",
        category: "hallucination",
        stepsToReproduce: "",
        expectedBehavior: "",
        actualBehavior: "",
      });
      toast.success("Bug reported successfully");
    } catch (error: any) {
      console.error("Error reporting bug:", error);
      toast.error(error.message || "Failed to report bug");
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Prompt Input Section */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#394273]/5 to-transparent">
          <CardTitle className="text-[#152340]">Prompt Testing Interface</CardTitle>
          <CardDescription className="text-[#5F6873]">Enter a prompt to test AI response quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-[1fr,auto]">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-[#152340]">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your test prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none border-gray-200 focus:border-[#394273] focus:ring-[#394273]"
              />
            </div>
            
            <div className="space-y-2 md:w-48">
              <Label htmlFor="model" className="text-[#152340]">AI Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model" className="border-gray-200 focus:border-[#394273] focus:ring-[#394273]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-[#394273] to-[#5F6873] hover:from-[#2d3559] hover:to-[#4a5464] text-white shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Response
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Response Section */}
      {(response || loading) && (
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#394273]/5 to-transparent">
            <CardTitle className="text-[#152340]">AI Response</CardTitle>
            <CardDescription className="text-[#5F6873]">Generated output from {model}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#394273]" />
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 whitespace-pre-wrap text-[#152340]">
                {response}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evaluation Section */}
      {response && !loading && (
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#394273]/5 to-transparent">
            <CardTitle className="text-[#152340]">Evaluation Panel</CardTitle>
            <CardDescription className="text-[#5F6873]">Rate the AI response quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Rating Sliders */}
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(ratings).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize text-[#152340]">{key}</Label>
                    <span className="text-sm font-bold text-[#394273] bg-[#394273]/10 px-2 py-1 rounded">{value}/5</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(vals) => setRatings({ ...ratings, [key]: vals[0] })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-[#394273] [&_[role=slider]]:border-[#394273]"
                  />
                </div>
              ))}
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label className="text-[#152340]">Status</Label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={status === "acceptable" ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 transition-all",
                    status === "acceptable" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "hover:bg-green-50 hover:border-green-600"
                  )}
                  onClick={() => setStatus("acceptable")}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Acceptable
                </Badge>
                <Badge
                  variant={status === "needs-improvement" ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 transition-all",
                    status === "needs-improvement" 
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                      : "hover:bg-yellow-50 hover:border-yellow-600"
                  )}
                  onClick={() => setStatus("needs-improvement")}
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Needs Improvement
                </Badge>
                <Badge
                  variant={status === "failed" ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 transition-all",
                    status === "failed" 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "hover:bg-red-50 hover:border-red-600"
                  )}
                  onClick={() => setStatus("failed")}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Failed
                </Badge>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-[#152340]">Comments / Annotations</Label>
              <Textarea
                id="comments"
                placeholder="Add any additional notes or observations..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="border-gray-200 focus:border-[#394273] focus:ring-[#394273]"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleSaveEvaluation} 
                disabled={!status}
                className="bg-gradient-to-r from-[#394273] to-[#5F6873] hover:from-[#2d3559] hover:to-[#4a5464] text-white shadow-lg"
              >
                Save Evaluation
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setBugDialogOpen(true)}
                className="shadow-md"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </div>

            {evaluated && (
              <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg text-green-800 text-sm font-medium">
                ✓ Evaluation saved successfully
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bug Report Dialog */}
      <Dialog open={bugDialogOpen} onOpenChange={setBugDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Bug</DialogTitle>
            <DialogDescription>
              Create a structured bug report for this AI response
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bug-title">Title *</Label>
              <Input
                id="bug-title"
                value={bugForm.title}
                onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                placeholder="Brief summary of the issue"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bug-severity">Severity</Label>
                <Select value={bugForm.severity} onValueChange={(val) => setBugForm({ ...bugForm, severity: val })}>
                  <SelectTrigger id="bug-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bug-category">Category</Label>
                <Select value={bugForm.category} onValueChange={(val) => setBugForm({ ...bugForm, category: val })}>
                  <SelectTrigger id="bug-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-description">Description *</Label>
              <Textarea
                id="bug-description"
                value={bugForm.description}
                onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                placeholder="Detailed description of the issue"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-steps">Steps to Reproduce</Label>
              <Textarea
                id="bug-steps"
                value={bugForm.stepsToReproduce}
                onChange={(e) => setBugForm({ ...bugForm, stepsToReproduce: e.target.value })}
                placeholder="1. Enter prompt...&#10;2. Click generate...&#10;3. Observe response..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-expected">Expected Behavior</Label>
              <Textarea
                id="bug-expected"
                value={bugForm.expectedBehavior}
                onChange={(e) => setBugForm({ ...bugForm, expectedBehavior: e.target.value })}
                placeholder="What should have happened"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-actual">Actual Behavior</Label>
              <Textarea
                id="bug-actual"
                value={bugForm.actualBehavior}
                onChange={(e) => setBugForm({ ...bugForm, actualBehavior: e.target.value })}
                placeholder="What actually happened"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBugDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReportBug}
              disabled={!bugForm.title || !bugForm.description}
            >
              Submit Bug Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}