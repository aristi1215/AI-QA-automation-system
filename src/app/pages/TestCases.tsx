import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { getTestCases, createTestCase, updateTestCase, deleteTestCase, generateAIResponse } from "../lib/api";
import { Plus, Play, Edit, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const AI_MODELS = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

export function TestCases() {
  const [testCases, setTestCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    expectedOutput: "",
    model: "gpt-3.5-turbo",
  });

  useEffect(() => {
    loadTestCases();
  }, []);

  async function loadTestCases() {
    try {
      setLoading(true);
      const cases = await getTestCases();
      setTestCases(cases);
    } catch (error: any) {
      console.error("Error loading test cases:", error);
      toast.error(error.message || "Failed to load test cases");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingCase(null);
    setFormData({
      name: "",
      prompt: "",
      expectedOutput: "",
      model: "gpt-3.5-turbo",
    });
    setDialogOpen(true);
  }

  function openEditDialog(testCase: any) {
    setEditingCase(testCase);
    setFormData({
      name: testCase.name,
      prompt: testCase.prompt,
      expectedOutput: testCase.expectedOutput,
      model: testCase.model || "gpt-3.5-turbo",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.name || !formData.prompt) {
      toast.error("Name and prompt are required");
      return;
    }

    try {
      if (editingCase) {
        await updateTestCase(editingCase.id, formData);
        toast.success("Test case updated");
      } else {
        await createTestCase(formData);
        toast.success("Test case created");
      }
      
      setDialogOpen(false);
      loadTestCases();
    } catch (error: any) {
      console.error("Error saving test case:", error);
      toast.error(error.message || "Failed to save test case");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this test case?")) {
      return;
    }

    try {
      await deleteTestCase(id);
      toast.success("Test case deleted");
      loadTestCases();
    } catch (error: any) {
      console.error("Error deleting test case:", error);
      toast.error(error.message || "Failed to delete test case");
    }
  }

  async function handleRunTest(testCase: any) {
    try {
      setRunningTests(new Set(runningTests).add(testCase.id));
      
      const result = await generateAIResponse(testCase.prompt, testCase.model || "gpt-3.5-turbo");
      
      // Update test case with last run result
      await updateTestCase(testCase.id, {
        ...testCase,
        lastRun: {
          timestamp: new Date().toISOString(),
          actualOutput: result.response,
          passed: result.response.toLowerCase().includes(testCase.expectedOutput.toLowerCase()),
        },
      });
      
      toast.success("Test case executed");
      loadTestCases();
    } catch (error: any) {
      console.error("Error running test:", error);
      toast.error(error.message || "Failed to run test case");
    } finally {
      setRunningTests((prev) => {
        const next = new Set(prev);
        next.delete(testCase.id);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#394273]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#152340] via-[#394273] to-[#5F6873] bg-clip-text text-transparent">Test Cases</h2>
          <p className="text-[#5F6873] mt-1 font-medium">Create and manage predefined test cases</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-[#394273] to-[#5F6873] hover:from-[#2d3559] hover:to-[#4a5464] text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Test Case
        </Button>
      </div>

      {testCases.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#394273]/10 to-[#5F6873]/10 flex items-center justify-center">
              <Play className="w-8 h-8 text-[#394273]" />
            </div>
            <h3 className="text-lg font-semibold text-[#152340] mb-2">No test cases yet</h3>
            <p className="text-[#5F6873] mb-6">Create your first test case to get started with automated testing</p>
            <Button 
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-[#394273] to-[#5F6873] hover:from-[#2d3559] hover:to-[#4a5464] text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Test Case
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testCases.map((testCase) => (
            <Card key={testCase.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#394273]/5 to-transparent pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-[#152340] truncate pr-2">{testCase.name}</CardTitle>
                    <CardDescription className="mt-1.5 text-xs font-medium">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#394273]/10 text-[#394273]">
                        {AI_MODELS.find(m => m.value === testCase.model)?.label || testCase.model}
                      </span>
                    </CardDescription>
                  </div>
                  {testCase.lastRun && (
                    <Badge 
                      variant={testCase.lastRun.passed ? "default" : "destructive"}
                      className={testCase.lastRun.passed 
                        ? "bg-green-600 hover:bg-green-700 shadow-md" 
                        : "bg-red-600 hover:bg-red-700 shadow-md"
                      }
                    >
                      {testCase.lastRun.passed ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Pass
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Fail
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#152340] uppercase tracking-wide">Prompt:</p>
                  <div className="text-sm text-[#5F6873] line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {testCase.prompt}
                  </div>
                </div>
                
                {testCase.expectedOutput && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#152340] uppercase tracking-wide">Expected:</p>
                    <div className="text-sm text-[#5F6873] line-clamp-2 bg-green-50 p-3 rounded-lg border border-green-100">
                      {testCase.expectedOutput}
                    </div>
                  </div>
                )}

                {testCase.lastRun && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-[#5F6873]">
                      <div className={`w-2 h-2 rounded-full ${testCase.lastRun.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium">Last run: {new Date(testCase.lastRun.timestamp).toLocaleString()}</span>
                    </div>
                    {testCase.lastRun.actualOutput && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-[#394273] font-semibold hover:underline">View output</summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 text-[#5F6873] max-h-32 overflow-y-auto">
                          {testCase.lastRun.actualOutput}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleRunTest(testCase)}
                    disabled={runningTests.has(testCase.id)}
                    className="flex-1 bg-gradient-to-r from-[#394273] to-[#5F6873] hover:from-[#2d3559] hover:to-[#4a5464] text-white shadow-md"
                  >
                    {runningTests.has(testCase.id) ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1.5" />
                        Run Test
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(testCase)}
                    className="border-[#394273]/30 text-[#394273] hover:bg-[#394273] hover:text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(testCase.id)}
                    className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#152340]">{editingCase ? "Edit Test Case" : "Create Test Case"}</DialogTitle>
            <DialogDescription className="text-[#5F6873]">
              Define a test case with expected output criteria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="case-name" className="text-[#152340]">Test Case Name *</Label>
              <Input
                id="case-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Test customer service response"
                className="border-gray-200 focus:border-[#394273] focus:ring-[#394273]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="case-model" className="text-[#152340]">AI Model</Label>
              <Select value={formData.model} onValueChange={(val) => setFormData({ ...formData, model: val })}>
                <SelectTrigger id="case-model" className="border-gray-200 focus:border-[#394273] focus:ring-[#394273]">
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

            <div className="space-y-2">
              <Label htmlFor="case-prompt" className="text-[#152340]">Prompt *</Label>
              <Textarea
                id="case-prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Enter the test prompt"
                rows={4}
                className="border-gray-200 focus:border-[#394273] focus:ring-[#394273]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="case-expected" className="text-[#152340]">Expected Output Description</Label>
              <Textarea
                id="case-expected"
                value={formData.expectedOutput}
                onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                placeholder="Describe what the ideal output should contain or how it should behave"
                rows={3}
                className="border-gray-200 focus:border-[#394273] focus:ring-[#394273]"
              />
              <p className="text-xs text-[#5F6873] mt-1">The test will pass if the actual output contains this text</p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name || !formData.prompt}
              className="bg-gradient-to-r from-[#394273] to-[#5F6873] hover:from-[#2d3559] hover:to-[#4a5464] text-white shadow-lg"
            >
              {editingCase ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}