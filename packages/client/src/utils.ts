import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const SOCKET_ROOM = "default";
const ydoc = new Y.Doc();

export function getYDoc() {
  return ydoc;
}

export function createCheckbox() {
  const CHECKBOX_COUNT = 10_000;
  const container = document.querySelector("#app");

  for (let i = 0; i < CHECKBOX_COUNT; i++) {
    const checkbox = document.createElement("input");
    const key = `checkbox-${i}`;
    checkbox.type = "checkbox";
    checkbox.name = key;
    container?.appendChild(checkbox);
  }
}

export function onCheckboxChange(name: string, checked: boolean) {
  const ydoc = getYDoc();
  const ymap = ydoc.getMap();
  ymap.set(name, checked);
}

export function initWSProvider() {
  const ydoc = getYDoc();
  const provider = new WebsocketProvider(
    import.meta.env.VITE_SOCKET_URL,
    SOCKET_ROOM,
    ydoc
  );
  return provider;
}
