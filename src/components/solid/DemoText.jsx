/* global document window */
import { onCleanup, getOwner, runWithOwner } from "solid-js";
import { streamParse } from "bablr";
import { spam as m, re } from "@bablr/boot";
import { eat, match } from "@bablr/helpers/grammar";
import { OpenNodeTag, LiteralTag } from "@bablr/helpers/symbols";
import "./DemoText.css";

const arrayLast = (arr) => arr[arr.length - 1];

export const colors = [
  "rgb(131, 179, 32)",
  "rgb(47, 195, 106)",
  "rgb(42, 169, 210)",
  "rgb(4, 112, 202)",
  "rgb(107, 10, 255)",
  "rgb(183, 0, 218)",
  "rgb(218, 0, 171)",
  "rgb(230, 64, 92)",
  "rgb(232, 98, 63)",
  "rgb(249, 129, 47)",
];

const language = {
  canonicalURL: "https://localhost/bablr-org-demo",
  grammar: class DemoLanguage {
    *Message({ ctx }) {
      let l;
      while ((l = yield match(re`/./s`))) {
        let str = ctx.sourceTextFor(l);
        if (str === "<") {
          yield eat(m`letters[]: <*Letter { openSpan: 'Tag' } />`);
        } else if (str === ">") {
          yield eat(m`letters[]: <*Letter { closeSpan: true } />`);
        } else {
          yield eat(m`letters[]: <*Letter />`);
        }
      }
    }

    *Letter() {
      yield eat(re`/./s`);
    }
  },
};

const matcher = m`<$Message />`;

let startFrame = {
  filter: "blur(0px)",
  scale: 1,
  opacity: 1,
  transform: "translateY(0px)",
};

let midFrame = {
  filter: "blur(5px)",
  scale: 1.01,
  opacity: 0.8,
  transform: "translateY(-3px)",
};

function* gen(tags, node, traverse = false) {
  let iter = tags[Symbol.iterator]();
  let currentColors = [...colors].sort(() => Math.random() - 0.5);

  let step = iter.next();
  let open;
  let spans = [];
  let i = -1;

  let range = document.createRange();
  range.selectNodeContents(node.firstChild);
  range.collapse();

  while (!step.done) {
    let tag = step.value;

    switch (tag.type) {
      case OpenNodeTag: {
        open = tag;
        break;
      }

      case LiteralTag: {
        i++;

        if (traverse) {
          range.selectNode(node.children[i]);
        } else {
          range.setStart(node.lastChild, 0);
          range.setEnd(node.lastChild, 1);
        }

        let { openSpan, closeSpan } = open.value.attributes;

        if (closeSpan) {
          spans.pop();
        }

        let color =
          openSpan || closeSpan
            ? null
            : arrayLast(spans) === "Tag"
              ? currentColors.pop()
              : "black";

        let wrapper = traverse ? (
          node.children[i]
        ) : (
          <span
            openSpan={openSpan}
            closeSpan={closeSpan}
            style={{
              color,
              display: tag.value === " " ? "inline" : "inline-block",
            }}
          />
        );

        if (traverse) {
          wrapper.style.color = color;
        } else {
          range.surroundContents(wrapper);
        }

        if (!traverse || (!openSpan && !closeSpan))
          wrapper.animate([startFrame, midFrame, startFrame], {
            duration: 500,
            delay: 0,
            fill: "forwards",
          });

        yield;

        if (open.type === OpenNodeTag && openSpan) {
          let range = document.createRange();
          range.selectNode(wrapper);
          spans.push(openSpan);
        }

        break;
      }
    }

    step = iter.next();
  }
}

export default function ColourfulText({ text }) {
  let node = <span>{text}</span>;

  let iter = gen(streamParse(language, matcher, text), node);

  let wasteTicks = 15;

  const owner = getOwner();
  const timer = window.setInterval(() => {
    if (wasteTicks-- >= 0) return;

    runWithOwner(owner, () => {
      let step = iter.next();

      if (step.done) {
        wasteTicks = 100;

        iter = gen(streamParse(language, matcher, text), node, true);
      }
    });
  }, 65);

  onCleanup(() => {
    window.clearInterval(timer);
  });

  return node;
}
