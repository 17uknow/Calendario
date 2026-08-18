import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const disappearBeforeEnd = 20;

export const LocationPill: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: {
      damping: 200,
      mass: 0.7,
    },
  });

  const out = spring({
    fps,
    frame: frame - durationInFrames + disappearBeforeEnd,
    config: {
      damping: 200,
    },
    durationInFrames: disappearBeforeEnd,
  });

  const translateYIn = interpolate(enter, [0, 1], [40, 0]);
  const opacityIn = interpolate(enter, [0, 1], [0, 1]);
  const translateYOut = interpolate(out, [0, 1], [0, 30]);
  const opacityOut = interpolate(out, [0, 1], [1, 0]);

  const container: React.CSSProperties = useMemo(
    () => ({
      position: "absolute",
      bottom: 110,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      opacity: opacityIn * opacityOut,
      translate: `0 ${translateYIn + translateYOut}px`,
    }),
    [opacityIn, opacityOut, translateYIn, translateYOut],
  );

  const pill: React.CSSProperties = {
    backgroundColor: "rgba(15, 15, 18, 0.4)",
    backdropFilter: "blur(20px) saturate(150%)",
    WebkitBackdropFilter: "blur(20px) saturate(150%)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: 999,
    padding: "22px 48px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
  };

  const label: React.CSSProperties = {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 42,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: "#FFFFFF",
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill>
      <div style={container}>
        <div style={pill}>
          <div style={label}>{text}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
