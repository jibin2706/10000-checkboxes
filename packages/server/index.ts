import {
  closeConn,
  getYDoc,
  messageListener,
  syncStep1,
  WSSharedDoc,
} from "./lib/y-websocket/utils.cjs";

const httpServer = Bun.serve({
  port: 3000,
  fetch(req) {
    console.log(req.method);
    return new Response("Hello world!!!");
  },
});

const wsServer = Bun.serve<{ room: string; doc: WSSharedDoc }>({
  port: 3001,
  fetch(req, server) {
    const room = new URL(req.url).pathname;
    if (!room) {
      return new Response("Invalid Room", { status: 500 });
    }
    const success = server.upgrade(req, { data: { room } });
    if (success) return undefined;
    return new Response("Upgrade failed", { status: 500 });
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

console.log(`HTTP Server on ${httpServer.url}`);
console.log(`WebSocket Server on ${wsServer.url}`);
