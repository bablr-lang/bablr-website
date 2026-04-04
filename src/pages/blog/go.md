## Parsing goes streaming with BABLR and CSTML

Happy Thursday! I'm extremely very excited to be able to share that as of today there is an entire new tech stack published (on npm) and an entire new seedling ecosystem, a whole world of opportunity which is now ready for anyone, maybe even you, to come into and explore! All of the magic happens right here, inside your web browser. I'm Conrad, and these technologies are my brainchild. I had a career working for a slate of Silicon Valley companies, notably Facebook where I was a UI Engineer on internal tools. I'm what you might call a software hacker. I don't mean that I break into things though, I mean that I create them: that I see my software as my art. To quote [Paul Graham](https://www.paulgraham.com/hp.html): "Hacking and painting have a lot in common. In fact, of all the different types of people I've known, hackers and painters are among the most alike." He goes on to explain more concretely: "You're asking for trouble if you try to decide what to do without understanding how to do it."

In 2020 during peak Covid I quit my job as Principal Engineer at Autodesk and started tinkering with code. Not as a startup, but just as hacker. I wanted to see what I could make. At first I wanted to see if I could make a streaming regex engine. I could. Then, I wondered, might I be able to make it easy to write streaming parsers? The journey to answer that question consumed the next four years of my life, leaving me rich in software and decided cash-poor.

But I have answered the question! And the answer is an emphatic, resounding, "Yes!" As of today BABLR is available on NPM, with the primary entry points into its package ecosystem being:

- `bablr`: The main API package for stream parsing. Its name is a portmanteau of Babel and ANTLR.

- `@bablr/cli`: A CLI for experimenting with streaming parse results

- `bedazzlr`: A syntax highlighting engine for the web.

If you're reading this on my blog with Javascript enabled in your browser, Bedazzlr probably finished running your first BABLR parses (to highlight our code examples below) before you had even gotten done reading the first sentence.

We can do all this because BABLR is really lightweight. It's not just transpiled to Javacript, it's written in Javascript. For the kinds of reactions I get from people shocked that a serious person would choose to write a major project in _Plain Javascript_ I might as well have told them I wrote in assembly language, yet even this is not so far from the truth. To my mind the code you yourself run is the product, not the code I write. This is why I have chosen to hand-write the code you run. It's also why the code is very lightweight, snappily responsive, and highly debuggable all at the same time.

I'm super eager to dive right in with the example code and introduce Bedazzlr and BABLR, but before I do that there's one last named technology to introduce: the Concrete Syntax Tree Markup Language, or CSTML for short. This is a out serialization format for parse results, and it look a bit like HTML or XML (or SGML) but is its own thing uniquely adapted to its intended purpose. Like HTML, CSTML is a markup language, which is to say that it is a way to enable metadata to be embedded in text. A trivially simple CSTML document might look like this: `<*Boolean> 'true' </>` (also written as `<*Boolean 'true' />`). Both documents tells us the same thing: that the parser recognized the input text `true` and that this span of text was classified as being a `Boolean`. The `*` tells us that `Boolean` is a token node -- a leaf of the parse tree.

Bedazzlr uses this format to interactively annotate source code, sort of like the way the browser has the "Inspect Elment" feature, which is to say that Bedazzlr goes quite a ways beyond just syntax highlighting your code examples. It's more like having ASTExplorer seamlessly embedded right in your page! It not only makes CSTML easier for novices to approach, it allows us to make _every_ programming language easier for novices to approach.

But I digress. We're ready to do some parsing!

```js
// BABLR is bootstrapped: we define parsers using syntax that must be parsed
// The boot package breaks the paradoxical circular dependency
//   it provides "mini" parsers for our core syntaxes
import { m, re } from "@bablr/boot";

import { buildTag } from "bablr";
import { eat, eatMatch } from "@bablr/helpers/grammar";
import { printPrettyCSTML, printSource } from "@bablr/agast-helpers/tree";

// Lets define a parser for our first language!
// It recognizes natural numbers like `0` or `99` or `111100211005`
// It is stylistically formal: it rejects `00`
const language = {
  // Grammars are written as a Javascript classes
  // However these methods don't call each other directly,
  //   instead they yield instructions (action objects) to an engine
  //     the engine pushes the called production onto its call stack
  //     this allows the engine to make calling conditional on matching
  grammar: class {
    // `NaturalNumber` is the name of a production in our parser
    *NaturalNumber() {
      // `eat` acts like an assertion
      //   if input is not matched, evaluation will not proceed
      let firstDigit = yield eat(m`digits[]: <*Digit />`);

      // because we use eat we know digit is not null
      let leadingZero = printSource(digit.node) === "0";

      do {
        // `eatMatch` consumes input, but only if it exists
        //   `<*Digit />` directs the engine to invoke `this.Digit`
        digit = yield eatMatch(m`digits[]: <*Digit />`);

        // `digit` may be null here
        if (leadingZero && digit) yield i`fail()`;
      } while (digit);
    }

    // The parent line beginning with `digit = yield` lands here
    *Digit() {
      // Only token nodes can use regexes to directly eat input
      // Whether a production is a token is determined by the `*` in `<*Digit />`
      // Even dynamic calling conventions tend towards internal consistency!
      yield eat(m`/\d/`);
    }
  },
};

// Builds a new template tag
// Together language and matcher describe a Production
const digits = buildTag(language, m`<NaturalNumber />`);

// Template tags return concrete syntax trees
const tree = digits`42`;

// CSTML provides compact serializtion for our trees
printPrettyCSTML(tree) ===
  `
<NaturalNumber>
  digits[]: <*Digit '4' />
  digits[]: <*Digit '2' />
</>
`.trim();

// The parser guarantees we can always retrieve the original input
// It can be sure because the grammar cannot act, only request actions
printSource(tree) === "42";
```

Because Bedazzlr doesn't yet have support for embedded syntax I'll give you the CSTML tree that resulted from our parse once more time so that you have a proper place to see it with interactive syntax highlighting:

```cstml
<NaturalNumber>
  digits[]: <*Digit '4' />
  digits[]: <*Digit '2' />
</>
```

This example shows something else interesting about CSTML. Because it's origin is as a format for storing parse trees, nodes have named relationships to each other. This stands in contrast to languages like HTML or XML where the only relationship between nodes is `children`.

In the interests of keeping the example simple we used `buildTag` to do a tree parse. A stream parse is invoked as `streamParse(language, matcher, input)`, and it results in an iterator over a tag stream. If we print the emitted tags one per line they would look like this:

```cstml
<NaturalNumber>
digits[]:
<*Digit>
'4'
</>
digits[]:
<*Digit>
'2'
</>
</>
```

The tag stream is preserved in a tree, so you can put a tag stream into a tree for storage and then retreive the original stream later on. It might looks like this:

```js
import { streamParse } from "bablr";
import { treeFromStream, streamFromTree } from "@bablr/agast-helpers/tree";

let tag, tree;
tags = streamParse(language, m`<Matcher />`, "input");
tree = treeFromStream(tags);
tags = streamFromTree(tree);
```

This is probably a good time to mention that pretty much everything in BABLR is an iterator. Our input is iterators of characters, our grammars are iterators of instructions, and our outputs are iterators of tags.

There's a riddle in this: sync iterators would mean we couldn't use network or filesystem streams as inputs, and async iterators are just too slow to be used character by character. BABLR _is actually able_ to consume iterators of network or filesystem data character by character performantly though. How can that be? Well, because we've created a new kind of iterator called a "stream" iterator which is sync when it can be and async when it has to be. You'll rarely need to touch stream iterators directly when using BABLR though, you'll just produce and consume them using utility functions like we do in the example code above.

Let's try using the CLI to run a parse now. This time we'll use one of the existing grammars, the Javascript grammar, which we also use with the Javascript code in this page.

```bash
bablr -l @bablr/language-en-esnext -m '<Matcher />' <<< 'foo.bar'
```

The CLI will show you this output (and if you pass it the `-v` flag it will show you much more output than this):

```cstml
<_>
  _+:
  <Identifier>
    value: <*Literal 'foo' />
  </>
  ^^^
  <MemberExpression>
    object+$: <//>
    sigilToken*: <* '.' />
    property$:
    <Identifier>
      value: <*Literal 'bar' />
    </>
  </>
</>
```

This document has a few things going on that we haven't seen in previous CSTML doucments we've looked at. Most notable are `<//>` as the gap tag, and `^^^` as the shift tag. These tags are hints as to the kind of parsing algorithm we're using here: as you might have guessed from the name we help you write LR parsers, which is to say parsers that see the input from left to right. The tricky thing conceptually about LR parsers is that, as this output hints, when reading left to right we recognize that `foo` is an identifier before we look further right and realize that that there should be a bigger node, a member expression, wrapping around the identifier. The shift tag is used to maneuver the bigger node to the outside. We call the node that is above the shift tag the "held" node, and the held node is dropped into the first gap below the shift tag. To preserve the integrity of the parse output, input cannot be consumed while a node is being held.

Putting the held node in place we get something like this:

```
<_>
  _+:
  <MemberExpression>
    object+$:
    <Identifier>
      value: <*Literal 'foo' />
    </>
    sigilToken*: <* '.' />
    property$:
    <Identifier>
      value: <*Literal 'bar' />
    </>
  </>
</>
```

Shift tags (`^^^`) are generally a feature to allow the parser to be more eager in what it emits than it would otherwise be able to. Gap tags (`<//>`) have many uses than just shifting though! Gaps are incredibly useful as they allow us to indicate a location where content is known to be missing. The term of art for a string or document with some content known to be missing is a template. By snapping other documents into the gaps in your template (even other template documents) you can use composition to build up much more complex documents. Our aim is to make this experience feel as joyful as snapping together lego bricks. Let's build up some Javascript code by snapping together a few bricks!

```js
import { buildTag } from "bablr";
import { printSource } from "@bablr/agast-helpers/tree";
import language from "@bablr/language-en-es3";

let js = buildTag(langauge);

let hello = js`"Hello, world!"`;

let log = js.Program`console.log(${hello});`;

printSource(log) === 'console.log("Hello, world!")'; // true
```

What's great about this is that we're using the same trick that is used to make template strings a safe way to build SQL queries: we're parsing the code _then_ performing interpolation. This is a trick we can only do because our parser can recognize against inputs with gaps in them -- with holes. It's just one more clue as to why we felt we could achieve something by creating a new system of parsers when there are already so many out there. Yet we have some clear competitive advantages against those existing systems as well. Most existing systems are parser _generators_ which is to say that they involve a build step in which the parser definition you write is turned into something else which can be run. But with BABLR parsers there is no build step. You can drop a `debugger` statement right in the parser code you write and in developer tools you'll see the engine hit your breakpoint and you can step through a production's logic to debug it. Compared to debugging generated code, this is the height of luxury!

This starts to get to the heart of why I feel this project has been worth my investment in building it.

As I write this blog post, the ecosystem is still just a seedling. We have only a relatively small handful of parsers, and the more complicated ones like Javascript are both imperfect and incomplete. But in the days, weeks, months, and a years after this first release, the value of the core technologies will we are releasing today should only grow, if for no other reason than that more parsers will exist. Nothing prevents this system from being used to template and compose Python code, for example, or Clojure, or even COBOL. Those are all just parsers we haven't written yet. As the number of langauges we support grows, so too will our desirability of building tools that represent code as data using our tree structures. As the number of tools built on these data structures grows it will also increase demand for parsers further, which should increase the demand for tools further... This feedback loop or virtuous cycle is at the heart of why we are so excited about this work to become a major, stable platform over the long term. We have long known that meeting the intersection of the needs between authors of tools and authors of programming languages is our route to creating value, and we have relentlessly refined our value proposition to each group in the hopes that we can take something genuinely knew and scale it up to (and beyond) the size of incumbent technologies in this space like Tree-sitter and epsecially Language Server Protocol.

To kickstart this cycle we're going to be building a new IDE for writing code, and it will run right in your web browser. Our goal is to explore what an environment for code editing looks like that is not first and forefost a text editor. This lends itself naturally to also exploring how to make native-feeling code editing experience for touchscreens, and even perhaps VR where you could reach out and and pick code up, like it really was a construction made of Lego bricks that could be broken apart as easily as they had been snapped together.

You may wonder why we've spent so much time on this and have not built the IDE already, but the answer is that we have. It's hiding in plain sight! 95% of the code we need to offer you a rich IDE experience is already contained within the BABLR tech stack we're releasing today. It's running right here in this page right now. Our sleight of hand to make the behemoth bulk of an IDE like VSCode vanish into smoke involves completely consolidating duplicated representations of state, ripping out HTTP, ripping out layers and layers of assumptions about filesystems and flat text files, and banishing the prime complexity-demon in text-integrated tools: error-recovery in parsing. The whole stable "kernel" of our IDE weighs in at probably ~20,000 lines of code, and with it we think we can ensure a new generation of programmers need never know the pain of accidentally losing a brace or a paren during a complex edit and having to go hunt it down.

The ability to offer a high quality code editing experience in the web browser also suggests a clear course of action for how to make this project self-sustaining financially. It is our intention to blur if not erase the distinction between an IDE and a code forge, and so to follow in the great footprints of the current industry leaders, Git and Github.
