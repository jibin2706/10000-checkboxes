import {
  createCheckbox,
  getYDoc,
  initWSProvider,
  onCheckboxChange,
} from "./utils";

createCheckbox();
const wsProvider = initWSProvider();

wsProvider.on("status", (event: unknown) => {
  console.log(event);
});

wsProvider.doc.on("update", function (_, origin) {
  if (origin !== wsProvider) return;

  const ymap = getYDoc().getMap<boolean>();
  ymap.forEach(function (value, key) {
    const element = document.querySelector<HTMLInputElement>(
      `input[name=${key}]`
    );
    if (element) element.checked = value;
  });
});

const container = document.querySelector("#app");
container?.addEventListener("change", function (event) {
  if (
    event.target instanceof HTMLInputElement &&
    event.target.type === "checkbox"
  ) {
    onCheckboxChange(event.target.name, event.target.checked);
  }
});
