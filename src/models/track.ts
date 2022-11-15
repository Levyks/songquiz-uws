import { Artist } from "@/models/artist";

export class Track {
  id: string;
  name: string;
  artists: Artist[];
  cover: string;
  url: string;
  preview: string;
}
