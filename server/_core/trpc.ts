import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { recordAdminAudit } from "../adminAudit";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // Allow access via admin session (custom login) OR OAuth admin role
    const hasAdminSession = !!(ctx as any).adminSession;
    const hasAdminRole = ctx.user && ctx.user.role === 'admin';

    if (!hasAdminSession && !hasAdminRole) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    const rawInput = await opts.getRawInput();
    const result = await next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });

    if (result.ok && opts.type === "mutation") {
      // Audit recording is best effort and must not hold an otherwise completed
      // admin mutation open until LiteSpeed terminates the shared-host request.
      void recordAdminAudit({
        adminId: ctx.adminSession?.adminId ?? ctx.user?.id,
        adminUsername: ctx.adminSession?.username ?? ctx.user?.username ?? ctx.user?.email,
        action: opts.path,
        rawInput,
        req: ctx.req,
      }).catch((error) => console.error("[Admin Audit] Failed to record action:", error));
    }

    return result;
  }),
);
