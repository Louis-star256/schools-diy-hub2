
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Settings2, Moon, Sun, Monitor, Layout, Maximize2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState('system');
  const [position, setPosition] = React.useState('bottom-left');
  const [size, setSize] = React.useState('small');

  const handleSave = () => {
    toast({
      title: "Preferences Synced",
      description: "Hub parameters have been updated for this session.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] bg-[#0A0A0A] border-white/10 p-0 overflow-hidden text-white shadow-2xl">
        <div className="p-8 space-y-8">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-3xl font-black font-headline tracking-tighter">General</DialogTitle>
              <button onClick={() => onOpenChange(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <DialogDescription className="text-white/40 font-medium">Configure your personal laboratory interface.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-2">
            {/* Theme Preference */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-bold text-white">Theme</Label>
                <p className="text-[11px] text-white/40 font-medium">Select your interface preference.</p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 rounded-xl h-10 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    {theme === 'system' && <Monitor className="h-3 w-3" />}
                    {theme === 'dark' && <Moon className="h-3 w-3" />}
                    {theme === 'light' && <Sun className="h-3 w-3" />}
                    <SelectValue placeholder="System" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position Preference */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-bold text-white">Position</Label>
                <p className="text-[11px] text-white/40 font-medium">Adjust the placement of your AI Mentor tools.</p>
              </div>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 rounded-xl h-10 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Layout className="h-3 w-3" />
                    <SelectValue placeholder="Bottom Left" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Size Preference */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-bold text-white">Size</Label>
                <p className="text-[11px] text-white/40 font-medium">Adjust the scale of your Hub tools.</p>
              </div>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 rounded-xl h-10 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="h-3 w-3" />
                    <SelectValue placeholder="Small" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hide Tools Preference */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
              <div className="space-y-1">
                <Label className="text-sm font-bold text-white">Hide AI Assistant for this session</Label>
                <p className="text-[11px] text-white/40 font-medium">Minimize mentor tools until next login.</p>
              </div>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 rounded-xl h-10 px-6 font-bold text-[11px] uppercase tracking-widest hover:bg-white/10">
                Hide
              </Button>
            </div>

            {/* Shortcut Preference */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-bold text-white">Toggle Shortcut</Label>
                <p className="text-[11px] text-white/40 font-medium">Set a custom keyboard trigger.</p>
              </div>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 rounded-xl h-10 px-4 font-bold text-[11px] uppercase tracking-widest hover:bg-white/10">
                Record Shortcut
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-white/[0.03] p-8 mt-4 border-t border-white/5">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-primary/40 tracking-[0.4em]">
              <ShieldCheck className="h-3 w-3" /> Protocol 2.0
            </div>
            <Button onClick={handleSave} className="bg-primary text-black font-black uppercase tracking-widest rounded-xl px-10 h-12 shadow-xl shadow-primary/20 transition-all active:scale-95">
              Sync Parameters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
