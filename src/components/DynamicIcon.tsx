import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, LucideIcon>)[name] || Icons.Circle;
  return <Cmp className={className} />;
}
