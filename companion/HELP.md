# Haivision Makito X4 Decoder

This module controls **Haivision Makito X4 Decoder** devices through their REST API. A single Makito X4 Decoder exposes **four independent decoders**, plus stream, system-preset, and preview-service management — all of which this module can drive from Companion buttons.

## Requirements

- A Haivision Makito X4 Decoder reachable on your network.
- The device's IP address and a user account (the default administrative account is `admin`).
- The device's web/REST interface enabled (HTTPS on port `443` by default).

## Configuration

When you add a connection, fill in the following fields:

| Field | Description |
|-------|-------------|
| **Device IP** | IP address of the decoder. |
| **Port** | API port. Defaults to `443`. The module uses **HTTPS when the port is `443`** and HTTP otherwise. Self-signed device certificates are accepted automatically. |
| **Username** | API username (default `admin`). |
| **Password** | API password. |
| **Enable Polling** | When enabled, the module periodically refreshes device/decoder status so variables and feedbacks stay current. |
| **Poll Interval (seconds)** | How often to poll (1–60 s, default 5). Only shown when polling is enabled. |

The connection status indicator turns green once the module authenticates and reads the device status successfully. Authentication is session-cookie based; if the session expires the module reports a connection failure and you may need to reconnect.

> **Note:** Throughout the module, decoders are shown as **Decoder 1–4** but map to the device's internal indices **0–3**. Where a device decoder has been given a custom name, that name appears in the dropdowns.

## Actions

**Decoder control**
- **Decoder Start / Stop / Toggle / Restart** — start, stop, toggle, or restart the selected decoder.
- **Select Decoder Source** — set a decoder's source (Network / SRT / RTSP) by URL or address.
- **Assign Stream to Decoder / Unassign Stream from Decoder** — attach or detach a configured stream.
- **Configure Decoder Preview** — set the preview thumbnail interval and size for a decoder.
- **Fetch Decoder Thumbnail (Test)** — manually pull a decoder preview thumbnail.

**Stream management**
- **Create Stream** — create a stream (TS over UDP/RTP/SRT, or RTSP), with SRT mode and latency options.
- **Edit Stream** — change a stream's name, address, or port.
- **Delete Stream** — remove a stream (requires the **Confirm Delete** checkbox).

**System presets** (device configuration snapshots, stored as `.cfg` files on the device)
- **Save / Load / Delete / Rename / Duplicate System Preset**, **Set Startup Preset**, and **Set Preset Autosave**. Preset names automatically get a `.cfg` extension if omitted. Delete requires confirmation.

**Device & service**
- **Enable Preview Service** — turn the device's preview service on or off.
- **Reboot Device** — reboot the decoder (requires the **Confirm Reboot** checkbox).
- **Custom API Call** — send an arbitrary `GET`/`POST`/`PUT`/`DELETE` request to any `/apis/...` endpoint with an optional JSON body (advanced/diagnostic use).

## Feedbacks

- **Decoder Status** — turns a button a chosen color when a decoder is in a selected state (Stopped / Started-No Signal / Active / Error).
- **Decoder State Color** — automatically colors a button by decoder state (grey = stopped, yellow = no signal, green = active, red = error).
- **Decoder Signal Present** — active when the decoder is receiving and decoding a stream.
- **Decoder Has Error** — active when the decoder is in an error state.
- **Connection Status** — active while the module is connected to the device.
- **Decoder Thumbnail** — shows the decoder's live preview image as the button background.

## Variables

The module exposes a large set of variables. System-wide variables (no index) include `connection_status`, `device_type`, `device_serial`, `device_version`, `device_temperature`, `device_uptime`, `preset_active`, `stream_count`, and `preview_service`.

Per-decoder variables are prefixed `decoder0_` … `decoder3_` (Decoder 1–4), for example:
`decoder0_state`, `decoder0_signal`, `decoder0_stream_name`, `decoder0_video_input_resolution`, `decoder0_video_framerate`, `decoder0_video_latency`, `decoder0_stream_bitrate`, and many audio/HDR/metadata fields.

Reference a variable in button text with `$(connection-label:variable_name)` (the connection label is the name you gave this connection in Companion).

## Presets

Ready-made buttons are provided under these categories: **Decoder Control**, **Decoder Status**, **Decoder Thumbnails** (one per decoder), **System**, and **Status**. Drag them onto a page as a starting point and adjust the decoder selection as needed.

## Troubleshooting

- **Connection fails / "Authentication failed":** verify the IP, port, username, and password, and that the device's API is reachable. The module accepts self-signed certificates automatically.
- **Variables show blank or stale:** ensure **Enable Polling** is on; increase the poll interval if the device is heavily loaded.
- **No thumbnails:** thumbnails are fetched only periodically and primarily for active decoders. Use **Fetch Decoder Thumbnail (Test)** to pull one on demand, and make sure the device's preview service is enabled.

For issues or feature requests, see the [project issue tracker](https://github.com/justinlauffer/companion-module-haivision-makitox4-decoder/issues).
