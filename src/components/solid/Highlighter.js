import { highlightAll } from "bedazzlr";
import * as cstml from "@bablr/language-en-cstml";
import * as esnext from "@bablr/language-en-esnext";

let languages = new Map([
  [cstml.canonicalURL, cstml],
  [esnext.canonicalURL, esnext],
]);

let Highlighter = () => {
  highlightAll(languages);
};

export default Highlighter;
