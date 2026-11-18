// Replaces a native <select> with an accessible custom dropdown.
// The <select> stays in the DOM (hidden) as the source of truth.
export const enhanceSelect = (select) => {
  const wrap = document.createElement("div");
  wrap.className = "dd";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dd-btn";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  const list = document.createElement("ul");
  list.className = "dd-list";
  list.setAttribute("role", "listbox");
  list.tabIndex = -1;
  list.hidden = true;

  const options = [...select.options];
  const items = options.map((opt) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.textContent = opt.textContent;
    li.dataset.value = opt.value;
    list.append(li);
    return li;
  });

  let active = 0;
  const sync = () => {
    button.textContent = select.selectedOptions[0]?.textContent ?? "";
    items.forEach((li) =>
      li.setAttribute("aria-selected", String(li.dataset.value === select.value)),
    );
  };
  const highlight = (i) => {
    active = (i + items.length) % items.length;
    items.forEach((li, n) => li.classList.toggle("active", n === active));
    items[active].scrollIntoView({ block: "nearest" });
  };
  const open = () => {
    list.hidden = false;
    button.setAttribute("aria-expanded", "true");
    highlight(options.findIndex((o) => o.value === select.value));
    list.focus({ preventScroll: true });
  };
  const close = (refocus = true) => {
    list.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (refocus) button.focus();
  };
  const choose = (i) => {
    if (select.value !== items[i].dataset.value) {
      select.value = items[i].dataset.value;
      select.dispatchEvent(new Event("change"));
    }
    sync();
    close();
  };

  button.addEventListener("click", () => (list.hidden ? open() : close()));
  list.addEventListener("click", (e) => {
    e.preventDefault(); // keep the wrapping <label> from re-clicking the button
    const i = items.indexOf(e.target.closest("li"));
    if (i >= 0) choose(i);
  });
  list.addEventListener("mousemove", (e) => {
    const i = items.indexOf(e.target.closest("li"));
    if (i >= 0 && i !== active) highlight(i);
  });
  list.addEventListener("keydown", (e) => {
    const keys = {
      ArrowDown: () => highlight(active + 1),
      ArrowUp: () => highlight(active - 1),
      Home: () => highlight(0),
      End: () => highlight(items.length - 1),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => close(),
      Tab: () => close(false),
    };
    if (keys[e.key]) {
      if (e.key !== "Tab") e.preventDefault();
      keys[e.key]();
    }
  });
  list.addEventListener("blur", () => {
    if (!list.hidden) close(false);
  });

  select.hidden = true;
  select.after(wrap);
  wrap.append(button, list);
  sync();
  return sync;
};
