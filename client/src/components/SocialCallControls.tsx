import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface SocialContact {
  id: number;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface ActiveCall {
  id: string;
  kind: "audio" | "video";
  peerId: number;
  direction: "incoming" | "outgoing";
}

export default function SocialCallControls({
  contact,
  contacts,
}: {
  contact?: SocialContact;
  contacts: SocialContact[];
}) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const appliedCandidates = useRef(new Set<string>());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const incoming = trpc.social.calls.incoming.useQuery(undefined, {
    enabled: Boolean(user) && !activeCall,
    refetchInterval: 2_000,
    retry: false,
  });
  const iceServers = trpc.social.calls.iceServers.useQuery(undefined, {
    enabled: Boolean(user),
    staleTime: 5 * 60_000,
    retry: false,
  });
  const callState = trpc.social.calls.get.useQuery(
    { callId: activeCall?.id ?? "00000000-0000-0000-0000-000000000000" },
    { enabled: Boolean(activeCall), refetchInterval: 1_000, retry: false },
  );
  const createCall = trpc.social.calls.create.useMutation();
  const respond = trpc.social.calls.respond.useMutation();
  const signal = trpc.social.calls.signal.useMutation();
  const endCall = trpc.social.calls.end.useMutation();

  const incomingContact = contacts.find((member) => member.id === incoming.data?.fromUserId);
  const activeContact = contacts.find((member) => member.id === activeCall?.peerId) ?? contact;
  const supportsCalling = typeof window !== "undefined" && "RTCPeerConnection" in window && Boolean(navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    localStreamRef.current = localStream;
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream, activeCall?.kind]);
  useEffect(() => {
    remoteStreamRef.current = remoteStream;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream, activeCall?.kind]);

  const releaseMedia = () => {
    peerRef.current?.close();
    peerRef.current = null;
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setConnectionState("idle");
    setMuted(false);
    setCameraOff(false);
    appliedCandidates.current.clear();
  };

  useEffect(() => () => {
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const openMedia = async (kind: "audio" | "video") => {
    if (!supportsCalling) throw new Error("This browser does not support secure audio/video calls");
    return navigator.mediaDevices.getUserMedia({ audio: true, video: kind === "video" });
  };

  const createPeer = (callId: string, stream: MediaStream) => {
    const peer = new RTCPeerConnection({
      iceServers: iceServers.data ?? [{ urls: "stun:stun.l.google.com:19302" }],
    });
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.ontrack = (event) => setRemoteStream(event.streams[0] ?? new MediaStream([event.track]));
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      const candidate = event.candidate.toJSON();
      signal.mutate({
        callId,
        type: "candidate",
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      });
    };
    peer.onconnectionstatechange = () => setConnectionState(peer.connectionState);
    peerRef.current = peer;
    return peer;
  };

  const startCall = async (kind: "audio" | "video") => {
    if (!contact || createCall.isPending) return;
    try {
      const stream = await openMedia(kind);
      setLocalStream(stream);
      const call = await createCall.mutateAsync({ toUserId: contact.id, kind });
      setActiveCall({ id: call.id, kind, peerId: contact.id, direction: "outgoing" });
      setConnectionState("ringing");
      const peer = createPeer(call.id, stream);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await signal.mutateAsync({ callId: call.id, type: "offer", sdp: offer.sdp });
    } catch (error) {
      releaseMedia();
      toast.error(error instanceof Error ? error.message : "Unable to start the call");
    }
  };

  const acceptIncoming = async () => {
    const call = incoming.data;
    if (!call?.offer || respond.isPending) {
      toast.info("The secure call is still connecting. Try again in a moment.");
      return;
    }
    try {
      const stream = await openMedia(call.kind);
      setLocalStream(stream);
      setActiveCall({ id: call.id, kind: call.kind, peerId: call.fromUserId, direction: "incoming" });
      const peer = createPeer(call.id, stream);
      await peer.setRemoteDescription({ type: "offer", sdp: call.offer });
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await signal.mutateAsync({ callId: call.id, type: "answer", sdp: answer.sdp });
      await respond.mutateAsync({ callId: call.id, accept: true });
      setConnectionState("connecting");
      await utils.social.calls.incoming.invalidate();
    } catch (error) {
      releaseMedia();
      toast.error(error instanceof Error ? error.message : "Unable to answer the call");
    }
  };

  const declineIncoming = async () => {
    if (!incoming.data) return;
    await respond.mutateAsync({ callId: incoming.data.id, accept: false });
    await utils.social.calls.incoming.invalidate();
  };

  useEffect(() => {
    const state = callState.data;
    const peer = peerRef.current;
    if (!state || !peer || !activeCall || !user) return;
    if (["declined", "ended", "missed"].includes(state.status)) {
      toast.info(state.status === "declined" ? "Call declined" : "Call ended");
      releaseMedia();
      return;
    }
    const synchronize = async () => {
      if (activeCall.direction === "outgoing" && state.answer && !peer.remoteDescription) {
        await peer.setRemoteDescription({ type: "answer", sdp: state.answer });
      }
      if (!peer.remoteDescription) return;
      for (const candidate of state.candidates) {
        if (candidate.fromUserId === user.id || appliedCandidates.current.has(candidate.id)) continue;
        await peer.addIceCandidate({
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        });
        appliedCandidates.current.add(candidate.id);
      }
    };
    void synchronize().catch(() => setConnectionState("failed"));
  }, [activeCall, callState.data, user]);

  const hangUp = async () => {
    if (activeCall) await endCall.mutateAsync({ callId: activeCall.id }).catch(() => undefined);
    releaseMedia();
  };

  const toggleMute = () => {
    const next = !muted;
    localStream?.getAudioTracks().forEach((track) => { track.enabled = !next; });
    setMuted(next);
  };
  const toggleCamera = () => {
    const next = !cameraOff;
    localStream?.getVideoTracks().forEach((track) => { track.enabled = !next; });
    setCameraOff(next);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Start audio call" title={supportsCalling ? "Audio call" : "Calling is not supported in this browser"} disabled={!contact || !supportsCalling || createCall.isPending} onClick={() => void startCall("audio")} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-amber-400 disabled:opacity-30">
          <Phone className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Start video call" title={supportsCalling ? "Video call" : "Calling is not supported in this browser"} disabled={!contact || !supportsCalling || createCall.isPending} onClick={() => void startCall("video")} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-blue-400 disabled:opacity-30">
          <Video className="h-4 w-4" />
        </button>
      </div>

      {!activeCall && incoming.data && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-blue-500/30 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-xl font-black text-blue-300">
              {(incomingContact?.name || incomingContact?.username || "GV").slice(0, 2).toUpperCase()}
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{incomingContact?.name || incomingContact?.username || "GoldVaults member"}</h3>
            <p className="mt-1 text-sm text-slate-400">Incoming {incoming.data.kind} call</p>
            {!incoming.data.offer && <p className="mt-2 flex items-center justify-center gap-2 text-xs text-amber-300"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Establishing secure signaling…</p>}
            <div className="mt-6 flex items-center justify-center gap-6">
              <button type="button" aria-label="Decline call" onClick={() => void declineIncoming()} className="rounded-full bg-red-500 p-4 text-white"><PhoneOff className="h-6 w-6" /></button>
              <button type="button" aria-label="Answer call" disabled={!incoming.data.offer} onClick={() => void acceptIncoming()} className="rounded-full bg-emerald-500 p-4 text-white disabled:opacity-40">{incoming.data.kind === "video" ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}</button>
            </div>
          </div>
        </div>
      )}

      {activeCall && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="relative grid min-h-[28rem] place-items-center bg-slate-950">
              {activeCall.kind === "video" && remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/15 text-3xl font-black text-amber-300">{(activeContact?.name || activeContact?.username || "GV").slice(0, 2).toUpperCase()}</div>
                  <h3 className="mt-5 text-2xl font-bold text-white">{activeContact?.name || activeContact?.username || "GoldVaults member"}</h3>
                  <p className="mt-2 text-sm capitalize text-slate-400">{connectionState === "connected" ? "Connected" : connectionState === "failed" ? "Connection failed" : `${connectionState}…`}</p>
                </div>
              )}
              {activeCall.kind === "video" && localStream && <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 h-32 w-24 rounded-xl border border-white/20 bg-slate-900 object-cover shadow-xl sm:h-40 sm:w-52" />}
              {activeCall.kind === "audio" && <audio ref={remoteAudioRef} autoPlay />}
            </div>
            <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-slate-900 p-5">
              <button type="button" aria-label={muted ? "Unmute microphone" : "Mute microphone"} onClick={toggleMute} className={`rounded-full p-3 ${muted ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white"}`}>{muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}</button>
              {activeCall.kind === "video" && <button type="button" aria-label={cameraOff ? "Turn camera on" : "Turn camera off"} onClick={toggleCamera} className={`rounded-full p-3 ${cameraOff ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white"}`}>{cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}</button>}
              <button type="button" aria-label="End call" onClick={() => void hangUp()} className="rounded-full bg-red-500 p-4 text-white"><PhoneOff className="h-6 w-6" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
