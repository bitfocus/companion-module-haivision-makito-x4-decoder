# Releasing

This document describes how to release a new version of this module and get it published in the **Bitfocus Companion module store**. It follows the official Bitfocus process for [releasing a Companion module](https://github.com/bitfocus/companion-module-base/wiki) so this module stays consistent with the wider ecosystem.

> TL;DR: bump the version → merge to `main` with CI green → push a `vX.Y.Z` git tag → submit the version in the **Bitfocus Developer Portal**.

## How Companion modules are distributed

Each Companion module lives in its own `companion-module-*` GitHub repository (this one is `companion-module-haivision-makitox4-decoder`). Modules are **not** published to npm. Instead:

1. A git **tag** (`vX.Y.Z`) marks a release commit.
2. CI (`bitfocus/actions` reusable `module-checks` workflow) validates and packages the module on every push, and compares `package.json`'s version against the tag on a tagged build.
3. The maintainer **submits the version** through the [Bitfocus Developer Portal](https://developer.bitfocus.io/), which pulls the tagged build, reviews it, and lists it in the in-app module store users browse from Companion.

## One-time setup (first release only)

Before the very first store release, the module must be registered with Bitfocus:

1. Join the [Bitfocus Companion Discord](https://bitfocus.io/companion) and post in **#module-development** with your GitHub username and the module name in `manufacturer-product` format — here: **`haivision-makitox4-decoder`**.
2. Once registered, sign in to the [Developer Portal](https://developer.bitfocus.io/) with GitHub. The module will appear under **My Connections**.

The repository itself already satisfies the structural requirements the CI enforces (see the checklist below).

## Versioning (semantic versioning)

Use `major.minor.patch`:

| Bump   | When                                                                                          |
|--------|-----------------------------------------------------------------------------------------------|
| patch  | Bug fixes, no new functionality (e.g. `1.0.0` → `1.0.1`).                                      |
| minor  | New backward-compatible actions / feedbacks / variables / presets (e.g. `1.0.1` → `1.1.0`).   |
| major  | Breaking changes to config field names/shapes — **requires an upgrade script** (see below).   |

**Keep the version in sync in both files:** `package.json` and `companion/manifest.json`. The git tag must match (`v` + the `package.json` version).

If a release renames or restructures config fields, add an upgrade script to the array in `src/upgrades.js` so existing users' configurations migrate automatically. That array is currently empty (`module.exports = []`).

## Pre-release checklist

The CI `module-checks` workflow gates most of these; the rest are quality bars we hold ourselves to.

**Enforced by CI (`bitfocus/actions` module-checks):**
- [ ] Repo named `companion-module-*` and `manifest.json` `id` matches the repo name without that prefix (`haivision-makitox4-decoder`). ✅ already true
- [ ] No leftover template placeholder text in the manifest.
- [ ] `manifest.json` has a non-empty `products` list, `runtime.apiVersion` is `"0.0.0"`, `runtime.type` is `node22`, and `entrypoint` resolves (`../index.js`). ✅ already true
- [ ] `companion/HELP.md` exists. ✅ exists — **but currently placeholder text; write real help before release** (see roadmap).
- [ ] Yarn is used (no `package-lock.json`; that path is gitignored). ✅
- [ ] The packaged module loads/launches (CI runs `companion-module-build` and boots it).
- [ ] On a tagged build, `package.json` version equals the tag.

**Our own quality bar:**
- [ ] `yarn format` produces no changes.
- [ ] `yarn package` succeeds locally.
- [ ] Tested against a real (or networked) Makito X4 Decoder.
- [ ] `companion/HELP.md` describes config fields and notable actions.
- [ ] Roadmap / changelog notes updated for user-visible changes.

## Release steps

```bash
# 1. Start from an up-to-date main on a release branch
git checkout main && git pull
git checkout -b release/vX.Y.Z

# 2. Bump the version in BOTH files to X.Y.Z
#    - package.json            "version": "X.Y.Z"
#    - companion/manifest.json "version": "X.Y.Z"

# 3. Update companion/HELP.md and any changelog notes, then format
yarn format

# 4. Verify the package builds
yarn package

# 5. Commit, push, open a PR, and get CI green + review, then merge to main
git commit -am "Release vX.Y.Z"
git push -u origin release/vX.Y.Z
```

Once merged to `main`:

```bash
# 6. Tag the release commit on main and push the tag
git checkout main && git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

(Equivalently, create a **GitHub Release** with tag `vX.Y.Z` — this creates and pushes the tag for you and is the recommended path because it also produces release notes.)

7. **Submit the version** in the [Developer Portal](https://developer.bitfocus.io/): sign in with GitHub → **My Connections** → select this module → **Submit Version** at the bottom of the page.

8. Bitfocus reviews the submission and publishes it to the module store. The new version then appears in users' Companion module lists.

## CI reference

- Workflow: `.github/workflows/companion-module-checks.yaml` calls `bitfocus/actions/.github/workflows/module-checks.yaml@main`.
- It runs on every `push`. To download the built `.pkg` as a workflow artifact (handy for sharing a test build), uncomment the `with: upload-artifact: true` line in that workflow.
- The workflow also supports a `prerelease` flag for beta builds; the Developer Portal can host beta versions for testing before a stable release.

## After releasing

- Verify the new version appears and installs cleanly from within Companion.
- Open the next development cycle by reviewing [`ROADMAP.md`](./ROADMAP.md).
