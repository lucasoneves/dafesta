import { expectTypeOf, describe, it } from "vitest";
import type {
  User,
  CreateUserPayload,
  Event,
  CreateEventPayload,
  EventParticipant,
  CreateEventParticipantPayload,
  EventParticipantStatus,
  EventRole,
  ListItem,
  CreateListItemPayload,
} from "./index.ts";

describe("Payloads de criação omitem campos de sistema", () => {
  it("CreateUserPayload não contém id nem timestamps", () => {
    const payload: CreateUserPayload = { name: "Ana", email: "a@a.com" };
    expectTypeOf(payload).toEqualTypeOf<{
      name: string;
      email: string;
      avatarUrl?: string;
    }>();
  });

  it("CreateEventPayload requer title/date e omite id/status/ownerId/timestamps", () => {
    const payload: CreateEventPayload = {
      title: "Aniversário",
      date: "2026-12-01",
    };
    expectTypeOf(payload).toEqualTypeOf<{
      title: string;
      description?: string;
      date: string;
      location?: string;
      coverUrl?: string;
    }>();
  });

  it("CreateEventParticipantPayload omite timestamps, mas mantém eventId/userId/name/email/status/role", () => {
    const payload: CreateEventParticipantPayload = {
      eventId: "e1",
      userId: "u1",
      name: "Maria",
      email: "maria@email.com",
      status: "pending",
      role: "guest",
    };
    expectTypeOf(payload).toEqualTypeOf<{
      eventId: string;
      userId: string;
      name: string;
      email?: string;
      status: EventParticipantStatus;
      role: EventRole;
    }>();
  });

  it("CreateListItemPayload omite id/claimedBy/isCompleted/timestamps", () => {
    const payload: CreateListItemPayload = {
      eventId: "e1",
      title: "Refrigerante",
      category: "drink",
      quantity: 10,
    };
    expectTypeOf(payload).toEqualTypeOf<{
      eventId: string;
      title: string;
      category: ListItem["category"];
      quantity: number;
    }>();
  });
});

describe("Domínio completo", () => {
  it("Event possui campos exigidos", () => {
    const ev: Event = {
      id: "e1",
      title: "Festa",
      date: "2026-01-01",
      status: "draft",
      ownerId: "u1",
      createdAt: "now",
      updatedAt: "now",
    };
    expectTypeOf(ev).toMatchTypeOf<Event>();
  });

  it("ListItem permite claimedByUserId nulo para item não reivindicado", () => {
    const item: ListItem = {
      id: "i1",
      eventId: "e1",
      title: "Bolo",
      category: "food",
      quantity: 1,
      claimedByUserId: null,
      claimedByName: null,
      isCompleted: false,
      createdAt: "now",
      updatedAt: "now",
    };
    expectTypeOf(item.claimedByUserId).toEqualTypeOf<string | null>();
    expectTypeOf(item.claimedByName).toEqualTypeOf<string | null>();
  });
});
