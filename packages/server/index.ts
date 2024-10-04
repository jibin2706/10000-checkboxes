import {
  closeConn,
  getYDoc,
  messageListener,
  syncStep1,
  WSSharedDoc,
} from "./lib/y-websocket/utils.cjs";

const server = Bun.serve<{ room: string; doc: WSSharedDoc }>({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("Hello world!!!");
    if (url.pathname.split("/")[1] === "yjs") {
      const room = url.pathname.split("/")[2];
      if (!room) {
        return new Response("Invalid Room", { status: 500 });
      }
      const success = server.upgrade(req, { data: { room } });
      if (success) return undefined;
      return new Response("Upgrade failed", { status: 500 });
    }
    return new Response("Not found", { status: 404 });
  },
  websocket: {
    message(ws, message: Buffer) {
      messageListener(ws, ws.data.doc, new Uint8Array(message));
    },
    open(ws) {
      const doc = getYDoc(ws.data.room, true);
      doc.conns.set(ws, new Set());
      console.log(`room: ${ws.data.room} users: ${doc.conns.size}`);
      ws.data = { ...ws.data, doc };
      syncStep1(doc, ws);
    },
    close(ws, code, message) {
      console.log("socket disconnected", { code, message });
      closeConn(ws.data.doc, ws);
    },
  },
});

console.log(`Server on ${server.url}`);
