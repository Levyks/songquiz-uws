import axios from "axios";
import qs from "qs";
import {
  SpotifyPlaylistInfoWithTracksFirstPage,
  SpotifyTokenResponse,
  SpotifyTracksResponse,
} from "@/typings/spotify";
import { Track } from "@/models/track";
import { config } from "@/config";
import { Playlist } from "@/models/playlist";
import { arrayOfLength } from "@/helpers/misc";
import { getEnvVariable, getOptionalEnvVariable } from "@/env";

const clientId = getEnvVariable("SPOTIFY_CLIENT_ID");
const clientSecret = getEnvVariable("SPOTIFY_CLIENT_SECRET");

const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString(
  "base64"
);

let fetchAndSetTokenPromise: Promise<string> | null = null;
let token = getOptionalEnvVariable("SPOTIFY_STARTING_TOKEN", null);

async function updateTokenInDotEnv(token: string): Promise<void> {
  const fs = await import("fs").then((m) => m.default);
  let dotEnvContent = await fs.promises.readFile(".env", "utf-8");
  dotEnvContent = dotEnvContent.replace(
    /SPOTIFY_STARTING_TOKEN=(.*?)(\r?\n)/,
    `SPOTIFY_STARTING_TOKEN=${token}$2`
  );
  await fs.promises.writeFile(".env", dotEnvContent);
}

function setToken(newToken: string): string {
  token = newToken;
  if (process.env.NODE_ENV !== "production")
    updateTokenInDotEnv(newToken).catch(() => undefined);
  return token;
}

async function fetchAndSetToken(): Promise<string> {
  const data = qs.stringify({
    grant_type: "client_credentials",
  });

  const headers = {
    Authorization: `Basic ${basicToken}`,
  };

  const response = await axios.post<SpotifyTokenResponse>(
    "https://accounts.spotify.com/api/token",
    data,
    {
      headers,
    }
  );

  return setToken(response.data.access_token);
}

async function fetchAndSetTokenNoOverlap(): Promise<string> {
  if (fetchAndSetTokenPromise) return fetchAndSetTokenPromise;
  fetchAndSetTokenPromise = fetchAndSetToken();
  const token = await fetchAndSetTokenPromise;
  fetchAndSetTokenPromise = null;
  return token;
}

const api = axios.create({
  baseURL: "https://api.spotify.com/v1/",
});

api.interceptors.request.use(
  async (config) => {
    const tokenToBeUsed = token ?? (await fetchAndSetTokenNoOverlap());
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${tokenToBeUsed}`;
    return config;
  },
  async (error) => {
    if (error.response?.status === 401) {
      token = null;
      const tokenToBeUsed = await fetchAndSetTokenNoOverlap();
      error.config.headers["Authorization"] = `Bearer ${tokenToBeUsed}`;
      /*
       * Using the default axios instance here to avoid an infinite loop
       * of interceptors in case something goes wrong with the auth.
       */
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);

async function fetchPlaylistInfoWithTracksFirstPage(
  id: string
): Promise<SpotifyPlaylistInfoWithTracksFirstPage> {
  const fields =
    "id,name,owner(display_name),external_urls(spotify),images,tracks(items(track(id, name, preview_url, external_urls, artists(external_urls,name), album(images))),total)";

  const response = await api.get<SpotifyPlaylistInfoWithTracksFirstPage>(
    `playlists/${id}`,
    {
      params: { fields },
    }
  );

  return response.data;
}

async function fetchPlaylistTracks(
  id: string,
  offset,
  limit = config.spotifyTracksFetchLimit
): Promise<Track[]> {
  const fields =
    "items(track(id, name, preview_url, external_urls, artists(external_urls,name), album(images)))";

  const response = await api.get<SpotifyTracksResponse>(
    `playlists/${id}/tracks`,
    {
      params: { fields, offset, limit },
    }
  );

  return response.data.items.map((item) => Track.fromSpotify(item.track));
}

async function fetchRemainingPlaylistTracks(
  id: string,
  offset: number,
  total: number,
  limit = config.spotifyTracksFetchLimit
): Promise<Track[]> {
  const numberOfRemainingPages = Math.ceil((total - offset) / limit);
  const offsets = arrayOfLength(
    numberOfRemainingPages,
    (i) => offset + i * limit
  );

  const tracks = await Promise.all(
    offsets.map((offsetPage) => fetchPlaylistTracks(id, offsetPage, limit))
  );

  return tracks.flat();
}

export async function fetchPlaylist(id: string): Promise<Playlist> {
  const info = await fetchPlaylistInfoWithTracksFirstPage(id);

  const remainingTracks =
    info.tracks.total > info.tracks.items.length
      ? await fetchRemainingPlaylistTracks(
          id,
          info.tracks.items.length,
          info.tracks.total
        )
      : [];

  const tracksFirstPage = info.tracks.items.map((item) =>
    Track.fromSpotify(item.track)
  );

  const tracks = tracksFirstPage.concat(remainingTracks);

  return Playlist.fromSpotify(info, tracks);
}
