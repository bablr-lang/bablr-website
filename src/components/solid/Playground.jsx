/* global setTimeout document */
import { spam } from "@bablr/boot";
import { streamParse, Context } from "bablr/enhanceable";
import { debugEnhancers } from "@bablr/helpers/enhancers";
import { buildString, buildIdentifier } from "@bablr/helpers/builders";
import { generateProductions } from "@bablr/helpers/grammar";
import { resolveTags } from "@bablr/helpers/stream";
import { createSignal, For, Match, Switch } from "solid-js";
import { evaluateIO } from "@bablr/io-vm-web";
import { printType, printTag } from "@bablr/agast-helpers/print";
import { defaultLanguageInput } from "./language.js";
import { makePersisted } from "@solid-primitives/storage";
import { getStreamIterator, StreamIterable } from "@bablr/agast-helpers/stream";
import { Coroutine } from "@bablr/coroutine";
import * as helpers from "@bablr/helpers";
import "./Playground.css";

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
  const [input, setInput] = createSignal("<!0:cstml><_></>");
  const [matcherTag, setMatcherTag] = createSignal("Document");
  const [playing, setPlaying] = createSignal(false);
  const [paused, setPaused] = createSignal(false);
  const [storageType, setStorageType] = createSignal("default");
  const [localLanguageInput, setLocalLanguageInput] = makePersisted(
    createSignal(""),
    { name: "languageInput" },
  );

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
        `return (helpers) => { ${getLanguageTextForStorageType()}; return {canonicalURL, grammar, getCooked} }`,
      )()(helpers);
    } catch (e) {
      console.error(e);
    }
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
      resolveTags(
        ctx(),
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
      ),
      (tag) => {
        if (playing()) {
          return wait(0).then(() => tag);
          // return wait(15).then(() => tag);
        } else {
          const d = makeDeferred();
          deferreds.push(d);
          return d.promise.then(() => tag);
        }
      },
    );

  const consume = async () => {
    let depth = 0;
    let el = document.getElementById("experiment-output");
    let height = 0;
    for await (const tag of tags()) {
      if (tag.type === Symbol.for("OpenNodeTag")) {
        depth++;
      } else if (tag.type === Symbol.for("CloseNodeTag")) {
        depth--;
      }
      let sp = (
        <span
          style={{
            position: "absolute",
            top: `${height}px`,
            width: "100%",
            display: "block",
          }}
        >
          {/*@once*/ "\u00a0".repeat(depth * 2) + printTag(tag) + "\n"}
          <br />
        </span>
      );
      el.append(sp);

      height += sp.scrollHeight;
      el.scrollTop = el.scrollHeight;
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
                style={{
                  display: "inline-flex",
                  gap: "1rem",
                  padding: "10px",
                }}
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

                <Switch>
                  <Match when={paused()}>
                    <button
                      id="form-resume"
                      class="icon-button"
                      title="Resume"
                      onClick={() => {
                        setPlaying(true);
                        setPaused(false);
                        deferreds[0].resolve();
                      }}
                      style={{ height: "100%" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M17 6v12h-2V6zm-4 6l-6 6V6z"
                        />
                      </svg>
                    </button>
                  </Match>
                  <Match when={!paused()}>
                    <button
                      id="form-pause"
                      class="icon-button"
                      title="Pause"
                      onClick={() => {
                        setPlaying(false);
                        setPaused(true);
                      }}
                      style={{ height: "100%" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M6 3h2v18H6zm10 0h2v18h-2z"
                        />
                      </svg>
                    </button>
                  </Match>
                </Switch>
                <button
                  id="form-play"
                  class="icon-button"
                  title="Play"
                  onClick={() => {
                    setPlaying(true);
                    document.getElementById("experiment-output").innerHTML = "";
                    consume();
                  }}
                  style={{ height: "100%" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M6 20.196V3.804a1 1 0 0 1 1.53-.848l13.113 8.196a1 1 0 0 1 0 1.696L7.53 21.044A1 1 0 0 1 6 20.196"
                    />
                  </svg>
                </button>
                <button
                  id="form-step"
                  class="icon-button"
                  title="Step"
                  onClick={() => {
                    if (deferreds.length) {
                      let deferred = deferreds.shift();
                      deferred.resolve();
                    }
                  }}
                  style={{ height: "100%" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12.172 11L7.515 6.343L8.929 4.93l7.07 7.07l-7.07 7.072l-1.414-1.414L12.17 13H3v-2zM18 19V5h2v14z"
                    />
                  </svg>
                </button>
                <button
                  id="form-reset"
                  class="icon-button"
                  title="Reset"
                  onClick={(e) => {
                    e.preventDefault();
                    setPlaying(false);
                    setPaused(false);
                    document.getElementById("experiment-output").innerHTML = "";
                    deferreds = [];
                  }}
                  style={{ height: "100%" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2v2a8 8 0 1 0 5.135 1.865L15 8V2h6l-2.447 2.447A9.98 9.98 0 0 1 22 12"
                    />
                  </svg>
                </button>
              </div>
              <textarea
                id="experiment-input"
                spellcheck="false"
                value={input()}
                onInput={(e) => setInput(e.currentTarget.value)}
              >
                {input()}
              </textarea>
            </div>
          </div>
          <div
            id="output"
            style={{ display: "flex", "flex-flow": "column", height: "50vh" }}
          >
            <label for="experiment-output" style={{ "text-align": "center" }}>
              Output
            </label>
            <div
              id="experiment-output"
              contentEditable
              spellcheck="false"
              style={{
                "overflow-y": "auto",
                background: "white",
                height: "100%",
                border: "1px solid black",
                position: "relative",
                padding: "2px",
                "font-family": "monospace",
              }}
            ></div>
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
            <div
              id="experiment-grammar"
              style={{
                background: "white",
                "white-space": "pre",
                "font-family": "monospace",
              }}
              spellcheck="false"
              contentEditable
              onBlur={(e) => {
                if (storageType() === "local") {
                  setLocalLanguageInput(e.currentTarget.innerText);
                }
              }}
            >
              {getLanguageTextForStorageType()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
