# Live interview: setup, testing and troubleshooting

## 1. Why LiveKit
Real-time video needs WebRTC. Building signalling and media servers yourself is large and risky, so the app uses **LiveKit**:
open source, a managed cloud with a free tier (check the current limits on their pricing page), or self-hosted with one Docker command.
It supports several publishers in one room (HR, candidate, workspace camera as separate feeds), per-participant rights enforced by the server,
automatic reconnection, a browser SDK and a React Native SDK. Your **API key and secret stay on the backend**: the apps only ever receive a
10-minute join token for one room.

## 2. Configuration
Backend `.env`:
| Variable | Meaning |
|---|---|
| `LIVEKIT_URL` | `wss://<project>.livekit.cloud` (cloud) or `ws://localhost:7880` (self-hosted) |
| `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | cloud.livekit.io → your project → Settings → Keys |
| `FRONTEND_URL` | public address of the web app, used in invitation links |
| `LIVEKIT_TOKEN_TTL` | seconds a join token lives (default 600) |
| `LIVE_JOIN_EARLY_MINUTES` / `LIVE_HOST_EARLY_MINUTES` / `LIVE_OVERRUN_MINUTES` | when the room opens for candidate / HR, and the grace after the end before an unstarted interview expires (10 / 60 / 30) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | optional, for e-mail invitations (needs `npm install nodemailer`) |

Self-hosted quick start for testing: `docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp -e LIVEKIT_KEYS="devkey: secret" livekit/livekit-server --dev`
then `LIVEKIT_URL=ws://localhost:7880`, key `devkey`, secret `secret`. (Phones on your network need your PC's IP and open ports; the cloud is simpler.)

Mobile `.env`: only `EXPO_PUBLIC_API_URL=http://<your PC's IP>:3001`. No video keys are ever put in the app.

## 3. Database
Supabase SQL Editor, in order: `001_live_interview_schema.sql`, `002_live_interview_permissions.sql` (both safe to re-run).
They add `live_interviews`, `live_interview_sessions`, `live_interview_events`, the `Candidate` role (id 6) and two permission modules:
`live_interviews` (HR) and `live_interview_portal` (candidate). The old Q&A tables are not used any more; to delete them and their data run the
**optional, destructive** `003_OPTIONAL_drop_old_qa_interview.sql`.

## 4. Test plan: one laptop and two phones
**A. Everything on one computer (fastest, no phone needed).** `localhost` counts as a secure page, so cameras work.
1. Chrome with fake cameras (no real webcam needed; optional): `chrome.exe --use-fake-device-for-media-stream --use-fake-ui-for-media-stream`
2. Tab 1: `http://localhost:5173/login` as `Admin@sysassist.com` → *Live Interviews* → **HR Round – Backend Developer** → *Start* → *Start interview*.
3. Tab 2: login as `candidate1@examsentinel.test` → *Interviews* → *Join* → tick the consent box → *Join interview*.
4. Tab 3: same candidate → the interview → *Use this phone as monitoring camera* → consent → *Start monitoring camera*.
5. In Tab 1 you see the candidate's face and, beside it, the workspace camera; the connection panel shows both connected. Press *Mute* / *Camera off*;
   close Tab 3 and watch "Workspace: not connected"; press *End interview* and see Tabs 2 and 3 show the ended screen.
(Each tab keeps its own login, so three tabs can be three different people.)

**B. Laptop + one real phone (browser).** Phone browsers need **https**. That means the web app must be served over https **and** reach a backend over https
(a plain http backend is blocked from an https page). Either deploy both, or tunnel both (e.g. Cloudflare quick tunnels), set `VITE_API_BASE_URL` to the backend tunnel,
and add `server: { allowedHosts: true }` to `vite.config.js` for the dev tunnel. Then on the phone open `/candidate/live-interviews/<id>/monitor` and sign in.

**C. Laptop + phone running the ExamSentinel app (the intended setup).**
1. Build the development app once (section 5), install it on the phone.
2. `npx expo start --dev-client`, open the app, sign in as the candidate (same phone Wi-Fi as your PC, `EXPO_PUBLIC_API_URL` = your PC's IP).
3. Laptop: HR starts the interview (tab 1) and the candidate joins (tab 2) as in A.
4. Phone: *Interviews → the interview → Use this phone as monitoring camera* → consent → lean the phone behind the laptop. HR sees the workspace feed.
   Plug the phone in and keep the screen on.

## 5. Building the phone app (development build)
Expo Go cannot run WebRTC, so a build that contains the native video module is required.
* **Cloud build, no Android Studio:** `npx eas-cli login` → `npx eas build --profile development --platform android` → install the APK from the link → `npx expo start --dev-client`.
* **Local build:** Android Studio + SDK installed → `npx expo run:android` (iOS: `npx expo run:ios` on a Mac).
`app.json` already declares the camera/microphone permissions and the LiveKit/WebRTC config plugins; `eas.json` has the `development` profile.
In Expo Go the app still works for login, the interview list and details, and tells the user that video needs the development build.

## 6. Troubleshooting
| Symptom | Cause / fix |
|---|---|
| `503 LIVEKIT_NOT_CONFIGURED` when joining | The three `LIVEKIT_*` variables are missing in the backend `.env` (restart the backend after editing). |
| `502 LIVEKIT_UNAVAILABLE` | Backend cannot reach `LIVEKIT_URL` (wrong URL, no internet, self-hosted server down). |
| `409 TOO_EARLY` | The room opens 10 min before the start for candidates (60 min for HR). |
| "Permission denied" | Allow camera/microphone in the browser address bar or the phone's app settings, then press Retry. |
| Phone browser: camera blocked | The page is not https. Use https, or the app. |
| Candidate never sees the Join button | Interview is cancelled/expired, or logged in as another user; the list refreshes every 30 s. |
| "Workspace: not connected" although the phone is on | Phone slept or app went to background; reopen it. Same account must be used on the phone. |
| Mobile login works but nothing loads | `EXPO_PUBLIC_API_URL` must be your PC's IP (not `localhost`), same Wi-Fi, firewall allows Node on private networks; restart with `npx expo start -c`. |
| No sound | Browser blocked autoplay: press *Enable sound* in the banner. Use headphones to avoid echo. |
