/* global console window setTimeout document */
import { streamParse } from "bablr/enhanceable";
import { debugEnhancers } from "@bablr/helpers/enhancers";
import {
  buildPropertyMatcher,
  buildBasicNodeMatcher,
  buildOpenNodeMatcher,
  buildNodeFlags,
} from "@bablr/helpers/builders";
import { generateProductions } from "@bablr/helpers/grammar";
import { createSignal, For, Match, Switch } from "solid-js";
import { evaluateIO } from "@bablr/io-vm-web";
import { printType, printTag } from "@bablr/agast-helpers/print";
import { defaultCSTMLGrammar } from "./cstml.js";
import { defaultJSONGrammar } from "./json.js";
import { makePersisted } from "@solid-primitives/storage";
import { getStreamIterator, StreamIterable } from "@bablr/agast-helpers/stream";
import { Coroutine } from "@bablr/coroutine";
import * as helpers from "@bablr/helpers";
import "./Playground.css";
import { getFlagsWithGap, nodeFlags } from "@bablr/agast-helpers/tree";
import { buildEmbeddedMatcher } from "@bablr/agast-vm-helpers/builders";

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

const fixupSelection = () => {
  let selection = document.getSelection();
  let { focusNode, focusOffset } = selection;

  if (!focusNode) return;

  let wrapperNode = ["BR", "#text"].includes(focusNode.nodeName)
    ? focusNode.parentNode
    : focusNode.firstChild?.nodeName === "DIV"
      ? focusNode.firstChild
      : focusNode;

  let empty =
    !wrapperNode.previousSibling &&
    !wrapperNode.textContent.slice(0, focusOffset);

  // if (empty) {
  //   selection.getRangeAt(0).selectNodeContents(wrapperNode);
  //   selection.getRangeAt(0)?.collapse();
  // }

  if (empty || selection.containsNode(wrapperNode)) {
    selection.getRangeAt(0).setStart(wrapperNode.firstChild, 0);
    selection
      .getRangeAt(0)
      .setEnd(wrapperNode.lastChild, wrapperNode.lastChild.length);
    // return true;
  }

  return empty;
};

export const map = (tags, fn) => new StreamIterable(__map(tags, fn));

const wait = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

