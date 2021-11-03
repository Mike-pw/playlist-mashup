# playlist-mashup
Web-App to combine Spotify playlists

Web app that combines Spotify playlists from multiple users, creating a new playlist with equal parts from each input playlist.

This allows people with different tastes to combine their songs in a fair way.

The app was approved for a quota extension by Spotify, so that users can use it outside of development mode.

First the app authorizes the user, and grants a token to make requests to the Spotify API. Then the app grabs the input playlist data from Spotify, extracts the track id's, and combines them into a new track list. A new playlist is created for the user, and the track list is added.

Spotify only allows for 100 tracks per request so the app had to be adjusted to make multiple requests for larger track lists.

Features were also added to automatically add songs that exist in 2 or more input playlists, and prevent duplicates from ending up on the new playlist.
