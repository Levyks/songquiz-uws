import { RoomDto } from "@/dtos/room";

export class RoomJoinedDto {
  constructor(public room: RoomDto, public token: string) {}
}
