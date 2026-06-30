# Roadmap

This is a living roadmap for the **Haivision Makito X4 Decoder** Companion module. It is intentionally pragmatic: the near-term focus is hardening the existing `1.0.0` code into a clean, store-ready release, followed by feature growth. Items are grouped by milestone, not hard-committed dates.

For how versions are cut and published, see [`RELEASING.md`](./RELEASING.md). For architecture and conventions, see [`CLAUDE.md`](./CLAUDE.md).

Status legend: 🔴 not started · 🟡 in progress · ✅ done

---

## v1.0.x — Stabilization & first store release

Goal: a correct, documented build that passes the Bitfocus `module-checks` and is submitted to the module store. These are mostly bug fixes and release-readiness, so they ship as patch releases.

- ✅ **Write real `companion/HELP.md`.** Documents the connection fields and the action/feedback/variable/preset groups.
- ✅ **Fix preset variable references.** Presets in `src/presets.js` now point at the real indexed variables (`decoder0_state`, `decoder0_video_input_resolution`, `decoder0_video_latency`, `decoder0_signal`, `device_type`, `device_serial`).
- ✅ **Fix status option types.** Preset `decoder_status` feedbacks now use the numeric state codes (`2` active, `0` stopped, `-1` error) the feedback actually compares against.
- ✅ **Fix `select_decoder_source`.** Now uses the action's `deviceNumber` dropdown instead of the non-existent `self.config.deviceNumber`.
- ✅ **Reconcile preview variables.** `src/variables.js` now defines `preview_service` / `preview_port` / `preview_quality` to match what `getPreviewSettings()` writes.
- 🔴 **Register module + submit `1.0.1` to the store** following [`RELEASING.md`](./RELEASING.md).

---

## v1.1 — Feature expansion

Goal: broaden device control beyond start/stop and stream/preset management. All additive (minor version).

- 🔴 **Per-decoder presets for all 4 decoders.** Generate the decoder-control / status presets per decoder index (currently several presets are hardcoded to decoder `0`).
- 🔴 **Output configuration actions.** Video output format / resolution / display format and HDMI output controls exposed by the device API.
- 🔴 **Audio output routing.** Actions for audio pair selection / output layout, surfacing the audio variables already collected in `processDecoderStatus()`.
- 🔴 **Threshold feedbacks.** Boolean feedbacks for low/zero bitrate, high latency, dropped/corrupted-frame growth, and temperature — driven by the variables already polled.
- 🔴 **Richer stream creation.** SRT passphrase / encryption, FEC, and source-specific options in `create_stream` / `edit_stream`.
- 🔴 **Promote the "Test" thumbnail action** out of testing state, and make thumbnail fetch cadence/size configurable.

---

## v1.2 — Robustness & connection handling

Goal: make the module resilient against long-running sessions and varied deployments.

- 🔴 **Automatic re-authentication.** On HTTP 401 the module clears its session cookie; add automatic re-login + retry so polling recovers without a manual reconnect.
- 🔴 **Decouple HTTPS from port.** HTTPS is currently selected only when `port === '443'`. Add an explicit "Use HTTPS" config toggle so non-standard ports work over TLS.
- 🔴 **Reconnect/backoff strategy.** Replace silent poll failures with a bounded backoff and clear `InstanceStatus` transitions.
- 🔴 **Polling efficiency.** The status poll issues many sequential requests per cycle (4 decoders × stats+config, plus per-stream lookups). Parallelize and/or make per-section cadence configurable to reduce device load.

---

## Backlog / future ideas

Not scheduled; candidates pending interest.

- 🔴 **Unit tests** for the pure mapping logic (state/stream-state/trouble-code/encapsulation → text). These need no hardware and would guard against regressions.
- 🔴 **TypeScript migration** in line with newer `@companion-module/tools` tooling and ESLint v9 config.
- 🔴 **Optional ESLint** via `generateEslintConfig` from `@companion-module/tools` (currently only Prettier is configured).
- 🔴 **Companion Makito X4 _Encoder_ module** as a separate `companion-module-*` repo, sharing patterns with this decoder module.
- 🔴 **Discovery / NMOS** support if the device exposes it.

---

## Contributing to the roadmap

Have a request or a correction? Open an issue on the [tracker](https://github.com/bitfocus/companion-module-haivision-makito-x4-decoder/issues). When picking up an item, follow the conventions in [`CLAUDE.md`](./CLAUDE.md) and the release flow in [`RELEASING.md`](./RELEASING.md).
