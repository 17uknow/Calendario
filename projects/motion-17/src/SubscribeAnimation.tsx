import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const ROBOTO = '"YouTube Sans", Roboto, "Noto Sans", Arial, sans-serif';

// Animation timeline (in frames, fps defined in Root.tsx) — total 120 frames = 4s @ 30fps
const ENTRANCE_DURATION = 16; // pop-up entrance
const CLICK_FRAME = 40; // subscribe click
const BELL_POP_FRAME = 42; // bell icon pops in right after subscribing
const BELL_CLICK_FRAME = 80; // user taps the bell to activate notifications
const EXIT_START = 102; // shrink-out begins
const EXIT_DURATION = 18;

const PARTICLE_COUNT = 12;
const PARTICLE_COLORS = ["#FFFFFF", "#9FD8FF", "#FFE08A", "#FFFFFF"];

export const SubscribeAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pop-up entrance: smooth scale-in, no bounce — keeps the glass tint constant
  // (opacity is NOT animated here on purpose, so the translucency never shifts)
  const entrance = spring({
    fps,
    frame,
    config: { damping: 26, mass: 0.9 },
    durationInFrames: ENTRANCE_DURATION,
  });
  const entranceScale = interpolate(entrance, [0, 1], [0.4, 1]);

  // Shrink-out exit at the end — same smooth easing, fade only in the last few frames
  const exit = spring({
    fps,
    frame: frame - EXIT_START,
    config: { damping: 26, mass: 0.9 },
    durationInFrames: EXIT_DURATION,
  });
  const exitScale = interpolate(exit, [0, 1], [1, 0.4]);
  const exitOpacity = interpolate(
    frame,
    [EXIT_START + EXIT_DURATION - 4, EXIT_START + EXIT_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const wrapperScale = frame < EXIT_START ? entranceScale : entranceScale * exitScale;
  const wrapperOpacity = frame < EXIT_START ? 1 : exitOpacity;

  // Button press: scale down slightly on click, then settle
  const press = spring({
    fps,
    frame: frame - CLICK_FRAME,
    config: { damping: 14, stiffness: 280, mass: 0.4 },
    durationInFrames: 10,
  });
  const buttonScale = interpolate(press, [0, 0.5, 1], [1, 0.94, 1]);

  // Glass tint transition: dark glass (unsubscribed) -> light glass (subscribed)
  const toSubscribed = interpolate(
    frame,
    [CLICK_FRAME, CLICK_FRAME + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const buttonBg = `rgba(${interpolateColor(toSubscribed, [20, 20, 22], [255, 255, 255])}, ${interpolate(toSubscribed, [0, 1], [0.55, 0.28])})`;
  const textColor = interpolateColor(toSubscribed, [255, 255, 255], [20, 20, 22], true);
  const subscribeLabel = toSubscribed > 0.5 ? "Suscrito" : "Suscribirse";

  // Bell icon pop-in after subscribing
  const bellPop = spring({
    fps,
    frame: frame - BELL_POP_FRAME,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
    durationInFrames: 12,
  });
  const bellScale = interpolate(bellPop, [0, 1], [0, 1]);
  const bellRingRotate = interpolate(
    frame - BELL_POP_FRAME,
    [0, 4, 8, 12, 16],
    [0, -18, 14, -8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Bell tap: just toggles to an "active" state (filled + glow), no menu
  const bellPress = spring({
    fps,
    frame: frame - BELL_CLICK_FRAME,
    config: { damping: 14, stiffness: 280, mass: 0.4 },
    durationInFrames: 8,
  });
  const bellPressScale = interpolate(bellPress, [0, 0.5, 1], [1, 0.86, 1]);
  const bellActive = interpolate(
    frame,
    [BELL_CLICK_FRAME, BELL_CLICK_FRAME + 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const card: React.CSSProperties = useMemo(
    () => ({
      width: 560,
      height: 150,
      borderRadius: 54,
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      backdropFilter: "blur(28px) saturate(180%)",
      WebkitBackdropFilter: "blur(28px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.55)",
      boxShadow:
        "0 12px 40px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -12px 24px rgba(255, 255, 255, 0.08)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 36,
      padding: "0 28px",
      display: "flex",
      overflow: "hidden",
    }),
    [],
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 560,
          height: 150,
          transform: `scale(${wrapperScale})`,
          opacity: wrapperOpacity,
        }}
      >
      <div style={card}>
        {/* top specular highlight, classic liquid glass sheen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "45%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            zIndex: 1,
          }}
        >
          <Img
            src={staticFile("profile-17.png")}
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          />

          <div
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
              fontSize: 32,
              fontWeight: 400,
              color: "#161616",
              letterSpacing: -0.5,
            }}
          >
            17.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginLeft: "auto",
            zIndex: 1,
          }}
        >
          <div style={{ position: "relative" }}>
            <Fireworks triggerFrame={CLICK_FRAME} frame={frame} fps={fps} />
            <div
              style={{
                position: "relative",
                transform: `scale(${buttonScale})`,
                backgroundColor: buttonBg,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.45)",
                borderRadius: 999,
                padding: "19px 32px",
                fontFamily: ROBOTO,
                fontSize: 27,
                fontWeight: 600,
                color: textColor,
                display: "flex",
                alignItems: "center",
                gap: 10,
                whiteSpace: "nowrap",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              {subscribeLabel}
            </div>
          </div>

          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              backgroundColor: `rgba(255,255,255,${interpolate(bellActive, [0, 1], [0.3, 0.55])})`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${bellScale * bellPressScale})`,
              opacity: bellScale,
              boxShadow:
                bellActive > 0.5
                  ? "0 0 0 6px rgba(126, 196, 255, 0.35), inset 0 1px 0 rgba(255,255,255,0.5)"
                  : "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <div style={{ transform: `rotate(${bellRingRotate}deg)` }}>
              <BellIcon active={bellActive > 0.5} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};

const BellIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={active ? "#1F7AE0" : "#161616"}
    />
  </svg>
);

const Fireworks: React.FC<{
  triggerFrame: number;
  frame: number;
  fps: number;
}> = ({ triggerFrame, frame, fps }) => {
  const localFrame = frame - triggerFrame;
  if (localFrame < 0 || localFrame > 26) return null;

  const burst = spring({
    fps,
    frame: localFrame,
    config: { damping: 200 },
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (i % 2 === 0 ? 0.18 : -0.12);
        const distance = interpolate(burst, [0, 1], [0, 60 + (i % 3) * 14]);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const opacity = interpolate(burst, [0, 0.15, 1], [0, 1, 0]);
        const size = 6 + (i % 3) * 2;
        const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity,
              boxShadow: "0 0 6px rgba(255,255,255,0.6)",
              transform: `translate(${x - size / 2}px, ${y - size / 2}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

function interpolateColor(
  t: number,
  from: [number, number, number],
  to: [number, number, number],
  asHex = false,
): string {
  const r = Math.round(interpolate(t, [0, 1], [from[0], to[0]]));
  const g = Math.round(interpolate(t, [0, 1], [from[1], to[1]]));
  const b = Math.round(interpolate(t, [0, 1], [from[2], to[2]]));
  if (asHex) return `rgb(${r}, ${g}, ${b})`;
  return `${r}, ${g}, ${b}`;
}
