import { store, resetProgress, exportSave, importSave } from "../state.js";
import { navigate } from "../router.js";
import { el, toast } from "../utils.js";

export function renderSettings(container) {
  const state = store.state;

  const toggleRow = (label, desc, key) =>
    el("div", { class: "settings-row" }, [
      el("div", {}, [
        el("div", { class: "settings-row__label" }, label),
        el("div", { class: "settings-row__desc" }, desc)
      ]),
      el("label", { class: "switch" }, [
        el("input", {
          type: "checkbox",
          checked: state.settings[key] ? "checked" : undefined,
          onchange: (e) => store.update((s) => { s.settings[key] = e.target.checked; })
        }),
        el("span", { class: "switch__track" })
      ])
    ]);

  const exportBox = el("textarea", { readonly: "readonly" });
  exportBox.value = exportSave();

  const importBox = el("textarea", { placeholder: "Paste a save export here..." });

  const dangerZone = el("div", { class: "settings-row" }, [
    el("div", {}, [
      el("div", { class: "settings-row__label" }, "Reset Progress"),
      el("div", { class: "settings-row__desc" }, "Deletes your save and starts over. Cannot be undone.")
    ]),
    el("button", {
      class: "btn btn-danger",
      onclick: () => {
        if (confirm("Reset all progress? This cannot be undone.")) {
          resetProgress();
          navigate("home");
          toast("Progress reset.", "success");
        }
      }
    }, "Reset")
  ]);

  container.append(
    el("div", { class: "screen" }, [
      el("div", { class: "screen__header" }, [
        el("h1", { class: "screen__title" }, "Settings"),
        el("p", { class: "screen__subtitle" }, "Audio, save management, and progress reset.")
      ]),
      el("div", { class: "settings-list" }, [
        toggleRow("Sound Effects", "Battle hits, pull chimes, UI clicks.", "sound"),
        toggleRow("Music", "Background music.", "music")
      ]),
      el("div", { class: "panel save-io", style: "margin-top:1.5rem" }, [
        el("h3", {}, "Export Save"),
        el("p", { class: "text-muted" }, "Copy this JSON to back up your progress."),
        exportBox,
        el("button", {
          class: "btn btn-sm btn-ghost",
          style: "margin-top:0.5rem",
          onclick: async () => {
            await navigator.clipboard.writeText(exportBox.value);
            toast("Copied to clipboard.", "success");
          }
        }, "Copy")
      ]),
      el("div", { class: "panel save-io", style: "margin-top:1rem" }, [
        el("h3", {}, "Import Save"),
        importBox,
        el("button", {
          class: "btn btn-sm btn-primary",
          style: "margin-top:0.5rem",
          onclick: () => {
            try {
              importSave(importBox.value);
              toast("Save imported.", "success");
              navigate("home");
            } catch (err) {
              toast("Invalid save data.", "error");
            }
          }
        }, "Load")
      ]),
      el("div", { class: "panel", style: "margin-top:1.5rem" }, [dangerZone])
    ])
  );
}
