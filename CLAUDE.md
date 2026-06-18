# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI assistants when working with this repository.

## Overview

This is a [Bitfocus Companion](https://bitfocus.io/companion) module that controls **Haivision Makito X4 Decoder** devices over their REST API. Companion is a control-surface application (e.g. for Elgato Stream Deck) and modules like this expose a device's capabilities as **actions**, **feedbacks**, **variables**, and **presets**.

The Makito X4 Decoder hardware exposes **4 independent decoders** (indexed `0`–`3`) plus stream, preset, and preview-service management. The module talks to the device's HTTPS REST API under the `/apis/...` path using cookie-based session authentication.

- **Runtime:** Node.js 22 (`nodejs-ipc` API), declared in `companion/manifest.json`.
- **Module API:** `@companion-module/base` (`~1.11.3`). The instance class extends `InstanceBase`.
- **Package manager:** Yarn 4 (`yarn@4.9.1`, `nodeLinker: node-modules`). **Do not use npm** — `package-lock.json` is gitignored.

## Commands

```bash
yarn install        # Install dependencies (Yarn 4, not npm)
yarn format         # Run Prettier across the repo (config: @companion-module/tools/.prettierrc.json)
yarn package        # Build a distributable .pkg via companion-module-build
```

There is **no test suite and no lint script** beyond Prettier. CI (`.github/workflows/companion-module-checks.yaml`) runs the shared `bitfocus/actions` module-checks workflow on every push, which validates the manifest and builds the package. Before pushing, run `yarn format` to keep formatting consistent.

### Manual / local testing

This module cannot run standalone — it is loaded by a running Companion instance. To test against real hardware you point a Companion dev build at this directory (`DEVELOPER_MODULES_PATH` / "Developer modules path"). Most iteration happens against a physical or networked Makito X4 device; there are no mocks/fixtures in the repo.

## Architecture

The entrypoint is `index.js` (referenced as `../index.js` from `companion/manifest.json`). It defines the `MakitoX4DecoderInstance` class and wires in the definition modules from `src/`.

```
index.js              # Instance class: lifecycle, HTTP layer, polling, data processing
src/actions.js        # setActionDefinitions — user-triggerable commands
src/feedbacks.js      # setFeedbackDefinitions — dynamic button styling (incl. thumbnails)
src/variables.js      # setVariableDefinitions — ~160 variable IDs for display/expressions
src/presets.js        # setPresetDefinitions — ready-made buttons users can drag in
src/upgrades.js       # Upgrade scripts array (currently empty: module.exports = [])
companion/manifest.json   # Module metadata + runtime declaration
companion/HELP.md         # End-user help (placeholder; needs real content)
```

`index.js` ends with `runEntrypoint(MakitoX4DecoderInstance, UpgradeScripts)`, the standard Companion bootstrap.

### Instance lifecycle (`index.js`)

- `init(config)` → sets status `Connecting`, registers actions/feedbacks/variables/presets, then `initConnection()`.
- `configUpdated(config)` → re-runs `initConnection()` with new config.
- `destroy()` → clears the poll timer.
- `getConfigFields()` → connection UI: `host`, `port` (default `443`), `username` (default `admin`), `password`, `polling` (checkbox), `pollInterval` (1–60 s, visible only when polling enabled).

`initConnection()` decides HTTP vs HTTPS (**HTTPS is used only when `port === '443'`**), authenticates if credentials are present, then primes device info, decoder choices, stream list, preset list, and preview settings before starting the poll loop.

### HTTP layer

Two hand-rolled helpers built on Node's `http`/`https` (no fetch/axios):

- `makeRequest(endpoint, method='GET', body=null, skipAuth=false)` — JSON requests. Auto-prefixes the path with `/apis` if missing, sends captured cookies, parses JSON responses, and on `401` clears cookies + `authenticated` flag.
- `makeRequestBinary(endpoint)` — fetches raw image bytes (decoder preview thumbnails), returns a `Buffer`.

Both set `rejectUnauthorized: false` (Makito devices use self-signed certs) and a 5 s timeout.

**Authentication** is cookie-based: `authenticate()` POSTs to `/apis/authentication`; the `SessionID` cookie returned in `set-cookie` is captured by `makeRequest` and replayed on every subsequent call.

### Polling & data flow

When polling is enabled, `startPolling()` runs `getDeviceStatus()` on `pollInterval`. Each poll:

1. Fetches `/apis/status` → system variables (`device_*`, `connection_status`).
2. Loops decoders `0–3`, fetching `/apis/decoders/{i}/stats` and `/apis/decoders/{i}` (config), then calls `processDecoderStatus()` / `processDecoderConfig()`.
3. Uses an internal `presetListCounter` to throttle less-frequent work: preset list every 5th poll, stream list every 3rd, preview settings every 10th, rebuild decoder dropdown choices every 20th, thumbnails every 3rd (for active decoders).
4. Calls `checkFeedbacks()` at the end.

Cached state lives on the instance: `this.decodersStatus`, `this.decodersConfig`, `this.streamList`, `this.streamMap`, `this.streamChoices`, `this.presetList`, `this.presetChoices`, `this.decoderChoices`, `this.decoderThumbnails`, `this.previewSettings`. Feedbacks and action option-lists read from these caches rather than making their own requests.

### Decoder state encoding

`processDecoderStatus()` translates numeric API codes into human-readable strings and exposes both. Key mapping (`stats.state`):

| Code | Meaning |
|------|---------|
| `0`  | Stopped |
| `1`  | Started (No Signal) |
| `2`  | Active (decoding) |
| `-1` | Error (see `troubleCode`) |

Stream state, multisync status, and trouble codes have their own numeric→text maps in the same function. When adding feedbacks/actions that branch on decoder status, compare against these numeric `stats.state` values.

### Variables

`processDecoderStatus()` / `processDecoderConfig()` emit a large flat namespace prefixed **per decoder index**: `decoder0_*`, `decoder1_*`, `decoder2_*`, `decoder3_*` (e.g. `decoder0_state`, `decoder0_stream_name`, `decoder0_video_input_resolution`). System-wide variables (`device_*`, `connection_status`, `preset_*`, `stream_count`, `preview_*`) have no index. Every variable written via `setVariableValues()` **must** have a matching definition in `src/variables.js` (~160 entries) or Companion will warn.

## Conventions

- **Formatting:** Prettier with the `@companion-module/tools` shared config. Tabs for indentation, single quotes, no semicolons (companion-module house style). Run `yarn format` before committing. `package.json` and `LICENSE.md` are in `.prettierignore`.
- **Definition modules** export a single function that receives the instance (`self`) and calls the corresponding `self.setXxxDefinitions(...)`. `feedbacks.js` and `variables.js` export `async` functions; `actions.js`/`presets.js` are sync.
- **Decoder dropdowns:** actions and feedbacks share a `deviceNumberOption` dropdown whose `choices` come from `self.decoderChoices` (built from live device names, falling back to `Decoder 1`–`Decoder 4`). Re-registering definitions (`self.updateActions()` / `self.updateFeedbacks()`) is how the module refreshes those dropdown choices after the device responds.
- **IDs are 0-based internally, 1-based in labels.** Decoder index `0` is shown to users as "Decoder 1"; code frequently computes `displayNum = parseInt(deviceNum) + 1` for log messages.
- **Logging:** use `self.log('debug'|'info'|'warn'|'error', ...)`. Debug logging is verbose throughout the HTTP and thumbnail paths.
- **Status:** report connection health with `this.updateStatus(InstanceStatus.Ok | Connecting | ConnectionFailure | BadConfig, message?)`.
- **Destructive actions** (`reboot_device`, `delete_stream`, `delete_system_preset`) gate execution behind a `confirm` checkbox option and no-op (with a `warn` log) when unchecked. Preserve this pattern for any new destructive action.
- **Preset name handling:** preset actions auto-append `.cfg` if the user omits it.
- **Thumbnails** are fetched as JPEG/PNG via `makeRequestBinary`, resized with `jimp` to fit 72×72, stored base64 in `this.decoderThumbnails[i]`, and surfaced through the `decoder_thumbnail` advanced feedback as `{ png64: ... }`.

## Adding capabilities

- **New action:** add an entry to the object passed to `self.setActionDefinitions(...)` in `src/actions.js`. Use `deviceNumberOption` for decoder targeting; call `self.makeRequest(...)` and log success/failure; refresh affected caches via `setTimeout(() => self.getDeviceStatus()/getStreamList(), 1000)` after mutations.
- **New feedback:** add to `src/feedbacks.js`. Read from cached state (`self.decodersStatus`, etc.), not fresh requests. Use `type: 'boolean'` for style-toggle feedbacks and `type: 'advanced'` for computed styles / images.
- **New variable:** define it in `src/variables.js` **and** write it via `setVariableValues()` in the relevant `process*`/`get*` method in `index.js`. Keep the `decoderN_` prefix for per-decoder values.
- **New preset:** push a button definition in `src/presets.js`.
- **Schema migrations:** if config field names/shapes change between releases, add an upgrade script to the array in `src/upgrades.js` (currently empty).

## Known inconsistencies (treat as latent bugs, not patterns to copy)

These exist in the current code; be aware of them and prefer fixing over imitating:

- **Preset variable references use a `makitox4:` namespace and non-existent variable IDs** (e.g. `$(makitox4:decoder_state)`, `decoder_signal`, `device_name`, `decoder_resolution`, `decoder_latency`). The actual module connection label and the defined variables use the indexed `decoderN_*` scheme, so several presets in `src/presets.js` will render empty until reconciled.
- **Some preset/preset-feedback `status` options use string values** (`'running'`, `'stopped'`, `'error'`) while the `decoder_status` feedback compares against numeric state codes (`0/1/2/-1`). String options won't match.
- `select_decoder_source` reads `self.config.deviceNumber`, which is not a configured field (always falls back to `'1'`).
- `getPreviewSettings()` writes `preview_service`/`preview_port`/`preview_quality`, but `src/variables.js` defines `preview_enabled` — names don't line up.

When touching presets/feedbacks/variables, prefer aligning everything on the indexed `decoderN_*` variable scheme and numeric state codes.

## Git & workflow notes

- Default branch is `main`. Do not push directly to it without explicit permission; develop on a feature branch and push there.
- CI runs on every push via the shared bitfocus module-checks workflow — keep `companion/manifest.json` valid (id, runtime type `node22`, entrypoint `../index.js`).
- Dependabot updates npm dependencies daily (`.github/dependabot.yml`).
- Bump `version` in **both** `package.json` and `companion/manifest.json` together when releasing.
- **Releasing:** the full process (version bump → tag `vX.Y.Z` → submit in the Bitfocus Developer Portal) lives in [`RELEASING.md`](./RELEASING.md). Planned work is tracked in [`ROADMAP.md`](./ROADMAP.md).
