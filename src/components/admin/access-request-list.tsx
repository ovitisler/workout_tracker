import type { AccessRequest } from "@/lib/access";

import { reviewAccessRequest } from "./actions";

const STATUS_LABELS = { pending: "Pending", approved: "Approved", denied: "Denied" } as const;

function formatWhen(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AccessRequestList({ requests }: { requests: AccessRequest[] }) {
  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h2 className="px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Waiting</h2>
        {pending.length === 0 ? (
          <p className="px-1 text-sm text-zinc-500">No one is waiting.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {pending.map((request) => (
              <li key={request.id} className="flex flex-col gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-zinc-950 dark:text-zinc-50">{request.email}</p>
                  {request.note && (
                    <p className="text-sm break-words text-zinc-600 dark:text-zinc-400">“{request.note}”</p>
                  )}
                  <p className="text-xs text-zinc-500">Asked {formatWhen(request.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <form action={reviewAccessRequest.bind(null, request.id, "approved")} className="flex-1">
                    <button className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white dark:bg-blue-500">
                      Approve
                    </button>
                  </form>
                  <form action={reviewAccessRequest.bind(null, request.id, "denied")} className="flex-1">
                    <button className="w-full rounded-lg border border-zinc-300 py-2 font-medium text-zinc-950 dark:border-zinc-700 dark:text-zinc-50">
                      Deny
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {reviewed.length > 0 && (
        <section className="flex flex-col gap-1">
          <h2 className="px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Reviewed</h2>
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {reviewed.map((request) => (
              <li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-zinc-950 dark:text-zinc-50">{request.email}</p>
                  <p className="text-xs text-zinc-500">
                    {STATUS_LABELS[request.status]}
                    {request.signedUp && " · Has an account"}
                  </p>
                </div>
                {/* Change your mind. Denying someone who already signed up
                    doesn't remove their account. */}
                {!request.signedUp && (
                  <form
                    action={reviewAccessRequest.bind(
                      null,
                      request.id,
                      request.status === "approved" ? "denied" : "approved",
                    )}
                  >
                    <button className="shrink-0 text-sm text-blue-600 dark:text-blue-400">
                      {request.status === "approved" ? "Deny" : "Approve"}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="px-1 text-xs text-zinc-500">
        Approved people can create an account with that email right away. Requests come from the
        sign-in page, when someone who isn’t allowed yet taps Create account.
      </p>
    </div>
  );
}
