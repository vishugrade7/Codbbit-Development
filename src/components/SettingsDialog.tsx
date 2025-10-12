'use client';

import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";

interface SettingsDialogProps {
    children?: ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const Trigger = children ? <Link href="/settings" passHref>{children}</Link> : (
    <Link href="/settings" passHref>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
    </Link>
  );

  return Trigger;
}
