# Audio Stack

This application aims to unify all your audio and video players. It does this by keeping all your currently playing media in a stack and only letting the first item in the stack play.
Once the first media in the stack has finished playing, it will be popped from the stack and the now first item will unpause.

## Aimed architecture

Angular.js webapp inside the electron wrapper for UI, internal JavaScript model.

WebSockets for plugins

### Media player plugins

Plan to support all popular media players first, then offer an API for the community to implement lesser-known ones.

 * Webbrowser plugins (Chrome, Firefox, Safari)
   * Youtube.com
   * play.spotify.com
   * soundcloud.com
   * vimeo.com
   * Generic HTML5 `<audio>`/`<video>`
 * iTunes
 * Spotify
 * VLC

### API

Media player plugins will connect to the central application via WebSockets, to allow browser plugins to work with the system.

The API will follow the suggestions given in the [A JSON event-based convention for WebSockets](https://www.new-bamboo.co.uk/blog/2010/02/10/json-event-based-convention-websockets/) article.

#### `media_join`

Plugin -> Application

Sent when a media player opened a new media that is possible to remotely control.

```json
{
  "id": "ca2d47b5-f543-41d6-ab77-2f71ab9e7099",
  "title": "All Night",
  "artist": "Parov Stelar",
  "album": "All Night",
  "cover": "<base64 encoded image>",
}
``` 

`id`: new random UUID with which the media is identified henceforth

`title`: Name of the track

`artist`: Person who created the track, or `null`

`album`: Name of the album, or `null`

`cover`: Base64-encoded image file, or `null`

#### `media_state`

Plugin -> Application

Sent when a media player changes playback state

```json
{
  "id": "ca2d47b5-f543-41d6-ab77-2f71ab9e7099",
  "state": "PAUSED"
}
```

`id`: UUID of the track

`state`: One of `PLAYING`, `PAUSED`, `BUFFERING`, `STOPPED`. Emit `STOPPED` when a track has finished and there's no further track in the playlist.

Application -> Plugin

Sent when the application wants to manage playback state

```json
{
  "id": "ca2d47b5-f543-41d6-ab77-2f71ab9e7099",
  "state": "PLAY"
}
```

`id`: UUID of the track

`state`: One of `PLAY`, `PAUSE`, `SKIP`, `PREV`

#### `media_progress`

Plugin -> Application

Sent when the media playback position changes (preferably sent once per second)

```json
{
  "id": "ca2d47b5-f543-41d6-ab77-2f71ab9e7099",
  "seek": 15000,
  "total": 60000
}
```

`id`: UUID of the track

`seek`: Playback position in milliseconds

`total`: Total length of the current title

