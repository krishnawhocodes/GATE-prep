import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRef, useState } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/data")({ component: DataPage });

function DataPage() {
  const { exportJSON, importJSON, resetAll } = useStore();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function download() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gate-mission-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Data Manager</h1>
        <p className="text-sm text-muted-foreground">Your sadhana is sacred — back it up.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="glass p-5 space-y-3">
          <div className="font-semibold flex items-center gap-2">
            <Download className="size-4 text-saffron" />
            Export JSON
          </div>
          <Button onClick={download}>Download backup</Button>
        </Card>
        <Card className="glass p-5 space-y-3">
          <div className="font-semibold flex items-center gap-2">
            <Upload className="size-4 text-emerald-glow" />
            Import JSON
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              f.text().then((t) => {
                try {
                  importJSON(t);
                  toast.success("Imported");
                } catch {
                  toast.error("Invalid JSON");
                }
              });
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Choose file
          </Button>
        </Card>
        <Card className="glass p-5 space-y-3">
          <div className="font-semibold flex items-center gap-2">
            <RotateCcw className="size-4 text-destructive" />
            Reset App
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset all data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This wipes everything and re-seeds.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetAll();
                    toast.success("Reset done");
                  }}
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
      <Card className="glass p-5">
        <div className="font-semibold mb-2">Paste backup JSON</div>
        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{"subjects":[...]}'
        />
        <div className="mt-3 flex gap-2">
          <Button
            onClick={() => {
              try {
                importJSON(text);
                toast.success("Imported");
                setText("");
              } catch {
                toast.error("Invalid");
              }
            }}
          >
            Import from text
          </Button>
        </div>
      </Card>
    </div>
  );
}
