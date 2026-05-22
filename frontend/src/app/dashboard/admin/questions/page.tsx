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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ApiQuestion {
  id: string;
  question: string;
  category: string;
  type: string;
  weight: number;
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  category: string;
  type: string;
  weight: number;
  createdAt: string;
  options?: string;
}

const CATEGORIES = ["ACADEMIC", "CAREER", "PERSONALITY", "LEARNING_STYLE", "GOAL"] as const;
const TYPES = ["SCALE", "MULTIPLE_CHOICE", "TRUE_FALSE"] as const;

const defaultForm = {
  text: "",
  category: "ACADEMIC",
  type: "SCALE",
  weight: 1,
  options: "",
};

type QuestionForm = typeof defaultForm;

const categoryLabels: Record<string, string> = {
  ACADEMIC: "Academic",
  CAREER: "Career",
  PERSONALITY: "Personality",
  LEARNING_STYLE: "Learning Style",
  GOAL: "Goal",
};

const categoryColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACADEMIC: "default",
  CAREER: "secondary",
  PERSONALITY: "outline",
  LEARNING_STYLE: "secondary",
  GOAL: "default",
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<QuestionForm>(defaultForm);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ questions: ApiQuestion[] }>("/api/assessment/questions");
      setQuestions(data.questions.map((q) => ({ ...q, text: q.question })));
    } catch {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      text: q.text,
      category: q.category,
      type: q.type,
      weight: q.weight,
      options: q.options || "",
    });
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        options: form.type === "MULTIPLE_CHOICE" ? form.options : undefined,
      };
      if (editingId) {
        await api.patch(`/api/questions/${editingId}`, payload);
      } else {
        await api.post("/api/questions", payload);
      }
      setDialogOpen(false);
      fetchQuestions();
    } catch {
      setError(editingId ? "Failed to update question" : "Failed to create question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    try {
      await api.delete(`/api/questions/${deletingId}`);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchQuestions();
    } catch {
      setError("Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const handleReorder = async (category: string, questionId: string, direction: "up" | "down") => {
    const catQuestions = questions
      .filter((q) => q.category === category)
      .sort((a, b) => b.weight - a.weight);

    const idx = catQuestions.findIndex((q) => q.id === questionId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === catQuestions.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = [...catQuestions];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    try {
      await api.post(`/api/questions/reorder`, {
        category,
        questionIds: newOrder.map((q) => q.id),
      });
      fetchQuestions();
    } catch {
      setError("Failed to reorder questions");
    }
  };

  const groupedQuestions = CATEGORIES.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    questions: questions.filter((q) => q.category === cat).sort((a, b) => b.weight - a.weight),
  }));

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
          <h1 className="text-2xl font-bold">Assessment Questions</h1>
          <p className="text-muted-foreground">Manage questions used in the student assessment</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {groupedQuestions.map((group) => (
        <Card key={group.category}>
          <CardHeader
            className="cursor-pointer flex flex-row items-center justify-between py-4"
            onClick={() => toggleCategory(group.category)}
          >
            <div className="flex items-center gap-2">
              {expandedCategories.has(group.category) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <CardTitle className="text-base">{group.label}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {group.questions.length}
              </Badge>
            </div>
          </CardHeader>
          {expandedCategories.has(group.category) && (
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Order</TableHead>
                    <TableHead className="w-[40%]">Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No questions in this category
                      </TableCell>
                    </TableRow>
                  ) : (
                    group.questions.map((q, qi) => (
                      <TableRow key={q.id}>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              disabled={qi === 0}
                              onClick={() => handleReorder(group.category, q.id, "up")}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              disabled={qi === group.questions.length - 1}
                              onClick={() => handleReorder(group.category, q.id, "down")}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{q.text}</TableCell>
                        <TableCell>
                          <Badge variant={categoryColors[q.category]}>
                            {q.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{q.weight}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDelete(q.id)}>
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
          )}
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the question details below."
                : "Fill in the details to add a new question."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text">Question Text</Label>
              <Textarea
                id="text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Enter the question text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  min={1}
                  max={10}
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            {form.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                <Label htmlFor="options">Options</Label>
                <Textarea
                  id="options"
                  value={form.options}
                  onChange={(e) => setForm({ ...form, options: e.target.value })}
                  placeholder="One option per line"
                />
                <p className="text-xs text-muted-foreground">Enter each option on a new line</p>
              </div>
            )}
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
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
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
