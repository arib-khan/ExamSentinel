import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonitoringDisclosure from "./MonitoringDisclosure";
import { fmtDateTime } from "@/features/liveInterview/format";

/** Everything before the call: what will happen, consent, permission hints, errors with Retry. */
export default function PreJoin({ title, subtitle, mode, interview, phase, error, onJoin, children, requireConsent = true, joinLabel = "Join interview" }) {
  const [agree, setAgree] = useState(!requireConsent);
  const busy = phase === "connecting";
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader><CardTitle>{title}</CardTitle>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</CardHeader>
      <CardContent className="space-y-4">
        {interview && (
          <div className="rounded-md bg-muted/40 p-3 text-sm">
            <div className="font-medium">{interview.title}</div>
            <div className="text-muted-foreground">{fmtDateTime(interview.scheduled_start)} · {interview.duration_minutes} min · with {interview.host_name}</div>
          </div>
        )}
        {children}
        {requireConsent && <MonitoringDisclosure mode={mode} checked={agree} onChange={setAgree} />}
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{error.code === "TOO_EARLY" ? "Not open yet" : "Could not join"}</AlertTitle>
            <AlertDescription>{error.message}{error.opensAt ? ` (opens ${fmtDateTime(error.opensAt)})` : ""}</AlertDescription>
          </Alert>
        )}
        <Button className="w-full" size="lg" disabled={busy || !agree} onClick={() => onJoin({ consent: agree })}>
          {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting…</> : error ? "Retry" : joinLabel}
        </Button>
        {!agree && <p className="text-center text-xs text-muted-foreground">Tick the box above to continue.</p>}
      </CardContent>
    </Card>
  );
}
