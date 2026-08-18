import React, { useMemo } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { ensureSfProLoaded, SF_PRO_DISPLAY } from "./sfPro";

ensureSfProLoaded();

const FONT = `"${SF_PRO_DISPLAY}", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`;

const TOTAL_TRACK_SECONDS = 210; // pretend track is 3:30
const START_ELAPSED_SECONDS = 14; // where the "song" appears to already be when the clip starts
const CARD_WIDTH = 680;

export type ExpandedPlayerProps = {
  trackTitle: string;
  artistName: string;
  coverSrc: string;
};

export const ExpandedPlayer: React.FC<ExpandedPlayerProps> = ({
  trackTitle,
  artistName,
  coverSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Real-time progress: advances 1 second per second for the whole clip, no easing, no freeze
  const elapsedSeconds = Math.floor(START_ELAPSED_SECONDS + frame / fps);
  const remainingSeconds = TOTAL_TRACK_SECONDS - elapsedSeconds;
  const progressRaw = elapsedSeconds / TOTAL_TRACK_SECONDS;

  const panel: React.CSSProperties = useMemo(
    () => ({
      width: CARD_WIDTH,
      borderRadius: 34,
      backgroundColor: "rgba(20, 20, 22, 0.22)",
      backdropFilter: "blur(30px) saturate(160%)",
      WebkitBackdropFilter: "blur(30px) saturate(160%)",
      border: "1px solid rgba(255, 255, 255, 0.16)",
      boxShadow:
        "0 16px 50px rgba(0, 0, 0, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
      padding: "22px 26px 24px",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }),
    [],
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Cover art — sharp, opaque, separate block with its own rounding */}
        <Img
          src={coverSrc}
          style={{
            width: CARD_WIDTH,
            height: CARD_WIDTH,
            borderRadius: 26,
            objectFit: "cover",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.3)",
          }}
        />

        {/* Gap between cover and the glass panel */}
        <div style={{ height: 18 }} />

        <div style={panel}>
          {/* specular sheen */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "55%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Equalizer icon, top-right corner — "now playing" indicator */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 26,
              opacity: 0.7,
              zIndex: 1,
            }}
          >
            <EqualizerIcon />
          </div>

          {/* Title + artist, centered */}
          <div
            style={{
              color: "#FFFFFF",
              fontFamily: FONT,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -0.3,
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              zIndex: 1,
            }}
          >
            {trackTitle}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "rgba(255,255,255,0.65)",
              fontFamily: FONT,
              fontSize: 24,
              fontWeight: 400,
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              zIndex: 1,
            }}
          >
            {artistName}
          </div>

          {/* Progress bar with thumb */}
          <div style={{ marginTop: 16, zIndex: 1 }}>
            <Bar progress={progressRaw} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <span>{formatTime(elapsedSeconds)}</span>
              <span>-{formatTime(remainingSeconds)}</span>
            </div>
          </div>

          {/* Controls — back/play/forward clustered & centered, AirPlay pinned to the right edge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 12,
              zIndex: 1,
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 38,
              }}
            >
              <BackIcon />
              <PlayButton />
              <ForwardIcon />
            </div>
            <div style={{ opacity: 0.7 }}>
              <AirPlayIcon />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Bar: React.FC<{ progress: number }> = ({ progress }) => (
  <div style={{ position: "relative", width: "100%", height: 16 }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        height: 10,
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.28)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${progress * 100}%`,
          backgroundColor: "#FFFFFF",
          borderRadius: 5,
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        left: `${progress * 100}%`,
        top: "50%",
        width: 16,
        height: 16,
        borderRadius: "50%",
        backgroundColor: "#FFFFFF",
        transform: "translate(-50%, -50%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    />
  </div>
);

const BackIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <path d="M21 5 L11 12 L21 19 Z" fill="#FFFFFF" />
    <path d="M11 5 L1 12 L11 19 Z" fill="#FFFFFF" />
  </svg>
);

const ForwardIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <path d="M3 5 L13 12 L3 19 Z" fill="#FFFFFF" />
    <path d="M13 5 L23 12 L13 19 Z" fill="#FFFFFF" />
  </svg>
);

const PlayButton: React.FC = () => (
  <svg width="66" height="66" viewBox="0 0 24 24" fill="none">
    <rect x="5.5" y="4" width="5.5" height="16" rx="1.8" fill="#FFFFFF" />
    <rect x="13" y="4" width="5.5" height="16" rx="1.8" fill="#FFFFFF" />
  </svg>
);

const AirPlayIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 16.5A8 8 0 0119 16.5"
      stroke="#FFFFFF"
      strokeWidth="1.7"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M8 19A4.5 4.5 0 0116 19"
      stroke="#FFFFFF"
      strokeWidth="1.7"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="12" cy="21.3" r="1.1" fill="#FFFFFF" />
  </svg>
);

const EqualizerIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="10" width="3.5" height="9" rx="1.2" fill="#FFFFFF" />
    <rect x="10.2" y="5" width="3.5" height="14" rx="1.2" fill="#FFFFFF" />
    <rect x="17.4" y="13" width="3.5" height="6" rx="1.2" fill="#FFFFFF" />
  </svg>
);

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
