// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs
// All configuration options: https://remotion.dev/docs/config

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

// Defaults below only apply when a render doesn't pass its own --codec/--pixel-format flags.
// For alpha-channel overlays, render with: --codec=prores --pixel-format=yuva444p10le
// For opaque full-frame scenes, render with: --codec=h264 --pixel-format=yuv420p
Config.setVideoImageFormat("png");
Config.setMuted(true);
Config.overrideWebpackConfig(enableTailwind);
