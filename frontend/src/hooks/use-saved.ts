"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface SavedDepartment {
  id: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
    faculty: string;
    difficultyLevel: string;
  };
  savedAt: string;
  notes: string;
  folder: string;
}

export function useSaved() {
  const [saved, setSaved] = useState<SavedDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ saved: SavedDepartment[] }>("/api/saved");
      setSaved(data.saved || []);
    } catch {
      setError("Failed to load saved departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const saveDepartment = async (departmentId: string, notes = "", folder = "") => {
    const data = await api.post<{ saved: SavedDepartment }>("/api/saved", {
      departmentId,
      notes,
      folder,
    });
    setSaved((prev) => [data.saved, ...prev]);
    return data.saved;
  };

  const updateSaved = async (id: string, updates: { notes?: string; folder?: string }) => {
    const data = await api.patch<{ saved: SavedDepartment }>(`/api/saved/${id}`, updates);
    setSaved((prev) => prev.map((s) => (s.id === id ? data.saved : s)));
    return data.saved;
  };

  const removeSaved = async (id: string) => {
    await api.delete(`/api/saved/${id}`);
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  const isSaved = (departmentId: string) => saved.some((s) => s.departmentId === departmentId);

  const getSavedId = (departmentId: string) =>
    saved.find((s) => s.departmentId === departmentId)?.id;

  return {
    saved,
    loading,
    error,
    fetchSaved,
    saveDepartment,
    updateSaved,
    removeSaved,
    isSaved,
    getSavedId,
  };
}
