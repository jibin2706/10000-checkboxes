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

const wsServer = Bun.serve<{ doc: WSSharedDoc }>({
  port: 3001,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    message(ws, message: Buffer) {
      messageListener(ws, ws.data.doc, new Uint8Array(message));
    },
    open(ws) {
      const doc = getYDoc("default_doc_name", true);
      doc.conns.set(ws, new Set());
      ws.data = { doc };
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
