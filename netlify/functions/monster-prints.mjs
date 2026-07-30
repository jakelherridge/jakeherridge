// How many times each monster has been taken away to print.
//
//   GET  -> { "01": 128, "04": 91, ... }
//   POST { id: "04" } -> { id: "04", count: 92 }
//
// What this stores: one integer per monster. That is the whole record. No IP,
// no user agent, no cookie, no identifier, nothing that could be tied back to a
// person. The browser keeps its own "already counted this visit" list in
// sessionStorage so a reload does not inflate the number, and that list never
// leaves the device.
//
// The room treats this as decoration. Every sheet is a static file, so if this
// function is cold, broken, or removed, the downloads all still work and the
// counts simply do not appear.
import { getStore } from "@netlify/blobs";

// Ids are the manifest's zero-padded numbers. Validating the shape keeps an
// open endpoint from being used to write arbitrary keys into the store.
const ID = /^\d{2}$/;
const STORE = "monster-prints";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      // Counts are ambient, not live. A short cache keeps a busy day from
      // turning into a read per visitor.
      "cache-control": status === 200 ? "public, max-age=60" : "no-store",
    },
  });

export default async (req) => {
  const store = getStore(STORE);

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const entries = await Promise.all(
      blobs
        .filter((b) => ID.test(b.key))
        .map(async (b) => [b.key, Number(await store.get(b.key)) || 0]),
    );
    return json(Object.fromEntries(entries));
  }

  if (req.method === "POST") {
    let id;
    try {
      ({ id } = await req.json());
    } catch {
      return json({ error: "expected json" }, 400);
    }
    if (typeof id !== "string" || !ID.test(id)) return json({ error: "bad id" }, 400);

    // Read, add one, write. Netlify Blobs has no atomic increment, so two
    // downloads landing in the same instant can cost a tally. For a count of
    // coloring pages that is an acceptable trade against any locking scheme.
    const count = (Number(await store.get(id)) || 0) + 1;
    await store.set(id, String(count));
    return json({ id, count });
  }

  return json({ error: "method not allowed" }, 405);
};

export const config = { path: "/.netlify/functions/monster-prints" };
