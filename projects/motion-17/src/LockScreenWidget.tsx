import React, { useMemo } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

const TOTAL_TRACK_SECONDS = 210; // pretend track is 3:30
const START_ELAPSED_SECONDS = 14; // where the "song" appears to already be when the clip starts

export type LockScreenWidgetProps = {
  trackTitle: string;
  artistName: string;
  coverSrc: string;
};

export const LockScreenWidget: React.FC<LockScreenWidgetProps> = ({
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

  const card: React.CSSProperties = useMemo(
    () => ({
      width: 1000,
      borderRadius: 44,
      backgroundColor: "rgba(20, 20, 22, 0.22)",
      backdropFilter: "blur(30px) saturate(160%)",
      WebkitBackdropFilter: "blur(30px) saturate(160%)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
      boxShadow:
        "0 20px 60px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -16px 30px rgba(255, 255, 255, 0.03)",
      display: "flex",
      flexDirection: "column",
      padding: "36px 40px 28px",
      overflow: "hidden",
      position: "relative",
    }),
    [],
  );

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 380 }}
    >
      <div style={{ position: "relative", width: 1000 }}>
        <div style={card}>
          {/* specular sheen */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Top row: cover + title/artist */}
          <div style={{ display: "flex", alignItems: "center", gap: 26, zIndex: 1 }}>
            <Img
              src={coverSrc}
              style={{
                width: 110,
                height: 110,
                borderRadius: 22,
                objectFit: "cover",
                flexShrink: 0,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  color: "#FFFFFF",
                  fontFamily: FONT,
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: -0.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {trackTitle}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontFamily: FONT,
                  fontSize: 26,
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {artistName}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 30, zIndex: 1 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 6,
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progressRaw * 100}%`,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 3,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <span>{formatTime(elapsedSeconds)}</span>
              <span>-{formatTime(remainingSeconds)}</span>
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 64,
              marginTop: 22,
              zIndex: 1,
            }}
          >
            <BackIcon />
            <PauseIcon />
            <ForwardIcon />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BackIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
    <path d="M19 6 L9 12 L19 18 Z" fill="#FFFFFF" />
    <rect x="5" y="6" width="2.4" height="12" rx="1.2" fill="#FFFFFF" />
  </svg>
);

const ForwardIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
    <path d="M5 6 L15 12 L5 18 Z" fill="#FFFFFF" />
    <rect x="16.6" y="6" width="2.4" height="12" rx="1.2" fill="#FFFFFF" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4.5" height="14" rx="1.5" fill="#FFFFFF" />
    <rect x="13.5" y="5" width="4.5" height="14" rx="1.5" fill="#FFFFFF" />
  </svg>
);

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
