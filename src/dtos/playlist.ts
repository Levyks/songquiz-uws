import { PlaylistProvider } from "@/enums/playlist";
import { Playlist } from "@/models/playlist";

export class PlaylistDTO {
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

  static fromPlaylist(playlist: Playlist): PlaylistDTO {
    return new PlaylistDTO(
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
