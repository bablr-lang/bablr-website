import { streamParse, Context, AgastContext } from "bablr/enhanceable";
import { debugEnhancers } from "@bablr/helpers/enhancers";
import { buildFullyQualifiedSpamMatcher } from "@bablr/helpers/builders";
import { printTag } from "@bablr/agast-helpers/print";
import { createSignal } from "solid-js";
import { evaluateIO } from "@bablr/io-vm-web";
import { defaultLanguageInput } from "./language.js";
import * as helpers from "@bablr/helpers";
import {
  getStreamIterator,
  StreamIterable,
  generatePrettyCSTML,
} from "@bablr/agast-helpers/stream";
import { Coroutine } from "@bablr/coroutine";

function* __map(tags, fn) {
  const co = new Coroutine(getStreamIterator(tags));

  for (;;) {
    co.advance();

    if (co.current instanceof Promise) {
      co.current = yield co.current;
    }
    if (co.done) break;

    const tag = co.value;

    yield fn(tag);
  }
}

export const map = (tags, fn) => new StreamIterable(__map(tags, fn));

export default function App() {
  const [input, setInput] = createSignal("<!0:cstml>");
  const [tags, setTags] = createSignal(null);
  const [matcherTag, setMatcherTag] = createSignal("DoctypeTag");
  let outputArea;

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

  const makeDeferred = () => {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  };

  let deferred;

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
          <div
            id="input-form"
            style={{ display: "flex", "flex-flow": "column" }}
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
            <div
              id="experiment-input"
              contentEditable="true"
              onInput={(e) => setInput(e.currentTarget.innerText)}
            >
              {input()}
            </div>
          </div>
          <button
            id="form-eval"
            onClick={async () => {
              const tags = map(
                evaluateIO(() =>
                  getStreamIterator(
                    streamParse(
                      ctx(),
                      matcher(),
                      input(),
                      {},
                      { enhancers, emitEffects: true },
                    ),
                  ),
                ),
                (tag) => {
                  debugger;
                  const d = (deferred = makeDeferred());
                  return d.promise.then(() => tag);
                },
              );

              setTags(tags);

              for await (const text of generatePrettyCSTML(tags)) {
                debugger;
                outputArea.appendChild(document.createTextNode(text));
              }
            }}
          >
            eval
          </button>

          <button
            id="form-step"
            onClick={() => {
              deferred.resolve();
            }}
          >
            step
          </button>
        </div>
        <div id="output" style={{ display: "flex", "flex-flow": "column" }}>
          <label for="#experiment-output" style={{ "text-align": "center" }}>
            Output
          </label>
          <textarea ref={outputArea} id="experiment-output"></textarea>
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
