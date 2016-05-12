# Audio Stack

This application aims to unify all your audio and video players. It does this by keeping all your currently playing media in a stack and only letting the first item in the stack play.
Once the first media in the stack has finished playing, it will be popped from the stack and the now first item will unpause.

## Current architecture

Proof of concept consisting of a node.js express application that keeps the stack and manages the player-plugins. 

A Chrome addon that detects audio players in all tabs and reports them to the central application using websockets can be found in `src/plugins/chrome/`.

An OS X binary that listens to iTunes and Spotify playback events and reports them via stdout in JSON format can be found in `src/plugins/osx/`.

## Aimed architecture

 * Phoenix backend application with Channels for plugins to connect to.
 * Chrome addon (WIP)
 * OS X plugin (WIP)

### Media player plugins

Plan to support all popular media players first, then offer an API for the community to implement lesser-known ones.

#### MVP
For the minimum viable product I will focus on getting it working in chrome and for iTunes and Spotify.

- [ ] Chrome plugin
   - [x] Youtube.com
   - [ ] play.spotify.com
   - [ ] soundcloud.com
   - [x] vimeo.com
   - [x] Generic HTML5 `<audio>`/`<video>`
- [x] OS X plugin
   - [x] iTunes
   - [x] Spotify