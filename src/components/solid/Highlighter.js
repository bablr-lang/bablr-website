import { highlightAll } from "bedazzlr";
import cstml from "@bablr/language-en-cstml";
import esnext from "@bablr/language-en-esnext";
import json from "@bablr/language-en-json";
import * as BMap from "@bablr/agast-helpers/b-map";

let { entry } = BMap;

let languages = BMap.from(
  entry(cstml.canonicalURL, cstml),
  entry(esnext.canonicalURL, esnext),
  entry(json.canonicalURL, json),
);

let Highlighter = () => {
  highlightAll(languages);
};

export default Highlighter;
