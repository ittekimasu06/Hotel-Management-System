import path from "node:path";
import type { Room, RoomType } from "@prisma/client";

/**
 * Ảnh cũ được lưu dạng "/hostay/public/images/<file>"; API trả về "/uploads/<file>".
 */
export function imageUrl(stored: string | null): string | null {
  if (!stored) return null;
  return `/uploads/${path.basename(stored)}`;
}

export function serializeRoom(room: Room & { type?: RoomType | null }) {
  return {
    id: room.id,
    hotelName: room.hotelName,
    address: room.address,
    bedType: room.bedType,
    numberPeople: room.numberPeople,
    numberBed: room.numberBed,
    quality: room.quality,
    price: room.price.toNumber(),
    area: room.area,
    status: room.status,
    detail: room.detail,
    image: imageUrl(room.image),
    type: room.type ? { id: room.type.id, name: room.type.name } : null,
  };
}
