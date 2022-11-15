export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

// id,name,owner(display_name),external_urls(spotify),images,tracks(total)
export interface SpotifyPlaylistInfo {
  id: string;
  name: string;
  owner: {
    display_name: string;
  };
  external_urls: SpotifyExternalUrls;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
}

// id,name,owner(display_name),external_urls(spotify),images,tracks(items(track(id,name,preview_url,external_urls,artists(external_urls,name),album(images))),total)
export interface SpotifyPlaylistInfoWithTracksFirstPage
  extends SpotifyPlaylistInfo {
  tracks: SpotifyPlaylistInfo["tracks"] & {
    items: SpotifyPlaylistItem[];
  };
}

// (external_urls,name)
export interface SpotifyArtist {
  name: string;
  external_urls: SpotifyExternalUrls;
}

// (images)
export interface SpotifyAlbum {
  images: SpotifyImage[];
}

// (id,name,preview_url,external_urls,artists(external_urls,name),album(images))
export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string;
  external_urls: SpotifyExternalUrls;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}

export interface SpotifyPlaylistItem {
  track: SpotifyTrack;
}

// (items(T))
export interface SpotifyPagination<T> {
  items: T[];
}

//items(track(id, name, preview_url, external_urls, artists(external_urls,name), album(images)))
export type SpotifyTracksResponse = SpotifyPagination<SpotifyPlaylistItem>;
