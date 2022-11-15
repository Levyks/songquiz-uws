import { Track } from "@/models/track";
import { PlaylistProvider } from "@/enums/playlist";

export class Playlist {
  playableTracks: Track[];

  constructor(
    public name: string,
    public creator: string,
    public provider: PlaylistProvider,
    public trackCount: number,
    public playableTracksOriginal: Track[],
    public cover: string,
    public url: string
  ) {
    this.playableTracks = playableTracksOriginal.slice();
  }

  public getRandomTracks(amount: number): Track[] {
    const tracks: Track[] = [];
    while (tracks.length < amount) {
      const index = Math.floor(Math.random() * this.playableTracks.length);
      tracks.push(this.playableTracks[index]);
      this.playableTracks.splice(index, 1);
    }
    return tracks;
  }
}
