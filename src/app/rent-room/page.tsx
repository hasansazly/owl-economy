"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckBadge2,
  ChevronRight,
  ImagePlus,
  MapPin,
  MessageCircle,
  MoonStar,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type SwapMode = "Sublet (Monthly)" | "Crash Pad (Nightly)";

type RoomCard = {
  id: string;
  title: string;
  host: string;
  campus: string;
  area: string;
  price: string;
  dates: string;
  vibeTags: string[];
  mode: SwapMode;
  imageHint: string;
};

const swapModes: SwapMode[] = ["Sublet (Monthly)", "Crash Pad (Nightly)"];

const quickTags = ["#Quiet", "#Social", "#Study-Friendly", "#NearLibrary", "#LateCheckIn", "#Clean"];

const roomCards: RoomCard[] = [
  {
    id: "room-1",
    title: "Sunny room near campus quad",
    host: "Maya R.",
    campus: "Temple University",
    area: "Morgan Hall",
    price: "$760/mo",
    dates: "May 15 - Aug 15",
    vibeTags: ["#Quiet", "#Study-Friendly"],
    mode: "Sublet (Monthly)",
    imageHint: "Bright desk + bed setup",
  },
  {
    id: "room-2",
    title: "Late-night crash pad after events",
    host: "Jordan T.",
    campus: "Temple University",
    area: "Cecil B. Moore",
    price: "$24/night",
    dates: "Single nights open",
    vibeTags: ["#Social", "#LateCheckIn"],
    mode: "Crash Pad (Nightly)",
    imageHint: "Couch + lamp corner",
  },
  {
    id: "room-3",
    title: "Sublet with quiet roommate vibe",
    host: "Sana L.",
    campus: "Drexel University",
    area: "University City",
    price: "$710/mo",
    dates: "Jun 1 - Jul 31",
    vibeTags: ["#Quiet", "#Clean"],
    mode: "Sublet (Monthly)",
    imageHint: "Window room + dresser",
  },
  {
    id: "room-4",
    title: "One-night stay near library",
    host: "Chris D.",
    campus: "Temple University",
    area: "Charles Library",
    price: "$28/night",
    dates: "Tonight available",
    vibeTags: ["#Study-Friendly", "#Quiet"],
    mode: "Crash Pad (Nightly)",
    imageHint: "Bedside shelf setup",
  },
];

const reactionButtons = [
  { id: "fire", emoji: "🔥", label: "Hot" },
  { id: "chat", emoji: "💬", label: "Message" },
  { id: "calendar", emoji: "📅", label: "Dates" },
] as const;

