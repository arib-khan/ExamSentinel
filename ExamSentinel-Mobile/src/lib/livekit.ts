import Constants, { ExecutionEnvironment } from "expo-constants";
import { NativeModules } from "react-native";

/**
 * LiveKit's React Native SDK needs native WebRTC code, which is NOT part of Expo Go.
 * It works in a development build (`npx expo run:android` / EAS "development" profile) or a release build.
 * This loader keeps the rest of the app (login, interview list, details) working in Expo Go and returns null there.
 */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type LK = typeof import("livekit-client") & {
  AudioSession: typeof import("@livekit/react-native").AudioSession;
  VideoTrack: typeof import("@livekit/react-native").VideoTrack;
};
/** True only when the WebRTC native module is really compiled into this app (development build / release build). */
export const hasNativeVideo = (): boolean => !isExpoGo && !!NativeModules.WebRTCModule;

let cached: LK | null | undefined;

export function getLiveKit(): LK | null {
  if (cached !== undefined) return cached;
  if (!hasNativeVideo()) { cached = null; return cached; } // never require() the SDK without its native half: that throws a red-box error
  try {
    // required lazily so a missing native module cannot crash app start-up
    const rn = require("@livekit/react-native") as typeof import("@livekit/react-native");
    const lk = require("livekit-client") as typeof import("livekit-client");
    rn.registerGlobals();
    cached = { ...lk, AudioSession: rn.AudioSession, VideoTrack: rn.VideoTrack } as LK;
  } catch {
    cached = null;
  }
  return cached;
}
