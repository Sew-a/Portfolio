import { z } from "zod";

export const chatUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullish(),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: chatUserSchema,
});

export const groupSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  inviteCode: z.string(),
  createdAt: z.string(),
  members: z
    .array(
      z.object({
        id: z.string(),
        userId: z.string(),
        groupId: z.string(),
        joinedAt: z.string(),
      }),
    )
    .optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  content: z.string().nullish(),
  imageUrl: z.string().nullish(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullish(),
  }),
});

export const socketExceptionSchema = z.object({
  statusCode: z.number().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  event: z.string().optional(),
});

export type ChatUser = z.infer<typeof chatUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ChatGroup = z.infer<typeof groupSchema>;
export type ChatMessage = z.infer<typeof messageSchema>;

export interface SignUpPayload {
  email: string;
  password: string;
  username: string;
  avatarUrl?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}
