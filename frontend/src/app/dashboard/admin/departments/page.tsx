"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Loader2, Search } from "lucide-react";

interface Department {
  id: string;
  name: string;
  faculty: string;
  description: string;
  cutoffMark: number;
  requiredSubjects: string;
  difficultyLevel: string;
  careerPaths: string;
  studyDuration: string;
  createdAt: string;
}

const defaultForm = {
  name: "",
  faculty: "",
  description: "",
  cutoffMark: 0,
  requiredSubjects: "",
  difficultyLevel: "medium",
  careerPaths: "",
  studyDuration: "4",
};

type DepartmentForm = typeof defaultForm;

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DepartmentForm>(defaultForm);
  const [search, setSearch] = useState("");

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.faculty.toLowerCase().includes(search.toLowerCase()),
  );

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ departments: Department[] }>("/api/departments");
      setDepartments(data.departments);
    } catch {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const parseListField = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(", ") : value;
    } catch {
      return value;
    }
  };

  const openEdit = (dept: Department) => {
    setEditingId(dept.id);
    setForm({
      name: dept.name,
      faculty: dept.faculty,
      description: dept.description,
      cutoffMark: dept.cutoffMark,
      requiredSubjects: parseListField(dept.requiredSubjects),
      difficultyLevel: dept.difficultyLevel,
      careerPaths: parseListField(dept.careerPaths),
      studyDuration: dept.studyDuration,
    });
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const toJsonList = (value: string) => {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(
        value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        requiredSubjects: toJsonList(form.requiredSubjects),
        careerPaths: toJsonList(form.careerPaths),
      };
      if (editingId) {
        await api.patch(`/api/departments/${editingId}`, payload);
      } else {
        await api.post("/api/departments", payload);
      }
      setDialogOpen(false);
      fetchDepartments();
    } catch {
      setError(editingId ? "Failed to update department" : "Failed to create department");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    try {
      await api.delete(`/api/departments/${deletingId}`);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchDepartments();
    } catch {
      setError("Failed to delete department");
    } finally {
      setSaving(false);
    }
  };

  const difficultyColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      case "low":
        return "secondary" as const;
      default:
        return "default" as const;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-muted-foreground">Manage University of Ibadan departments</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Cutoff Mark</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    {search
                      ? "No departments match your search."
                      : "No departments found. Add your first department."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.faculty}</TableCell>
                    <TableCell>
                      <Badge variant={difficultyColor(dept.difficultyLevel)}>
                        {dept.difficultyLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{dept.cutoffMark}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(dept)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(dept.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the department details below."
                : "Fill in the details to add a new department."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Input
                  id="faculty"
                  value={form.faculty}
                  onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                  placeholder="e.g. Science"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the department"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cutoffMark">Cutoff Mark</Label>
                <Input
                  id="cutoffMark"
                  type="number"
                  value={form.cutoffMark}
                  onChange={(e) => setForm({ ...form, cutoffMark: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty</Label>
                <select
                  id="difficultyLevel"
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                  value={form.difficultyLevel}
                  onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studyDuration">Duration (years)</Label>
                <Input
                  id="studyDuration"
                  value={form.studyDuration}
                  onChange={(e) => setForm({ ...form, studyDuration: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredSubjects">Required Subjects</Label>
              <Textarea
                id="requiredSubjects"
                value={form.requiredSubjects}
                onChange={(e) => setForm({ ...form, requiredSubjects: e.target.value })}
                placeholder="Comma-separated list of required O'level subjects"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="careerPaths">Career Paths</Label>
              <Textarea
                id="careerPaths"
                value={form.careerPaths}
                onChange={(e) => setForm({ ...form, careerPaths: e.target.value })}
                placeholder="Comma-separated list of career opportunities"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this department? This action cannot be undone.
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
