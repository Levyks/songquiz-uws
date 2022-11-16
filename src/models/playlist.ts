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

  /**
   * This isn't the most efficient thing ever, but the playlists
   * shouldn't get that big, so I guess it's fine.
   *
   * Note: this only avoids the repetition of the song's first artist
   */
  private getTracksToPickFromAvoidingArtistRepetition(
    alreadyPickedTracks: TrackWithIndex[]
  ): Track[] {
    const artistsAlreadyPicked = alreadyPickedTracks.map(
      (track) => track.track.artists[0].name
    );
    return this.playableTracks.filter(
      (track) => !artistsAlreadyPicked.includes(track.artists[0].name)
    );
  }

  public getRandomPlayableTracks(
    amount: number,
    avoidArtistRepetition = false
  ): TrackWithIndex[] {
    const randomPlayableTracks: TrackWithIndex[] = [];
    while (randomPlayableTracks.length < amount) {
      const tracksToPickFrom = avoidArtistRepetition
        ? this.getTracksToPickFromAvoidingArtistRepetition(randomPlayableTracks)
        : this.playableTracks;
      const [track, index] = randomElementWithIndex(tracksToPickFrom);
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
