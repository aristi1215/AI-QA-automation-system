import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { getBugs, updateBug, deleteBug } from "../lib/api";
import { Search, Filter, AlertTriangle, Loader2, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";

const SEVERITY_COLORS = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
};

export function Bugs() {
  const [bugs, setBugs] = useState<any[]>([]);
  const [filteredBugs, setFilteredBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBug, setSelectedBug] = useState<any>(null);

  useEffect(() => {
    loadBugs();
  }, []);

  useEffect(() => {
    filterBugs();
  }, [bugs, searchQuery, severityFilter, statusFilter, categoryFilter]);

  async function loadBugs() {
    try {
      setLoading(true);
      const data = await getBugs();
      setBugs(data);
    } catch (error: any) {
      console.error("Error loading bugs:", error);
      toast.error(error.message || "Failed to load bugs");
    } finally {
      setLoading(false);
    }
  }

  function filterBugs() {
    let filtered = [...bugs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bug) =>
          bug.title?.toLowerCase().includes(query) ||
          bug.description?.toLowerCase().includes(query)
      );
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((bug) => bug.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((bug) => bug.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((bug) => bug.category === categoryFilter);
    }

    setFilteredBugs(filtered);
  }

  async function handleStatusChange(bugId: string, newStatus: string) {
    try {
      await updateBug(bugId, { status: newStatus });
      toast.success("Bug status updated");
      loadBugs();
    } catch (error: any) {
      console.error("Error updating bug:", error);
      toast.error(error.message || "Failed to update bug");
    }
  }

  async function handleDelete(bugId: string) {
    if (!confirm("Are you sure you want to delete this bug report?")) {
      return;
    }

    try {
      await deleteBug(bugId);
      toast.success("Bug report deleted");
      loadBugs();
      setSelectedBug(null);
    } catch (error: any) {
      console.error("Error deleting bug:", error);
      toast.error(error.message || "Failed to delete bug");
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header and Filters */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bug Reports</h2>
          <p className="text-gray-500 mt-1">Track and manage reported issues</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-[1fr,auto,auto,auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="hallucination">Hallucination</SelectItem>
                  <SelectItem value="incorrect">Incorrect Output</SelectItem>
                  <SelectItem value="toxic">Toxic Content</SelectItem>
                  <SelectItem value="formatting">Formatting Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bug List */}
      {filteredBugs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-4">
              <AlertTriangle className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
            <p className="text-gray-500">
              {bugs.length === 0
                ? "No bugs have been reported yet"
                : "Try adjusting your filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBugs.map((bug) => (
            <Card
              key={bug.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedBug(bug)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {bug.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {bug.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}>
                        {bug.severity}
                      </Badge>
                      <Badge className={STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}>
                        {bug.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {bug.category}
                      </Badge>
                      <span className="text-xs text-gray-500 self-center ml-auto">
                        {new Date(bug.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bug Detail Dialog */}
      <Dialog open={!!selectedBug} onOpenChange={(open) => !open && setSelectedBug(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBug?.title}</DialogTitle>
            <DialogDescription>
              Reported on {selectedBug && new Date(selectedBug.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedBug && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className={SEVERITY_COLORS[selectedBug.severity as keyof typeof SEVERITY_COLORS]}>
                  {selectedBug.severity}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedBug.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedBug.status}
                  onValueChange={(val) => handleStatusChange(selectedBug.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedBug.description}
                </p>
              </div>

              {selectedBug.stepsToReproduce && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Steps to Reproduce</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedBug.stepsToReproduce}
                  </p>
                </div>
              )}

              {selectedBug.expectedBehavior && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Expected Behavior</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedBug.expectedBehavior}
                  </p>
                </div>
              )}

              {selectedBug.actualBehavior && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Actual Behavior</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedBug.actualBehavior}
                  </p>
                </div>
              )}

              {selectedBug.sessionData && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Associated Test Session</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Prompt:</span>
                      <p className="text-sm text-gray-700 mt-1">{selectedBug.sessionData.prompt}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Response:</span>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-4">
                        {selectedBug.sessionData.response}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Model:</span>
                      <span className="text-sm text-gray-700 ml-2">{selectedBug.sessionData.model}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedBug.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Bug Report
                </Button>
                <Button variant="outline" onClick={() => setSelectedBug(null)} className="ml-auto">
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
