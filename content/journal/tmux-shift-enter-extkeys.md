---
title: "Shift+Enter in tmux, and the Flag Name tmux Silently Ignores"
slug: tmux-shift-enter-extkeys
date: 2026-06-22
summary: "Shift+Enter wouldn't insert a newline in my terminal stack — WezTerm → tmux → pi. The fix was one word in my tmux config. The interesting part is the three keyboard protocols I had to understand to get there, and the naming inconsistency tmux never warned me about: the option is `extended-keys`, the feature flag is `extkeys`, and unknown flags fail silently."
tags: [terminal, tmux, wezterm, debugging, keyboard]
draft: false
---

For weeks, Shift+Enter wouldn't give me a newline in `pi` — the AI coding agent I run inside tmux, inside WezTerm. It would submit the prompt instead, or queue a follow-up, anything except drop down a line. The fix, when it finally came, was one word in my tmux config. The interesting part is how many layers I had to peel back to find that word, and why tmux let me get the name wrong for so long without ever telling me.

## Three protocols, one key

The first thing I had to understand is that "Shift+Enter" is not a key. It is a *negotiation*. A modified key only arrives at an application as a distinct signal if every layer between my finger and the app agrees on a protocol for encoding modifiers. In a modern terminal stack there are three of those protocols, and they are not the same thing:

1. **The Kitty keyboard protocol** — the modern standard. Shift+Enter is encoded as `CSI 13;2u`.
2. **xterm modifyOtherKeys** — the older fallback. Shift+Enter is `CSI 27;2;13~`.
3. **tmux extended-keys** — tmux's own scheme for passing modified keys from the outer terminal through to the panes inside it.

My stack was: finger → WezTerm → tmux → `pi` (or Claude Code). For Shift+Enter to reach `pi` as a newline, WezTerm had to encode it distinctly, tmux had to decode it and re-encode it for the pane, and `pi` had to recognize what arrived. Break the chain at any layer and the modifier gets silently dropped — which is exactly what was happening.

## The WezTerm layer: a legacy hack

WezTerm's config had a binding left over from some older setup:

```lua
{ key = "Enter", mods = "SHIFT", action = wezterm.action.SendString("\x1b\r") },
```

That `\x1b\r` — ESC followed by CR — is a legacy encoding for Shift+Enter. I dug into `pi`'s key parser (`pi-tui/dist/keys.js`) and found the catch: `pi` only treats `\x1b\r` as Shift+Enter when the Kitty keyboard protocol is *active*. When it isn't, `\x1b\r` is interpreted as **Alt+Enter** — "queue a follow-up message." So my Shift+Enter was quietly queuing messages instead of newlineing, because the Kitty protocol was never active in WezTerm. WezTerm defaults to `enable_kitty_keyboard = false`, so `pi`'s protocol query got no response and it fell back to the legacy path where `\x1b\r` means something else entirely.

The fix for the WezTerm layer was to stop fighting the protocol: enable Kitty keyboard natively and delete the legacy binding.

```lua
config.enable_kitty_keyboard = true
-- removed the SendString("\x1b\r") Shift+Enter binding
```

Now WezTerm speaks the Kitty protocol, and `pi` activates it. But the moment I removed the legacy binding, I broke Claude Code. Claude Code had been relying on that `\x1b\r` hack — without it, and with no Kitty negotiation yet, WezTerm sent a plain `\r` for Shift+Enter, and Claude Code submitted the prompt instead of newlineing. For a few minutes both apps were broken, and I'd made things worse.

The save was that WezTerm's config hadn't fully reloaded yet. Once it had, something telling happened: **both** `pi` *and* Claude Code started working in native WezTerm — no tmux. Claude Code hadn't needed the legacy binding after all; it speaks the Kitty protocol on its own, and the `\x1b\r` hack had just been papering over the fact that Kitty was never enabled. With Kitty on, both apps got `CSI 13;2u` natively and recognized it.

That was the narrowing. The bug, which had looked like "Shift+Enter is broken everywhere," was now isolated to exactly one layer: **inside tmux only**. Everything above tmux worked. Everything inside tmux didn't — for both apps. The remaining question was purely what tmux was doing to the key on its way through.

## The tmux layer: a setting that looked correct

The tmux side already had what looked like the right configuration:

```tmux
set -g extended-keys on
set -g extended-keys-format csi-u
```

