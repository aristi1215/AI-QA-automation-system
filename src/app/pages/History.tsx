import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { getSessions, updateSession, deleteSession } from "../lib/api";
import { Search, Loader2, Trash2, CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Textarea } from "../components/ui/textarea";

export function History() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [editingEvaluation, setEditingEvaluation] = useState(false);
  const [evaluationData, setEvaluationData] = useState<any>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery]);

  async function loadSessions() {
    try {
      setLoading(true);
      const data = await getSessions();
      setSessions(data);
    } catch (error: any) {
      console.error("Error loading sessions:", error);
      toast.error(error.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  function filterSessions() {
    if (!searchQuery) {
      setFilteredSessions(sessions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sessions.filter(
      (session) =>
        session.prompt?.toLowerCase().includes(query) ||
        session.response?.toLowerCase().includes(query) ||
        session.model?.toLowerCase().includes(query)
    );
    setFilteredSessions(filtered);
  }

  function openSessionDetail(session: any) {
    setSelectedSession(session);
    setEditingEvaluation(false);
    setEvaluationData(session.evaluation || {
      ratings: { accuracy: 3, coherence: 3, relevance: 3, creativity: 3, safety: 3 },
      status: null,
      comments: "",
    });
  }

  async function handleSaveEvaluation() {
    try {
      await updateSession(selectedSession.id, {
        evaluation: evaluationData,
      });
      toast.success("Evaluation updated");
      setEditingEvaluation(false);
      loadSessions();
    } catch (error: any) {
      console.error("Error updating evaluation:", error);
      toast.error(error.message || "Failed to update evaluation");
    }
  }

  async function handleDelete(sessionId: string) {
    if (!confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await deleteSession(sessionId);
      toast.success("Session deleted");
      loadSessions();
      setSelectedSession(null);
    } catch (error: any) {
      console.error("Error deleting session:", error);
      toast.error(error.message || "Failed to delete session");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "acceptable":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "needs-improvement":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "acceptable":
        return <Badge className="bg-green-100 text-green-800">Acceptable</Badge>;
      case "needs-improvement":
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Evaluated</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header and Search */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session History</h2>
          <p className="text-gray-500 mt-1">View and manage previous test sessions</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-4">
              <Clock className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-500">
              {sessions.length === 0
                ? "Start testing to see your session history"
                : "Try adjusting your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openSessionDetail(session)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    {getStatusIcon(session.evaluation?.status)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {session.prompt}
                        </p>
                        <p className="text-xs text-gray-500">
                          Model: {session.model} • {new Date(session.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.evaluation?.status)}
                      {session.evaluation?.ratings && (
                        <span className="text-xs text-gray-500">
                          Avg Score: {(
                            Object.values(session.evaluation.ratings).reduce((a: any, b: any) => a + b, 0) /
                            Object.values(session.evaluation.ratings).length
                          ).toFixed(1)}/5
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Created on {selectedSession && new Date(selectedSession.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Prompt</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedSession.prompt}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">AI Response</Label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedSession.response}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">Model: {selectedSession.model}</Badge>
                  {getStatusBadge(selectedSession.evaluation?.status)}
                </div>
              </div>

              {/* Evaluation Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Evaluation</h3>
                  {!editingEvaluation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingEvaluation(true)}
                    >
                      Edit Evaluation
                    </Button>
                  )}
                </div>

                {editingEvaluation ? (
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {Object.entries(evaluationData.ratings).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="capitalize">{key}</Label>
                            <span className="text-sm font-medium text-gray-600">{value}/5</span>
                          </div>
                          <Slider
                            value={[value]}
                            onValueChange={(vals) =>
                              setEvaluationData({
                                ...evaluationData,
                                ratings: { ...evaluationData.ratings, [key]: vals[0] },
                              })
                            }
                            min={1}
                            max={5}
                            step={1}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={evaluationData.status === "acceptable" ? "default" : "outline"}
                          className="cursor-pointer px-4 py-2"
                          onClick={() =>
                            setEvaluationData({ ...evaluationData, status: "acceptable" })
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acceptable
                        </Badge>
                        <Badge
                          variant={evaluationData.status === "needs-improvement" ? "default" : "outline"}
                          className="cursor-pointer px-4 py-2"
                          onClick={() =>
                            setEvaluationData({ ...evaluationData, status: "needs-improvement" })
                          }
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Needs Improvement
                        </Badge>
                        <Badge
                          variant={evaluationData.status === "failed" ? "default" : "outline"}
                          className="cursor-pointer px-4 py-2"
                          onClick={() =>
                            setEvaluationData({ ...evaluationData, status: "failed" })
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Failed
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eval-comments">Comments</Label>
                      <Textarea
                        id="eval-comments"
                        value={evaluationData.comments}
                        onChange={(e) =>
                          setEvaluationData({ ...evaluationData, comments: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveEvaluation}>Save Changes</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingEvaluation(false);
                          setEvaluationData(selectedSession.evaluation);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSession.evaluation?.ratings ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(selectedSession.evaluation.ratings).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                              <span className="text-sm font-bold text-gray-900">{value}/5</span>
                            </div>
                          ))}
                        </div>

                        {selectedSession.evaluation.comments && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Comments</Label>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {selectedSession.evaluation.comments}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No evaluation data available</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedSession.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Session
                </Button>
                <Button variant="outline" onClick={() => setSelectedSession(null)} className="ml-auto">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
