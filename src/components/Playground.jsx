import { spam, i } from "@bablr/boot";
import { streamParse, Context } from "bablr/enhanceable";
import { debugEnhancers } from "@bablr/helpers/enhancers";
import { buildString, buildIdentifier } from "@bablr/helpers/builders";
import { generateProductions } from "@bablr/helpers/grammar";
import { printPrettyCSTML } from "@bablr/helpers/stream";
import { createSignal, For } from "solid-js";
import { evaluateIO } from "@bablr/io-vm-web";
import { printType, printTag } from "@bablr/agast-helpers/print";
import { defaultLanguageInput } from "./language.js";
import "solid-devtools";
import {
  createCodeMirror,
  createEditorControlledValue,
  createEditorReadonly,
} from "solid-codemirror";
import { lineNumbers, keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { defaultKeymap } from "@codemirror/commands";
import { solarizedLight } from "thememirror";
import { makePersisted } from "@solid-primitives/storage";
import {
  getStreamIterator,
  StreamIterable,
  generatePrettyCSTML,
} from "@bablr/agast-helpers/stream";
import { Coroutine } from "@bablr/coroutine";
import * as helpers from "@bablr/helpers";

function* __map(tags, fn) {
  const co = new Coroutine(getStreamIterator(tags));

  for (;;) {
    co.advance();

    if (co.current instanceof Promise) {
      co.current = yield co.current;
    }
    if (co.done) break;

    const tag = co.value;

    let result = fn(tag);
    if (result instanceof Promise) {
      result = yield result;
    }
    yield result;
  }
}

export const map = (tags, fn) => new StreamIterable(__map(tags, fn));

const wait = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

export default function App() {
  const [input, setInput] = createSignal("<!0:cstml><></>");
  const [output, setOutput] = createSignal([]);
  const [matcherTag, setMatcherTag] = createSignal("Document");
  const [playing, setPlaying] = createSignal(false);

  const makeDeferred = () => {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  };

  let deferreds = [];

  const language = () => {
    try {
      return new Function(
        `return (helpers) => { ${getLanguageTextForStorageType()}; return {canonicalURL, dependencies, grammar, getCooked} }`,
      )()(helpers);
    } catch (e) {}
  };

  const getLanguageTextForStorageType = () => {
    if (storageType() === "local") {
      return localLanguageInput();
    } else if (storageType() === "default") {
      return defaultLanguageInput;
    } else {
      throw new Error();
    }
  };

  const [localLanguageInput, setLocalLanguageInput] = makePersisted(
    createSignal(""),
    { name: "languageInput" },
  );
  const [storageType, setStorageType] = createSignal("default");
  const { ref, editorView, createExtension } = createCodeMirror({
    onValueChange: (value) => {
      if (storageType() === "local") {
        setLocalLanguageInput(value);
      }
    },
  });

  createEditorReadonly(editorView, () => storageType() !== "local");
  createEditorControlledValue(editorView, getLanguageTextForStorageType);

  createExtension(solarizedLight);
  createExtension(lineNumbers);
  createExtension(javascript);
  createExtension(keymap.of(defaultKeymap));

  const matcher = () => {
    return spam`<$${buildString(language().canonicalURL)}:${buildIdentifier(matcherTag())} />`;
  };

  const productions = () => {
    if (!language()) {
      return [];
    } else {
      return generateProductions(language().grammar);
    }
  };

  let enhancers = {};

  enhancers = { ...debugEnhancers, enhancers };

  const ctx = () => {
    return Context.from(language(), enhancers.bablrProduction);
  };

  let tags = () =>
    map(
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
        const d = makeDeferred();
        deferreds.push(d);
        if (playing()) {
          return wait(15).then(() => tag);
        } else {
          return d.promise.then(() => tag);
        }
      },
    );

  const consume = async () => {
    for await (const tag of tags()) {
      setOutput([...output(), tag]);
    }
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
              <label for="experiment-input" style={{ "text-align": "center" }}>
                Input
              </label>
              <div
                id="matcher-tag-input"
                style={{ display: "inline-flex", gap: "1rem", padding: "10px" }}
              >
                <label for="matcher-tag">Matcher: </label>
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
              id="form-pause"
              onClick={() => {
                setPlaying(false);
              }}
            >
              Pause
            </button>
            <button
              id="form-play"
              onClick={async () => {
                consume();
                setPlaying(true);
                try {
                  if (deferreds.length) {
                    let deferred = deferreds.shift();
                    deferred.resolve();
                  }
                } catch (e) {
                  console.log(e);
                }
              }}
            >
              Play
            </button>
            <button
              id="form-reset"
              onClick={() => {
                setPlaying(false);
                setOutput([]);
              }}
            >
              Reset
            </button>
          </div>
          <div
            id="output"
            style={{ display: "flex", "flex-flow": "column", height: "50%" }}
          >
            <label for="experiment-output" style={{ "text-align": "center" }}>
              Output
            </label>
            <textarea id="experiment-output">
              <For each={output()}>
                {(line) => {
                  return <>{printTag(line) + "\n"}</>;
                }}
              </For>
            </textarea>
          </div>
        </div>
        <div id="playground-right" style={{ width: "50%" }}>
          <div id="grammar" style={{ display: "flex", "flex-flow": "column" }}>
            <h4 style={{ "text-align": "center" }}>Grammar</h4>
            <select
              id="grammar-flag"
              onInput={(e) => {
                setStorageType(e.currentTarget.value);
              }}
              style={{ width: "200px" }}
            >
              <option value="default">CSTML</option>
              <option value="local">Local Storage</option>
            </select>
            <div id="experiment-grammar" ref={ref}></div>
          </div>
        </div>
      </div>
    </>
  );
}