export default function RoomSwapPage() {
  const [mode, setMode] = useState<SwapMode>("Sublet (Monthly)");
  const [price, setPrice] = useState("");
  const [dates, setDates] = useState("");
  const [vibeTags, setVibeTags] = useState<string[]>(["#Quiet"]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomCard | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({
    "room-1": { fire: 14, chat: 6, calendar: 9 },
    "room-2": { fire: 11, chat: 8, calendar: 7 },
    "room-3": { fire: 9, chat: 4, calendar: 5 },
    "room-4": { fire: 16, chat: 10, calendar: 12 },
  });

  useEffect(() => {
    document.body.style.overflow = selectedRoom ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRoom]);

  const visibleRooms = useMemo(() => {
    return roomCards.filter((room) => room.mode === mode);
  }, [mode]);

  const previewLabel = useMemo(() => {
    if (!uploadedPhotos.length) {
      return "No photo yet";
    }

    return uploadedPhotos.length === 1 ? uploadedPhotos[0] : `${uploadedPhotos.length} photos ready`;
  }, [uploadedPhotos]);

  const toggleVibe = (tag: string) => {
    setVibeTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const nextPhotos = Array.from(files)
      .slice(0, 4)
      .map((file) => file.name);

    setUploadedPhotos(nextPhotos);
  };

  const openChat = (room: RoomCard) => {
    setSelectedRoom(room);
    setChatMessage(
      `Hi ${room.host.split(" ")[0]}, I saw your ${room.mode.toLowerCase()} post on MyDormStash. Is this still available?`,
    );
  };

  const reactToRoom = (roomId: string, reactionId: string) => {
    setReactionCounts((current) => ({
      ...current,
      [roomId]: {
        ...current[roomId],
        [reactionId]: (current[roomId]?.[reactionId] ?? 0) + 1,
      },
    }));
  };

  return (
    <main className="page-shell">
      <section className="page-wrap max-w-6xl">
        <header className="page-header">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link href="/" className="page-brand">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </Link>

          <div className="page-chip hidden items-center gap-2 sm:inline-flex">
            <MoonStar className="h-3.5 w-3.5 text-[var(--accent)]" />
            Room Swap live
          </div>
        </header>

        <section className="grid gap-6 px-1 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <p className="section-kicker !px-0">The Room Swap</p>
            <h1 className="mt-4 max-w-4xl font-display text-[3rem] font-extrabold leading-[0.94] tracking-[-0.06em] sm:text-[4.5rem]">
              Switch between
              <span className="hero-gradient-title block"> sublets and crash pads fast.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/52">
              Post a monthly sublet or a nightly crash pad, then let verified students react,
              message, and request to stay without leaving the MyDormStash flow.
            </p>

            <div className="mt-7 inline-flex rounded-full border border-white/10 bg-white/5 p-1.5">
              {swapModes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === item
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/5 hover:text-white/82"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <section className="page-card p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              Quick Post Builder
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Price
                </span>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder={mode === "Sublet (Monthly)" ? "$760/mo" : "$24/night"}
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Dates
                </span>
                <div className="flex items-center rounded-[14px] border border-white/10 bg-white/5 px-4 py-3">
                  <CalendarDays className="mr-3 h-4 w-4 text-[var(--accent)]" />
                  <input
                    value={dates}
                    onChange={(event) => setDates(event.target.value)}
                    placeholder={mode === "Sublet (Monthly)" ? "May 15 - Aug 15" : "Single date or tonight"}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                </div>
              </label>
            </div>

            <div className="mt-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">Vibe Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickTags.map((tag) => {
                  const active = vibeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleVibe(tag)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        active
                          ? "border-[rgba(18,214,255,0.28)] bg-[rgba(18,214,255,0.10)] text-[var(--accent)]"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/82"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <label
              className={`mt-5 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-5 py-8 text-center transition ${
                dragActive
                  ? "border-[rgba(18,214,255,0.45)] bg-[rgba(18,214,255,0.07)]"
                  : "border-white/15 bg-white/[0.02] hover:border-white/25"
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFiles(event.dataTransfer.files);
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/6 text-[var(--accent)]">
                <ImagePlus className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">Drag and drop room photos here</p>
              <p className="mt-2 text-xs text-white/38">Or tap to upload up to 4 images</p>
              <p className="mt-4 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/62">
                Preview: {previewLabel}
              </p>
            </label>
          </section>
        </section>

        <section className="mt-2">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="section-kicker !mt-0 !px-0">Reaction Page</p>
            <div className="page-chip hidden items-center gap-2 sm:inline-flex">
              <CheckBadge2 className="h-3.5 w-3.5 text-[var(--accent)]" />
              Verified students only
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {visibleRooms.map((room) => (
              <article key={room.id} className="page-card p-4">
                <div className="flex h-44 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,_rgba(51,65,92,0.42),_rgba(18,214,255,0.08))] text-sm font-semibold text-white/70">
                  {room.imageHint}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{room.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/48">
                      <span>{room.host}</span>
                      <span className="rounded-full border border-[rgba(18,214,255,0.22)] bg-[rgba(18,214,255,0.08)] px-2.5 py-1 font-semibold text-[var(--accent)]">
                        Verified Student
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/66">{room.mode}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[var(--accent)]">{room.price}</span>
                  <span className="text-white/42">{room.dates}</span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                  <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                  {room.campus} • {room.area}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {room.vibeTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/62"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {reactionButtons.map((reaction) => (
                    <button
                      key={reaction.id}
                      type="button"
                      onClick={() => reactToRoom(room.id, reaction.id)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/74 transition hover:bg-white/[0.08]"
                    >
                      {reaction.emoji} {reactionCounts[room.id]?.[reaction.id] ?? 0}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openChat(room)}
                  className="capsule-primary mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
                >
                  Request to Stay
                  <ChevronRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>

      {selectedRoom ? (
        <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.58)]">
          <button type="button" aria-label="Close chat" className="absolute inset-0" onClick={() => setSelectedRoom(null)} />
          <aside
            className="page-card absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-none border-l border-white/10 bg-[rgba(7,10,15,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-swap-chat-title"
          >
            <div className="flex items-start justify-between border-b border-white/8 px-5 py-5">
              <div>
                <p className="section-kicker !px-0 !text-white/32">Request to Stay</p>
                <h2
                  id="room-swap-chat-title"
                  className="mt-2 font-display text-[1.3rem] font-bold tracking-[-0.03em] text-white"
                >
                  {selectedRoom.title}
                </h2>
                <p className="mt-2 text-[13px] text-white/42">
                  Chat with {selectedRoom.host} about dates, vibe, and availability.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 px-5 py-5">
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-white">{selectedRoom.host}</p>
                    <p className="mt-1 text-[11px] text-white/40">
                      {selectedRoom.mode} • {selectedRoom.price}
                    </p>
                  </div>
                  <span className="rounded-full border border-[rgba(18,214,255,0.22)] bg-[rgba(18,214,255,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                    Verified Student
                  </span>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/62">
                  <MessageCircle className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Best for fast campus coordination
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 px-5 py-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.04em] text-white/45">
                  Message
                </span>
                <textarea
                  rows={4}
                  value={chatMessage}
                  onChange={(event) => setChatMessage(event.target.value)}
                  placeholder="Ask about dates, noise level, check-in timing, and house vibe..."
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[rgba(18,214,255,0.35)]"
                />
              </label>

              <button
                type="button"
                className="capsule-primary mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
              >
                <Send className="h-4 w-4" />
                Send Request
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
