import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/resources")({ component: ResourcesPage });

const TYPES = ["youtube", "telegram", "pdf", "book", "notes", "test-series", "other"] as const;

function ResourcesPage() {
  const { state, addResource, removeResource } = useStore();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="text-sm text-muted-foreground">Your library of wisdom.</p>
        </div>
        <Add addResource={addResource} />
      </header>
      {state.subjects.map((s) => {
        const list = state.resources.filter((r) => r.subjectId === s.id);
        return (
          <Card key={s.id} className="glass p-4">
            <div className="text-sm font-semibold mb-2">{s.name}</div>
            {list.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">No resources yet.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {list.map((r) => (
                  <li key={r.id} className="py-2 flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-[10px]">
                      {r.type}
                    </Badge>
                    <span className="flex-1">{r.title}</span>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener" className="text-saffron">
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => removeResource(r.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function Add({ addResource }: { addResource: any }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("youtube");
  const [url, setUrl] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5 mr-1" />
          Add resource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {state.subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!subjectId || !title}
            onClick={() => {
              addResource({ subjectId, title, type, url });
              toast.success("Resource added");
              setOpen(false);
              setTitle("");
              setUrl("");
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
