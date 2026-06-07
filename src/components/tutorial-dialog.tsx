
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Check, Hand, X } from "lucide-react";

type TutorialDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TutorialDialog({ open, onOpenChange }: TutorialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">Quick Guide</DialogTitle>
          <DialogDescription className="text-center">
            Here’s how to quickly build your library.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 bg-secondary p-3 rounded-lg">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Swipe to Decide</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-destructive">Swipe Left</span> to skip, or <span className="font-bold text-green-500">Swipe Right</span> to mark as 'Watched'.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 bg-secondary p-3 rounded-lg">
              <Hand className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Hold for More Options</h3>
              <p className="text-sm text-muted-foreground">
                Long-press on a card to add it to your 'To Watch' or 'Started' lists.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">Got It!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