`extended-keys on` enables tmux's modified-key pass-through. `csi-u` makes tmux re-encode keys to panes in the same CSI-u format `pi` and Claude Code understand. I'd even seen `pi` warn me about exactly these settings on startup. It all checked out. And yet `tmux show -gv extended-keys` happily reported `on`, and Shift+Enter still collapsed to a plain Enter inside every pane.

Here's the part that cost me the most time: `extended-keys on` doesn't mean "on." It means **auto-detect**. tmux only activates the feature if it believes the *outer* terminal advertises support — and it learns that from a separate option called `terminal-features`. Mine was:

```
xterm*:clipboard:ccolour:cstyle:focus:title
screen*:title
rxvt*:ignorefkeys
```

No extended-keys flag anywhere. So "auto-detect" detected nothing, and the feature stayed off regardless of what `extended-keys` said. The setting was honest — it just had nothing to detect.

## The fix that was one word

So I needed to tell tmux that WezTerm supports extended keys. I added:

```tmux
set -as terminal-features ',*:extended-keys'
```

Reloaded. Tested. Still broken. Reloaded again, restarted WezTerm, restarted tmux — the full restart-everything ritual. Still broken.

This is where I stopped guessing and read the binary. `tmux` is a compiled C program, but the strings it embeds are readable:

```bash
$ strings /opt/homebrew/bin/tmux | grep -iE 'kitty|extkeys|extended'
256,RGB,bpaste,clipboard,mouse,strikethrough,title,ccolour,cstyle,extkeys,focus
extended-keys
extkeys
```

There it is. tmux's built-in feature lists — the ones it ships for known terminals like xterm — all use the flag **`extkeys`**, not `extended-keys`. `extended-keys` is the name of the *option*; `extkeys` is the name of the *feature flag*. They refer to the same concept, and tmux uses both names, but in `terminal-features` only the short one is valid. My line had added an unknown flag, and **tmux silently ignored it** — no warning, no error, just a no-op that looked identical to a working setting when I ran `tmux show`.

One word:

```tmux
set -as terminal-features ',*:extkeys'
```

Reloaded, re-attached, and Shift+Enter worked in `pi` and Claude Code, in WezTerm and in tmux. That was the whole fix.

## The full stack, end to end

What the chain looks like now, with one modern protocol carried all the way through instead of a patchwork of legacy escape-string hacks:

| Layer | Setting | Role |
|---|---|---|
| WezTerm | `enable_kitty_keyboard = true` | Encodes Shift+Enter as `CSI 13;2u` |
| tmux | `set -as terminal-features ',*:extkeys'` | Tells tmux the outer terminal supports extended keys |
| tmux | `set -g extended-keys on` | Activates pass-through (now that auto-detect succeeds) |
| tmux | `set -g extended-keys-format csi-u` | Re-encodes keys to panes as `CSI 13;2u` |
| app | `pi` / Claude Code | Recognizes `CSI 13;2u` as Shift+Enter → newline |

The lesson baked into that table: each layer had to be told the *truth* about the layer next to it, using each layer's own vocabulary. WezTerm had to be told to speak Kitty. tmux had to be told WezTerm understands extended keys — using tmux's flag name, not its option name. And the apps had to understand what arrived.

## What I actually learned

The bug wasn't deep. It was a naming inconsistency in a single program: the option is `extended-keys`, the feature flag is `extkeys`, and unknown feature flags fail silently. What made it expensive was that the failure mode was *indistinguishable from success*. `tmux show -gv terminal-features` printed my bogus `*:extended-keys` entry right alongside the real flags, looking for all the world like it had taken effect. The config reloaded without complaint. Every symptom pointed at "something downstream is broken" rather than "this setting never landed."

Two habits I'm going to keep from this:

**Verify the setting took, don't trust the setter.** A reload that exits 0 and a `show` that echoes your value back is not proof the value *means* what you think. The real proof is the downstream effect — in this case, `pi` recognizing the key. When a config "looks right" but nothing changes, the next question isn't "what else could be wrong" but "did this setting actually do anything."

**Read the binary when docs run out.** `strings` on a compiled program is an underrated debugging tool. The feature flag tmux actually checks is right there in its embedded terminal definitions, listed under every terminal tmux already knows about. The man page told me the option; the binary told me the flag. Both were true — they were just different names for the same thing, and only one of them was listening.

The whole stack now runs one modern protocol end to end. And the next time a terminal setting silently does nothing, I'll know to ask whether the name I typed is the name the program is actually checking for.