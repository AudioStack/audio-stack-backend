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

### API

Media player plugins will connect to the central application via WebSockets, to allow browser plugins to work with the system.

The API will follow the suggestions given in the [A JSON event-based convention for WebSockets](https://www.new-bamboo.co.uk/blog/2010/02/10/json-event-based-convention-websockets/) article.

#### `media_join`

Plugin -> Application

Sent when a media player opened a new media that is possible to remotely control.

```json
{
  "id": "<new UUID>",
  "title": "All Night",
  "artist": "Parov Stelar",
  "album": "All Night",
  "cover": "<base64 encoded image>",
}
``` 

#### `media_state`

Plugin -> Application

Sent when a media player changes playback state

```json
{
  "state": "<PLAYING|PAUSED|FINISHED|BUFFERING>"
}
```

Application -> Plugin

Sent when the application wants to manage playback state

```json
{
  "state": "<PLAYING|PAUSED|FINISHED>"
}
```

#### `media_progress`

Plugin -> Application

Sent when the media playback position changes (preferably sent once per second)

```json
{
  "seek": 15000,
  "total": 60000
}
```

*seek*: Playback position in milliseconds
*total*: Total length of the current title

