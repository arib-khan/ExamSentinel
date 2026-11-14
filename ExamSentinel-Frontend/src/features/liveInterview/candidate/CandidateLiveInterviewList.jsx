import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import LiveInterviewCard from "@/components/liveInterview/LiveInterviewCard";
import { liveApi, apiErrorMessage } from "@/services/LiveInterviewServices/liveInterviewService";

const Section = ({ title, items, onOpen }) => items.length === 0 ? null : (
  <section className="space-y-3"><h2 className="text-lg font-semibold">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((i) => <LiveInterviewCard key={i.id} interview={i} onOpen={onOpen} />)}</div></section>
);

export default function CandidateLiveInterviewList() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const load = useCallback(() => liveApi.mine().then(setItems).catch((e) => { toast.error(apiErrorMessage(e)); setItems((p) => p || []); }), []);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]); // the Join button appears by itself when the room opens

  const open = (i) => navigate(`/candidate/live-interviews/${i.id}`);
  const ready = (items || []).filter((i) => ["live", "available"].includes(i.join_state));
  const upcoming = (items || []).filter((i) => i.join_state === "upcoming");
  const past = (items || []).filter((i) => ["ended", "cancelled", "expired"].includes(i.join_state));
  return (
    <div className="container mx-auto space-y-8 py-8">
      <div><h1 className="text-2xl font-semibold">My Interviews</h1><p className="text-sm text-muted-foreground">Live video interviews with our team. The Join button appears shortly before the start time.</p></div>
      {items === null ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-52" />)}</div>
        : items.length === 0 ? <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">You have no interviews scheduled yet.</div>
        : <><Section title="Ready to join" items={ready} onOpen={open} /><Section title="Upcoming" items={upcoming} onOpen={open} /><Section title="Past" items={past} onOpen={open} /></>}
    </div>
  );
}
