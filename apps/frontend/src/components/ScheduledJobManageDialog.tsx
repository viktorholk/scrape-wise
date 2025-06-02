import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Save } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type ScheduledJobManageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: {
    id: number;
    name: string;
    cronExpression: string;
    status: "ACTIVE" | "INACTIVE";
    prompt?: string;
  };
  onSave: (changes: { name: string; cronExpression: string; enabled: boolean }) => Promise<void>;
  onAbort: () => Promise<void>;
};

export const ScheduledJobManageDialog: React.FC<ScheduledJobManageDialogProps> = ({
  open,
  onOpenChange,
  analysis,
  onSave,
  onAbort,
}) => {
  const [name, setName] = useState(analysis.name);
  const [cron, setCron] = useState(analysis.cronExpression);
  const [enabled, setEnabled] = useState(analysis.status === "ACTIVE");
  const [saving, setSaving] = useState(false);
  const [aborting, setAborting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name,
        cronExpression: cron,
        enabled,
      });
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAbort = async () => {
    setAborting(true);
    setError(null);
    try {
      await onAbort();
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || "Failed to abort/delete job");
    } finally {
      setAborting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Scheduled Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} disabled={saving || aborting} />
          </div>
          <div>
            <label className="text-xs font-medium">Schedule</label>
            <Select
              value={cron}
              onValueChange={setCron}
              disabled={saving || aborting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="*/1 * * * *">Every 1 minute</SelectItem>
                <SelectItem value="*/5 * * * *">Every 5 minutes</SelectItem>
                <SelectItem value="*/10 * * * *">Every 10 minutes</SelectItem>
                <SelectItem value="0 * * * *">Every hour</SelectItem>
                <SelectItem value="0 0 * * *">Every day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} disabled={saving || aborting} />
            <span className="text-xs">{enabled ? "Enabled" : "Disabled"}</span>
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          <div className="flex justify-between pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleAbort}
              disabled={saving || aborting}
            >
              <Trash2 className="h-4 w-4 mr-1" /> {aborting ? "Aborting..." : "Abort/Delete"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || aborting}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};