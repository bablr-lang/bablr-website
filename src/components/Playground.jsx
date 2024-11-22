import { streamParse, Context, AgastContext } from "bablr/enhanceable";
import { debugEnhancers } from "@bablr/helpers/enhancers";
import { buildFullyQualifiedSpamMatcher } from "@bablr/helpers/builders";
import { printPrettyCSTML } from "@bablr/helpers/stream";
import { createSignal } from "solid-js";
import { evaluateIO } from "@bablr/io-vm-web";
import { defaultLanguageInput } from "./language.js";
import * as helpers from "@bablr/helpers";

export default function App() {
  const [input, setInput] = createSignal("<!0:cstml>");
  const [tags, setTags] = createSignal(null);
  const [matcherTag, setMatcherTag] = createSignal("DoctypeTag");

  const matcher = () => {
    return buildFullyQualifiedSpamMatcher(
      {},
      language().canonicalURL,
      matcherTag(),
    );
  };

  const language = () => {
    return new Function(
      `return (helpers) => { ${languageInput()}; return {canonicalURL, dependencies, grammar, getCooked} }`,
    )()(helpers);
  };

  const [languageInput, setLanguageInput] = createSignal(null);

  let enhancers = {};

  enhancers = { ...debugEnhancers, enhancers };

  const ctx = () =>
    Context.from(AgastContext.create(), language(), enhancers.bablrProduction);

  return (
    <>
      <div id="playground" style={{ display: "flex", "flex-flow": "row" }}>
        <div
          id="input"
          style={{
            display: "flex",
            "flex-flow": "row",
            "align-items": "center",
          }}
        >
          <form
            id="input-form"
            style={{ display: "flex", "flex-flow": "column" }}
            onSubmit={(e) => {
              e.preventDefault();
              console.log("submitting");
              setTags(
                streamParse(
                  ctx(),
                  matcher(),
                  input(),
                  {},
                  { enhancers, emitEffects: true },
                ),
              );
            }}
          >
            <label for="#experiment-input" style={{ "text-align": "center" }}>
              Input
            </label>
            <div
              id="matcher-tag-input"
              style={{ display: "inline-flex", gap: "1rem", padding: "10px" }}
            >
              <label for="#matcher-tag">Matcher: </label>
              <input
                id="matcher-tag"
                ref={(el) => setMatcherTag(el.value)}
                value={matcherTag()}
                onInput={(e) => {
                  setMatcherTag(e.currentTarget.value);
                }}
              >
                doctypetag
              </input>
            </div>
            <textarea
              id="experiment-input"
              value={input()}
              ref={(el) => setInput(el.value)}
              onInput={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  let form = document.getElementById("input-form");
                  form.requestSubmit();
                }
              }}
            ></textarea>
          </form>
          <button id="form-eval" type="submit" form="input-form">
            eval
          </button>
        </div>
        <div id="output" style={{ display: "flex", "flex-flow": "column" }}>
          <label for="#experiment-output" style={{ "text-align": "center" }}>
            Output
          </label>
          <textarea id="experiment-output">
            {tags() != null
              ? printPrettyCSTML(
                  evaluateIO(() => tags()),
                  { ctx: ctx() },
                )
              : null}
          </textarea>
        </div>

        <div id="grammar" style={{ display: "flex", "flex-flow": "column" }}>
          <label for="#experiment-grammar" style={{ "text-align": "center" }}>
            Grammar
          </label>
          <textarea
            id="experiment-grammar"
            value={languageInput()}
            ref={(el) => setLanguageInput(el.value)}
            onInput={(e) => setLanguageInput(e.currentTarget.value)}
          >
            {defaultLanguageInput}
          </textarea>
        </div>
      </div>
    </>
  );
}
