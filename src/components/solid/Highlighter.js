import "@bablr/deep-freeze/register";
import { highlightAll } from "bedazzlr";
import cstml from "@bablr/language-en-cstml";
import esnext from "@bablr/language-en-esnext";
import json from "@bablr/language-en-json";

let languages = new Map([
  [cstml.canonicalURL, cstml],
  [esnext.canonicalURL, esnext],
  [json.canonicalURL, json],
]);

let Highlighter = () => {
  highlightAll(languages);
};

export default Highlighter;
