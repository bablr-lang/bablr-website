import { streamParse, Context, AgastContext } from "bablr/enhanceable";
import { debugEnhancers, generateProductions } from "@bablr/helpers/enhancers";
import { buildFullyQualifiedSpamMatcher } from "@bablr/helpers/builders";
import { printPrettyCSTML } from "@bablr/helpers/stream";
import { createSignal, For } from "solid-js";
import { evaluateIO } from "@bablr/io-vm-web";
import { printType } from "@bablr/agast-helpers/print";
import { defaultLanguageInput } from "./language.js";
import {
  createCodeMirror,
  createEditorControlledValue,
} from "solid-codemirror";
import { lineNumbers, keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { defaultKeymap } from "@codemirror/commands";
import { solarizedLight } from "thememirror";
import { makePersisted } from "@solid-primitives/storage";
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

  const [localLanguageInput, setLocalLanguageInput] =
    makePersisted(createSignal());
  const [storageType, setStorageType] = createSignal("default");
  const [languageInput, setLanguageInput] = createSignal(defaultLanguageInput);
  const { ref, editorView, createExtension } = createCodeMirror({
    onValueChange: setLanguageInput,
  });

  createEditorControlledValue(editorView, languageInput);
  const productions = () => {
    return generateProductions(language().grammar);
  };

  createExtension(solarizedLight);
  createExtension(lineNumbers);
  createExtension(javascript);
  createExtension(keymap.of(defaultKeymap));

  let enhancers = {};

  enhancers = { ...debugEnhancers, enhancers };

  const ctx = () => {
    return Context.from(
      AgastContext.create(),
      language(),
      enhancers.bablrProduction,
    );
  };

  return (
    <>
      <div id="playground" style={{ display: "flex", "flex-flow": "row" }}>
        <div
          id="playground-left"
          style={{ display: "flex", "flex-flow": "column", width: "50%" }}
        >
          <div
            id="input"
            style={{
              display: "flex",
              "flex-flow": "row",
              "align-items": "center",
              height: "50%",
            }}
          >
            <div
              id="input-form"
              style={{
                display: "flex",
                "flex-flow": "column",
                width: "100%",
                height: "100%",
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
                <select
                  id="matcher-tag"
                  onInput={(e) => {
                    setMatcherTag(e.currentTarget.value);
                  }}
                >
                  <For
                    each={[
                      ...new Set(
                        [...productions()]
                          .filter(
                            ({ 0: key }) =>
                              key !== Symbol.for("@bablr/fragment"),
                          )
                          .map(({ 0: key }) => {
                            let string = key;
                            if (typeof string === "symbol") {
                              string = `[${printType(string)}]`;
                            }
                            return string;
                          }),
                      ),
                    ].sort()}
                  >
                    {(key) => {
                      return (
                        <option selected={key === matcherTag()} value={key}>
                          {key}
                        </option>
                      );
                    }}
                  </For>
                </select>
              </div>
              <textarea
                id="experiment-input"
                value={input()}
                onInput={(e) => setInput(e.currentTarget.value)}
              >
                {input()}
              </textarea>
            </div>
            <button
              id="form-eval"
              onClick={(e) => {
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
              eval
            </button>
          </div>
          <div
            id="output"
            style={{ display: "flex", "flex-flow": "column", height: "50%" }}
          >
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
        </div>
        <div id="playground-right" style={{ width: "50%" }}>
          <div id="grammar" style={{ display: "flex", "flex-flow": "column" }}>
            <label for="#experiment-grammar" style={{ "text-align": "center" }}>
              Grammar
            </label>
            <select
              id="grammar-flag"
              onInput={(e) => {
                setStorageType(e.currentTarget.value);
              }}
              style={{ width: "200px" }}
            >
              <option value="default">Default CSTML</option>
              <option value="local">Local Storage</option>
            </select>
            <div id="experiment-grammar" ref={ref}></div>
          </div>
        </div>
      </div>
    </>
  );
}
