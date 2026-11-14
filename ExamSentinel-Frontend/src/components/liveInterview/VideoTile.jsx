import { useEffect, useRef } from "react";
import { Mic, MicOff, VideoOff } from "lucide-react";

/** Renders one participant's camera track. Remote microphones play through <AudioSink/>. */
export default function VideoTile({ track, label, sublabel, mirrored = false, muted = false, micOn, cameraOn = true, placeholder, className = "", big = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!track || !el) return undefined;
    track.attach(el);
    return () => { track.detach(el); };
  }, [track]);
  const showVideo = !!track && cameraOn;
  return (
    <div className={`relative overflow-hidden rounded-lg border bg-black ${big ? "aspect-video" : "aspect-video"} ${className}`} data-testid={`tile-${label}`}>
      <video ref={ref} autoPlay playsInline muted={muted} className={`h-full w-full object-cover ${mirrored ? "-scale-x-100" : ""} ${showVideo ? "" : "hidden"}`} />
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-slate-300">
          <VideoOff className="h-8 w-8 opacity-70" />
          <span>{placeholder || (track ? "Camera is off" : "Waiting for video…")}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white">
        <span className="truncate font-medium">{label}{sublabel ? <span className="ml-2 opacity-70">{sublabel}</span> : null}</span>
        {micOn !== undefined && (micOn ? <Mic className="h-4 w-4 text-emerald-300" aria-label="microphone on" /> : <MicOff className="h-4 w-4 text-red-300" aria-label="microphone off" />)}
      </div>
    </div>
  );
}

/** Hidden element that plays a remote participant's microphone. */
export function AudioSink({ track }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!track || !el) return undefined;
    track.attach(el);
    return () => { track.detach(el); };
  }, [track]);
  return <audio ref={ref} autoPlay className="hidden" />;
}
