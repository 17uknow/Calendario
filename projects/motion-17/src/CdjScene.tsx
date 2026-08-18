import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FONT = '"YouTube Sans", Roboto, "Helvetica Neue", Arial, sans-serif';

// Pixel coordinates measured on the base photo (625 x 717)
const BASE_W = 625;
const BASE_H = 717;
const SCREEN = { x: 159, y: 90, w: 325, h: 200 };

const WAVEFORM_BAR_COUNT = 90;

export type CdjSceneProps = {
  trackTitle: string;
  artistName: string;
  coverSrc: string;
  bpm: number;
};

export const CdjScene: React.FC<CdjSceneProps> = ({
  trackTitle,
  artistName,
  coverSrc,
  bpm,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Decorative playhead: sweeps once across the whole clip duration, looping
  const playProgress = (frame % durationInFrames) / durationInFrames;

  const elapsedSeconds = playProgress * 180; // pretend the track is 3:00
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = Math.floor(elapsedSeconds % 60);
  const millis = Math.floor((elapsedSeconds % 1) * 1000);
  const timeLabel = `${pad(minutes)}:${pad(seconds)}.${String(millis).padStart(3, "0")}`;

  const bars = useMemo(() => generateWaveform(WAVEFORM_BAR_COUNT), []);

  return (
    <AbsoluteFill style={{ width: BASE_W, height: BASE_H }}>
      <Img
        src={staticFile("cdj-3000-clean.png")}
        style={{ width: BASE_W, height: BASE_H }}
      />

      {/* Screen content */}
      <div
        style={{
          position: "absolute",
          left: SCREEN.x,
          top: SCREEN.y,
          width: SCREEN.w,
          height: SCREEN.h,
          backgroundColor: "#0A0C10",
          display: "flex",
          flexDirection: "column",
          padding: "8px 10px",
          overflow: "hidden",
        }}
      >
        {/* Top row: cover thumb + title/artist + bpm */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Img
            src={coverSrc}
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.15,
            }}
          >
            <div
              style={{
                color: "#FFFFFF",
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {trackTitle}
            </div>
            <div
              style={{
                color: "#8A93A1",
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {artistName}
            </div>
          </div>
          <div
            style={{
              color: "#FFFFFF",
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {bpm.toFixed(1)} <span style={{ color: "#8A93A1", fontSize: 9 }}>BPM</span>
          </div>
        </div>

        {/* Waveform */}
        <div
          style={{
            flex: 1,
            marginTop: 8,
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Waveform bars={bars} progress={playProgress} />
          <div
            style={{
              position: "absolute",
              left: `${playProgress * 100}%`,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
          />
        </div>

        {/* Bottom row: time */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {timeLabel}
          </div>
          <div
            style={{
              color: "#8A93A1",
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            +0.0%
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Waveform: React.FC<{ bars: number[]; progress: number }> = ({
  bars,
  progress,
}) => {
  const playedIndex = Math.floor(progress * bars.length);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
        height: "100%",
      }}
    >
      {bars.map((h, i) => {
        const played = i <= playedIndex;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              backgroundColor: played ? "#3EA6FF" : "#FFA63E",
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
};

function generateWaveform(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const v =
      0.35 +
      0.25 * Math.abs(Math.sin(t * Math.PI * 9.3)) +
      0.2 * Math.abs(Math.sin(t * Math.PI * 23.7 + 1.3)) +
      0.15 * Math.abs(Math.sin(t * Math.PI * 5.1 + 0.4));
    bars.push(Math.min(1, v));
  }
  return bars;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
