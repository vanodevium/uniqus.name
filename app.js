import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { enhanceSelect } from "./dropdown.js";

const generateName = (len = 2, separator = "-", style = "lowerCase") => {
  let dictionaries = [adjectives, animals];
  if (+len === 3) {
    dictionaries = [adjectives, colors, animals];
  }
  return uniqueNamesGenerator({
    dictionaries: dictionaries,
    separator: separator,
    length: len,
    style,
  });
};

const UniqueNameElement = document.getElementById("unique-name");
const GenerateButton = document.getElementById("generate");
const WordsCountElement = document.getElementById("words-count");
const WordsSeparatorElement = document.getElementById("words-separator");
const WordsStyleElement = document.getElementById("words-style");

const WordsElement = document.getElementById("name-words");
const StatusElement = document.getElementById("status");
const HINT = "Click the name to copy it";
let currentName = "";
let resetTimer;

const render = (name, separator) => {
  currentName = name;
  WordsElement.replaceChildren(
    ...name.split(separator).map((word, i, all) => {
      const el = document.createElement("span");
      el.className = "word in";
      el.style.setProperty("--i", i);
      el.append(word);
      if (i < all.length - 1) {
        const sep = document.createElement("span");
        sep.className = "sep";
        sep.textContent = separator;
        el.append(sep);
      }
      return el;
    }),
  );
  clearTimeout(resetTimer);
  UniqueNameElement.classList.remove("copied");
  StatusElement.textContent = HINT;
  fitName();
};

// Scale the name so it always fits on one line.
const fitName = () => {
  const max = 176; // 11rem
  const min = 24;
  const available =
    UniqueNameElement.parentElement.clientWidth -
    parseFloat(
      getComputedStyle(UniqueNameElement.parentElement).paddingInline,
    ) *
      2;
  UniqueNameElement.style.fontSize = "100px";
  const width = UniqueNameElement.scrollWidth;
  const size = Math.max(min, Math.min(max, (100 * available) / width));
  UniqueNameElement.style.fontSize = `${Math.floor(size)}px`;
};
window.addEventListener("resize", fitName);
document.fonts?.ready.then(fitName);

const callGenerateName = () => {
  const separator = WordsSeparatorElement.value;
  render(
    generateName(WordsCountElement.value, separator, WordsStyleElement.value),
    separator,
  );
};

// Settings are the <select> values. Source order: defaults < saved < URL.
// URL params: ?words=2|3 &separator=-|_ &style=lowerCase|upperCase|capital
const SETTINGS = [
  [WordsCountElement, "words-count", "words"],
  [WordsSeparatorElement, "words-separator", "separator"],
  [WordsStyleElement, "words-style", "style"],
];

const setIfValid = (select, value) => {
  const match = [...select.options].find(
    (o) => o.value.toLowerCase() === String(value).toLowerCase(),
  );
  if (match) select.value = match.value;
  return Boolean(match);
};

const params = new URLSearchParams(location.search);
for (const [select, storageKey, param] of SETTINGS) {
  const saved = localStorage.getItem(storageKey);
  if (saved) setIfValid(select, saved);
  if (params.has(param)) setIfValid(select, params.get(param));
  enhanceSelect(select);
  select.onchange = (e) => {
    localStorage.setItem(storageKey, e.currentTarget.value);
    callGenerateName();
  };
}

GenerateButton.onclick = () => {
  callGenerateName();
};

UniqueNameElement.addEventListener("click", async () => {
  await navigator.clipboard.writeText(currentName);
  UniqueNameElement.classList.add("copied");
  StatusElement.textContent = "Copied";
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    UniqueNameElement.classList.remove("copied");
    StatusElement.textContent = HINT;
  }, 1500);
});

GenerateButton.click();