export default function App() {
  const [input, setInput] = createSignal("<!0:cstml><__></>");
  const [productionName, setProductionName] = createSignal("Document");
  const [flags, setFlags] = createSignal(getFlagsWithGap(nodeFlags));
  const [playing, setPlaying] = createSignal(false);
  const [paused, setPaused] = createSignal(false);
  const [parserType, setParserType] = createSignal("cstml");
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
        `return (helpers) => { ${getLanguageTextForParserType()};
        let _return_ = {};
        if (typeof canonicalURL !== 'undefined') _return_.canonicalURL = canonicalURL;
        if (typeof grammar !== 'undefined') _return_.grammar = grammar;
        if (typeof getCooked !== 'undefined') _return_.getCooked = getCooked;
       return _return_; }`,
      )()(helpers);
    } catch (e) {
      console.error(e);
    }
  };

  const getLanguageTextForParserType = () => {
    switch (parserType()) {
      case "local":
        return localLanguageInput();
      case "cstml":
        return defaultCSTMLGrammar;
      case "json":
        return defaultJSONGrammar;
      default:
        throw new Error();
    }
  };

  const matcher = () => {
    return buildEmbeddedMatcher(
      buildPropertyMatcher(
        null,
        null,
        buildBasicNodeMatcher(
          buildOpenNodeMatcher(buildNodeFlags(flags()), productionName()),
        ),
      ),
    );
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

  let tags = () =>
    map(
      evaluateIO(() =>
        getStreamIterator(
          streamParse(
            language(),
            matcher(),
            input(),
            {},
            { enhancers, emitEffects: true },
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
    let height = 4;
    for await (const tag of tags()) {
      if (tag.type === Symbol.for("CloseNodeTag")) {
        depth--;
      }
      let sp = (
        <span
          style={{
            position: "absolute",
            top: `${height + 4}px`,
            width: "100%",
            display: "block",
          }}
        >
          {/*@once*/ "\u00a0".repeat(depth * 2) + printTag(tag) + "\n"}
          <br />
        </span>
      );
      el.append(sp);

      if (tag.type === Symbol.for("OpenNodeTag") && !tag.value.selfClosing) {
        depth++;
      }

      height += sp.scrollHeight;
      el.scrollTop = el.scrollHeight;
    }
  };

  return (
    <>
      <div id="playground" style={{ display: "flex", "flex-flow": "row" }}>
        <div
          id="playground-left"
          style={{
            display: "flex",
            "flex-flow": "column",
            width: "50%",
            height: "100%",
            position: "relative",
          }}
        >
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
              style={{
                display: "flex",
                "flex-flow": "column",
                width: "100%",
                height: "100%",
              }}
            >
              <label class="section" for="experiment-input">
                Input
              </label>
              <div class="controls">
                <label for="matcher-tag">Production: </label>
                <select
                  id="matcher-tag"
                  onInput={(e) => {
                    setProductionName(e.currentTarget.value);
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
                        <option selected={key === productionName()} value={key}>
                          {key}
                        </option>
                      );
                    }}
                  </For>
                </select>

                <div class="buttons">
                  <b title="token">
                    <label class="mx-2">*</label>
                    <input
                      checked={flags().token}
                      onInput={(e) => {
                        setFlags({ ...flags(), token: e.target.checked });
                      }}
                      type="checkbox"
                    />
                  </b>
                  <b title="hasGap">
                    <label class="mx-2">$</label>
                    <input
                      checked={flags().hasGap}
                      onInput={(e) => {
                        setFlags({ ...flags(), hasGap: e.target.checked });
                      }}
                      type="checkbox"
                    />
                  </b>
                  <b title="fragment">
                    <label class="mx-2">_</label>
                    <input
                      checked={flags().fragment}
                      onInput={(e) => {
                        setFlags({ ...flags(), fragment: e.target.checked });
                      }}
                      type="checkbox"
                    />
                  </b>
                  <b title="coverFragment">
                    <label class="mx-2">_</label>
                    <input
                      checked={flags().cover}
                      onInput={(e) => {
                        setFlags({ ...flags(), cover: e.target.checked });
                      }}
                      type="checkbox"
                    />
                  </b>
                </div>

                <div
                  class="buttons"
                  style={{ "flex-grow": "1", "justify-content": "flex-end" }}
                >
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
                      document.getElementById("experiment-output").innerHTML =
                        "";
                      consume();
                    }}
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
                      document.getElementById("experiment-output").innerHTML =
                        "";
                      deferreds = [];
                    }}
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
              </div>
              <textarea
                id="experiment-input"
                spellcheck="false"
                value={input()}
                onInput={(e) => {
                  setInput(e.currentTarget.value);
                }}
                class="border rounded-md p-2 w-full text-base text-black bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {input()}
              </textarea>
            </div>
          </div>
          <div
            id="output"
            style={{ display: "flex", "flex-flow": "column", "flex-grow": 1.5 }}
          >
            <label
              class="section"
              for="experiment-output"
              style={{ margin: "10px 0" }}
            >
              Output
            </label>
            <div
              id="experiment-output"
              spellcheck="false"
              onClick={(e) => {
                if (e.detail % 3 === 0) {
                  let range = document.createRange();
                  range.selectNodeContents(e.target.parentElement);
                  let sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }}
              style={{
                "overflow-y": "auto",
                background: "white",
                height: "100%",
                border: "1px solid black",
                position: "relative",
                padding: "8px",
                "font-family": "monospace",
              }}
            ></div>
          </div>
        </div>
        <div id="playground-right" style={{ width: "50%" }}>
          <div id="grammar" style={{ display: "flex", "flex-flow": "column" }}>
            <label class="section">Parser</label>
            <div class="controls">
              <label for="grammar-flag">Grammar: </label>
              <select
                id="grammar-flag"
                onInput={(e) => {
                  setParserType(e.currentTarget.value);
                }}
                style={{ width: "200px" }}
              >
                <option value="cstml">🔒 CSTML</option>
                {/* <option value="json">🔒 JSON</option> */}
                <option value="local">My grammar</option>
              </select>
            </div>
            <div
              id="experiment-grammar"
              style={{
                background: "white",
                "white-space": "pre",
                "font-family": "monospace",
                color: parserType() !== "local" ? "gray" : null,
              }}
              spellcheck="false"
              contentEditable
              onKeyDown={(e) => {
                if (
                  (parserType() !== "local" &&
                    !(e.metaKey || e.ctrlKey || e.altKey || e.fnKey) &&
                    ![
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)) ||
                  (e.key === "Backspace" && fixupSelection())
                ) {
                  e.preventDefault();
                }

                if (
                  ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    e.key,
                  )
                ) {
                  fixupSelection();
                }
              }}
              onClick={(e) => {
                if (e.detail % 3 === 0) {
                  let range = document.createRange();
                  range.selectNodeContents(e.target);
                  let sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                if (parserType() !== "local") return;

                if (document.getSelection().focusNode.tagName === "DIV") {
                  let range = document.createRange();
                  range.selectNodeContents(
                    document.getSelection().focusNode.firstChild,
                  );
                  let sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
                }

                let clipboardData = e.clipboardData || window.clipboardData;

                fixupSelection();

                let wasEmpty = e.target.innerText === "\n";

                if (wasEmpty) {
                  e.target.innerText = clipboardData.getData("Text").toString();

                  fixupSelection();
                } else {
                  document.getSelection().deleteFromDocument();
                  document
                    .getSelection()
                    .getRangeAt(0)
                    .insertNode(
                      document.createTextNode(clipboardData.getData("Text")),
                    );
                }

                document.getSelection().getRangeAt(0).collapse();
              }}
              onBlur={(e) => {
                if (parserType() === "local") {
                  setLocalLanguageInput(e.currentTarget.innerText);
                }
              }}
            >
              <div id="grammar-wrapper">{getLanguageTextForParserType()}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
