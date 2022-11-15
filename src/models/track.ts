import { Artist } from "@/models/artist";
import { SpotifyTrack } from "@/typings/spotify";

export class Track {
  constructor(
    public id: string,
    public name: string,
    public artists: Artist[],
    public cover: string,
    public url: string,
    public preview: string
  ) {}

  static fromSpotify(track: SpotifyTrack): Track {
    return new Track(
      track.id,
      track.name,
      track.artists.map(Artist.fromSpotify),
      track.album.images[0].url,
      track.external_urls.spotify,
      track.preview_url
    );
  }
}
