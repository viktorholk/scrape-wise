import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import type { AnalyserJobForDialog } from '../pages/ScheduledJobs.tsx';

interface ScheduleAnalysisFormProps {
    analyserJobs: AnalyserJobForDialog[];
    selectedAnalyserJobId: string | null;
    setSelectedAnalyserJobId: (value: string | null) => void;
    name: string;
    setName: (value: string) => void;
    cronExpression: string;
    setCronExpression: (value: string) => void;
    handleSubmit: () => void;
    submitting: boolean;
    error: string | null;
    loadingJobs: boolean;
}

const MAX_PROMPT_LENGTH = 35;

export function ScheduleAnalysisForm({
    analyserJobs,
    selectedAnalyserJobId,
    setSelectedAnalyserJobId,
    name,
    setName,
    cronExpression,
    setCronExpression,
    handleSubmit,
    submitting,
    error,
    loadingJobs
}: ScheduleAnalysisFormProps) {
    if (loadingJobs) {
        return <div className="text-center py-4">Loading analyser jobs...</div>;
    }

    if (!analyserJobs || analyserJobs.length === 0) {
        return <div className="text-center py-4 text-muted-foreground">No analyser jobs found or available to schedule.</div>;
    }

    return (
        <>
            <div className="space-y-4">
                <Select
                    value={selectedAnalyserJobId ?? undefined}
                    onValueChange={setSelectedAnalyserJobId}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an analyser job" />
                    </SelectTrigger>
                    <SelectContent>
                        {analyserJobs.map(job => {
                            const truncatedPrompt = job.prompt.length > MAX_PROMPT_LENGTH
                                ? `${job.prompt.substring(0, MAX_PROMPT_LENGTH)}...`
                                : job.prompt;
                            const itemText = `ID: ${job.id} (${new Date(job.createdAt).toLocaleDateString()}) - ${truncatedPrompt}`;

                            return (

                                <SelectItem value={String(job.id)} className='w-full truncate' title={job.prompt}>
                                    {itemText}
                                </SelectItem>

                            );
                        })}
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <Select value={cronExpression} onValueChange={setCronExpression}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select cron interval" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="*/1 * * * *">Every 1 minute</SelectItem>
                        <SelectItem value="*/5 * * * *">Every 5 minutes</SelectItem>
                        <SelectItem value="*/10 * * * *">Every 10 minutes</SelectItem>
                        <SelectItem value="0 * * * *">Every hour</SelectItem>
                        <SelectItem value="0 0 * * *">Every day</SelectItem>
                    </SelectContent>
                </Select>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit} disabled={submitting || !selectedAnalyserJobId || loadingJobs}>
                    {submitting ? "Scheduling..." : "Schedule"}
                </Button>
            </div>
        </>
    );
} 