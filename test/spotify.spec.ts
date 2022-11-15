import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { fetchPlaylist } from "@/services/spotify";
import { Playlist } from "@/models/playlist";

chai.use(chaiAsPromised);

describe("Spotify", () => {
  it("should fetch playlist", async () => {
    const playlistId = "4kCm7RKVb6XjB65JTtJYzJ";

    const playlist = await fetchPlaylist(playlistId);

    expect(playlist).to.be.instanceof(Playlist);
    expect(playlist).to.have.property("id", playlistId);
    expect(playlist).to.have.property(
      "name",
      "For SongQuiz Testing (Don't change)"
    );
    expect(playlist).to.have.property("tracks").that.has.lengthOf(50);
    expect(playlist).to.have.property("playableTracks");
    expect(playlist.playableTracks.filter((track) => !track.preview)).to.be
      .empty;
  });
});
