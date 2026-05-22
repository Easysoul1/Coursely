"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaved, SavedDepartment } from "@/hooks/use-saved";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Trash2, Loader2, ExternalLink } from "lucide-react";

function SavedCard({ item, onRemove }: { item: SavedDepartment; onRemove: (id: string) => void }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(item.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{item.department.name}</h3>
              <BookmarkCheck className="h-4 w-4 text-primary shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{item.department.faculty}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{item.department.difficultyLevel}</Badge>
              <span className="text-xs text-muted-foreground">
                Saved {new Date(item.savedAt).toLocaleDateString()}
              </span>
            </div>
            {item.notes && (
              <p className="text-sm mt-2 text-muted-foreground italic">
                &ldquo;{item.notes}&rdquo;
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/student/departments/${item.departmentId}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemove} disabled={removing}>
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SavedPage() {
  const { saved, loading, error, removeSaved } = useSaved();
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRemove = async (id: string) => {
    await removeSaved(id);
    setConfirmOpen(false);
    setRemoveId(null);
  };

  const openConfirm = (id: string) => {
    setRemoveId(id);
    setConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Saved Recommendations</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Recommendations</h1>
        <p className="text-muted-foreground">Departments you&apos;ve bookmarked for later</p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No saved departments</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You haven&apos;t saved any departments yet. View your recommendations and save the ones
            you&apos;re interested in.
          </p>
          <Button asChild>
            <Link href="/dashboard/student/results">View Recommendations</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {saved.map((item) => (
            <SavedCard key={item.id} item={item} onRemove={openConfirm} />
          ))}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Saved Department</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this department from your saved list?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => removeId && handleRemove(removeId)}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
