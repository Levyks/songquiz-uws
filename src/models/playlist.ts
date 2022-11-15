import { Track } from "@/models/track";
import { PlaylistProvider } from "@/enums/playlist";
import { SpotifyPlaylistInfo } from "@/typings/spotify";
import { randomElementWithIndex } from "@/helpers/misc";
import { TrackWithIndex } from "@/typings/playlist";

export class Playlist {
  playableTracks: Track[];
  tracksAlreadyPlayed: Track[] = [];

  constructor(
    public id: string,
    public provider: PlaylistProvider,
    public tracks: Track[],
    public name: string,
    public creator: string,
    public cover: string,
    public url: string
  ) {
    this.playableTracks = tracks.filter((track) => track.preview);
  }

  public getRandomPlayableTracks(amount: number): TrackWithIndex[] {
    const randomPlayableTracks: TrackWithIndex[] = [];
    while (randomPlayableTracks.length < amount) {
      const [track, index] = randomElementWithIndex(this.playableTracks);
      randomPlayableTracks.push({ track, index });
    }
    return randomPlayableTracks;
  }

  public setTrackAsPlayed(trackWithIndex: TrackWithIndex): void {
    this.playableTracks.splice(trackWithIndex.index, 1);
    this.tracksAlreadyPlayed.push(trackWithIndex.track);
  }

  static fromSpotify(playlist: SpotifyPlaylistInfo, tracks: Track[]): Playlist {
    return new Playlist(
      playlist.id,
      PlaylistProvider.Spotify,
      tracks,
      playlist.name,
      playlist.owner.display_name,
      playlist.images[0].url,
      playlist.external_urls.spotify
    );
  }
}
