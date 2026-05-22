"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const FACTORS = [
  "mathematics_strength",
  "biology_strength",
  "logical_reasoning",
  "communication_skill",
  "interest_alignment",
  "study_tolerance",
] as const;
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

interface DeptOption {
  id: string;
  name: string;
}

interface ScoringRule {
  id: string;
  factor: string;
  weight: number;
  departmentId: string;
}

interface ApiDepartment {
  id: string;
  name: string;
  faculty: string;
  scoringRules: ScoringRule[];
}

const defaultForm = {
  factor: "",
  weight: 1,
  departmentId: "",
};

type RuleForm = typeof defaultForm;

const FACTOR_OPTIONS = [...FACTORS];

export default function RulesPage() {
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RuleForm>(defaultForm);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ departments: DeptOption[] }>("/api/departments");
      const list = data.departments || [];
      setDepartments(list);
      if (list.length > 0 && !selectedDeptId) {
        setSelectedDeptId(list[0].id);
      }
    } catch {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async (deptId: string) => {
    if (!deptId) return;
    setRulesLoading(true);
    setError(null);
    try {
      const dept = await api.get<{ department: ApiDepartment }>(`/api/departments/${deptId}`);
      setRules(dept.department.scoringRules || []);
    } catch {
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDeptId) {
      fetchRules(selectedDeptId);
    }
  }, [selectedDeptId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ factor: "", weight: 1, departmentId: selectedDeptId });
    setDialogOpen(true);
  };

  const openEdit = (rule: ScoringRule) => {
    setEditingId(rule.id);
    setForm({
      factor: rule.factor,
      weight: rule.weight,
      departmentId: rule.departmentId,
    });
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.factor) return;
    setSaving(true);
    try {
      const payload = {
        factor: form.factor,
        weight: form.weight,
        departmentId: selectedDeptId,
      };
      if (editingId) {
        await api.patch(`/api/admin/rules/${editingId}`, payload);
      } else {
        await api.post("/api/admin/rules", payload);
      }
      setDialogOpen(false);
      if (selectedDeptId) fetchRules(selectedDeptId);
    } catch {
      setError(editingId ? "Failed to update rule" : "Failed to create rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    try {
      await api.delete(`/api/admin/rules/${deletingId}`);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      if (selectedDeptId) fetchRules(selectedDeptId);
    } catch {
      setError("Failed to delete rule");
    } finally {
      setSaving(false);
    }
  };

  const factorLabel = (factor: string) => {
    return factor
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scoring Rules</h1>
        <p className="text-muted-foreground">Configure scoring weights per department</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Rules</CardTitle>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedDeptId && (
                <Button onClick={openCreate} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedDeptId ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Select a department to view its scoring rules
              </p>
            </div>
          ) : rulesLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factor</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      No rules defined for this department. Add your first rule.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{factorLabel(rule.factor)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rule.weight}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(rule.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Scoring Rule" : "Add Scoring Rule"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the scoring factor and weight."
                : "Add a new scoring factor with its weight."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/30 dark:text-amber-400">
            <strong>Warning:</strong> Changes to scoring rules dynamically affect all future
            recommendations. Existing recommendations will not be retroactively updated.
          </div>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="factor">Factor</Label>
              <select
                id="factor"
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                value={form.factor}
                onChange={(e) => setForm({ ...form, factor: e.target.value })}
              >
                <option value="">Select a factor</option>
                {FACTOR_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {factorLabel(f)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (%)</Label>
              <Input
                id="weight"
                type="number"
                min={1}
                max={100}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground">
                Percentage weight for this factor in the scoring algorithm
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.factor}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scoring Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scoring rule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
