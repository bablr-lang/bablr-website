import { highlightAll } from "bedazzlr";
import * as cstml from "@bablr/language-en-cstml";
import * as esnext from "@bablr/language-en-esnext";
import * as json from "@bablr/language-en-json";

let languages = new Map([
  [cstml.canonicalURL, cstml],
  [esnext.canonicalURL, esnext],
  [json.canonicalURL, json],
]);

let Highlighter = () => {
  highlightAll(languages);
};

export default Highlighter;
