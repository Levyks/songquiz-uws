import { SpotifyArtist } from "@/typings/spotify";

export class Artist {
  constructor(public name: string, public url: string) {}

  static fromSpotify(artist: SpotifyArtist): Artist {
    return new Artist(artist.name, artist.external_urls.spotify);
  }
}
