import { PlaylistProvider } from "@/enums/playlist";
import { Playlist, Track, Artist } from "@/models";

export class PlaylistDto {
  constructor(
    public id: string,
    public provider: PlaylistProvider,
    public name: string,
    public creator: string,
    public cover: string,
    public url: string,
    public numberOfPlayableTracks: number,
    public numberOfTracksAlreadyPlayed: number
  ) {}

  static fromPlaylist(playlist: Playlist): PlaylistDto {
    return new PlaylistDto(
      playlist.id,
      playlist.provider,
      playlist.name,
      playlist.creator,
      playlist.cover,
      playlist.url,
      playlist.playableTracks.length,
      playlist.tracksAlreadyPlayed.length
    );
  }
}

export class ArtistDto {
  constructor(public name: string, public url: string) {}

  static fromArtist(artist: Artist): ArtistDto {
    return new ArtistDto(artist.name, artist.url);
  }
}

export class TrackDto {
  constructor(
    public name: string,
    public artists: ArtistDto[],
    public cover: string,
    public url: string,
    public preview: string
  ) {}

  static fromTrack(track: Track): TrackDto {
    return new TrackDto(
      track.name,
      track.artists.map(ArtistDto.fromArtist),
      track.cover,
      track.url,
      track.preview
    );
  }
}
