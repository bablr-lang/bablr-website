Post outline:

- Current events/hook

- A little hype

- What are the tools and how are they used

- Past and future (Knoebels)


# The Assistant and the Instrument

I promise you, this post is not about AI. Well, ok, maybe I should not have done that. This post is *mostly* not about AI. I cannot help that AI exists. It has its uses. It has even more dangers. To get where I'm going we have to start by talking about them, but while we need to discuss some philosophy this is not a philosophy post either. It is a [release announcement](https://bablr.org)!

As far as I can tell, the most practical dangers of AI have little to do with the kind of doomsday scenarios that Hollywood has been fond of preparing us for. No, the reality is much more mundane. Its biggest dangers are, predictably perhaps, inseparable from its greatest strengths: it can trick unwary people into thinking of it as an individual instead of a mirror image, and it can appear to be the solution to any problem .

My beef is that most problems it appears to be the solution to often have much simpler solutions, and writing code is no exception. To hear the more vigorous AI-evangelists tell it, AI will make coders 10x (or 100x!) more productive...

...but there's something a bit odd in a claim like this if you take some time to carefully unpack it! If many people believe that coders are capable of 10x greater productivity, then it follows that they must believe that the tools coders are currently using are so suffocatingly inadequate for modern needs that they are impeding overall productivity by a factor of 10x.

Strangely though I am not fan of AI, I agree with this assessment wholeheartedly. But the AI-coding evangelists are asking you to make a strange bet: that the current tools are both agressively suffocating self-expression, and that for some reason the solution to that problem is not in fact fixing the tools to be more expressive, but instead to continue to use the same old tools but delegate their use to an assistant. I have made exactly the opposite bet: that I can build better tools. Not an assistant, no! The name for a kind of tool that amplifies the expressive power of its user (or player) is an instrument.

For the past 5 years I've been working on a creating a new kind of instrument for writing code, and today I'm very pleased to announce that today it is ready for you to try!

## The Present

Today, most code is written in text editors. There are three main problems that I see with writing code in a text editor:

- Conceptually the content of the document being edited tends to ping-pong back and forth between being plain text and being a computer program. This is catastrophic for user experience that every serious IDE uses error-recovering parsers, yet error recovery is not a game you can ever win: garbage in, garbage out. Once the user's intent has been lost the only way to recover is to get the user to clarify their intent. But it's far easier to just make a system where the user's intent is not lost in the first place!
- Flat files on the filesystem are a poor integration surface. You might change 1 character in a 10MB file and hit save, after which 10MB of data must be written to disk. Other tools which need to react to changes must do so using a file watcher, and most likely the file watcher will emit several change events for this one write. Now the listener needs to debounce these events, which starts to get into weird messy heuristics like "is defnsively waiting 100ms enough?" Once again, this is a problem of lost intent.
- Your IDE's intelligence is probably made up of a text buffer and a syntax tree, but even a small change may force you to throw away every node in the syntax tree and start over. This is because the syntax tree stores index ranges which point into the text buffer, e.g. perhaps `{ start: 0, end: 1337 }`. Add a single space at the beginning of the text buffer, say, and every node's `start` and `end` will need to be incremented by one or else the buffer and the tree representations of the code will desync from each other.

If nothing else these issues are remarkable in their pervasiveness. They affect almost every popular programming language, tool, and IDE becaue an IDE is an *integrated* development environment and these are problems that occur because of how the integration layer is designed.

I don't think I have to get so technical for people to be able to understand what I mean, though. AI aside, the tools people use to write code have changed little in the last 20 - 50 years. The tools still *feel* more or less the same. File tree. Line numbers. Regex search. Go-to-definition. Diffs. And of course, don't make your files too many lines lines too many characters or the tool will get slow and maybe break.

# A DOM for Code

This project's mission is to plant the seeds of the next era in human coding, one in which the "vibe" of coding changes from typing high WPM on a typewriter to playing with a set of Lego bricks.

But this leaves with a particular engineering challenge: what is the shape of the brick?

Brick programming is nothing new, with languages like [Scratch](https://scratch.mit.edu/) often being the first exposure kids have to coding. Indeed block coding spreads far beyond primary education, with a whole "no-code" industry which promises to let people snap together bricks to build programs.

Yet for as much value as there is in drag and drop systems of programming, pretty much all serious programmers still write code in text files which they edit with special text editors (IDEs). This is for two main reasons: first, there is no more efficient way to communicate a programming idea to a person than using syntax. It's compact and easy to scan visually for repeating patterns. People are constantly inventing new syntaxes that maximize how effectively we can communicate complex ideas with simple syntax! The second reason block programming hasn't taken off is that it has poor economics: the editor tends to be fused directly to the language implementation. Thus if I need to use 10 different block programming languages in a day, I'll have to adjust to 10 different code editors, each working more the way the person that created it wanted rather than the way I would have preferred. With text editors though I can use one tool to edit 10 different text files, even if the code in each file is written using a different programming language.

This sets the stage for our core innovation: we've fused the disciplines of text-file programming and block programming into an entirely new kind of thing: DOM programming, which combines the best aspects of each of its parents. From text programming we keep syntax. The blocks we use are syntax tree nodes, thus a tree of blocks can be rendered as its text content (not unlike how a tree of nodes in HTML has `innerText`). From block programming (and the HTML DOM) we take the idea that code is written in documents, and that changes to the document must be semantic transitions between valid states. You'll never have to spend more time looking for a misplaced brace or semicolon or close quote.

The most exciting end result is that by coming up with a universal shape for a syntax tree node, we're finally throwing wide open the door to writing and refactoring code using scripts. In this new era of coding you will be able to experimentally refactor your whole codebase as easily as you would change the contents of an HTML document (in perhaps hundreds of locations) by modifying the definition of a single component.

This ability is sure to blend in fantastically interesting ways with the abilities of LLMs as well. Models will both be undercut by a new human ability to refactor large amounts of code without being limited by typing speed, while at the same time models which learn how to write these refactoring scripts will gain the ability to perform complex, high-touch refactors with mathematical consistency while costing only the small number of tokens necessary to write the change script.

## Here it is

Enough of this philosophical prevaricating. I spent five years building and rebuilding (and reuilding) code to explore these ideas in depth, and I'm just dying to share what I've learned.

We've taken the most inspiration from HTML and XML, and so I'm pleased to announce that we have made our own language data serialization, known as the Concrete Syntax Tree Markup Language, or **CSTML**. A simple CSTML document might look like this:

```
<BinaryExpression>
  left:
  <_Expression>
    _: <*Identifier 'a' />
  </>
  operator*: <* '+' />
  right:
  <_Expression>
    _: <*Identifier 'b' />
  </>
</>
```

We have [a full guide on CSTML](https://docs.bablr.org/guides/cstml) for those interested, but for now lets just unpack some basics. This document has 6 nodes in it: a `BinaryExpression`, two `Identifier` "token nodes", two `Expression` "cover nodes", and one anonymous token node. Together these nodes describe how the parser saw a short string of text `a+b`.

Since the CSTML documents are primarily designed to hold parse trees, the primary way that you'll generate CSTML documents is by using a parser! We built **BABLR** to help people quickly write CSTML-producing parsers.

Since asking people to rewrite their parsers is a great deal of work, we've invested a great deal of effort into making sure BABLR is the easiest possible tool to use for writing parsers. All its code, both the core and the grammars, are written and run as plain Javascript with no compile step. Our API is just `outputStream = parse(language, inputStream)`

BABLR parsers are so lightweight that we're using them to syntax highlight the code on this page right on your client. They're just functional code, so you can even make higher order parsers like JSX: `parse(jsxEnhancer(es3Language), inputStream)`.

Finally our slate of technologies ends with **agAST**, short for "A Generalized Abstract Syntax Tree," which is the name we use for the particular way that CSTML syntax trees are exposed to Javascript in-memory. Parse trees have particularly complex internal schemas, and for ease of access our trees need to store multiple sources of truth for some kinds of data. These were both reasons that we knew that agAST trees would need to be deeply immutable, and correct-by-construction, putting us line with the principles described so succinctly by Lexi Lambda as "[Parse don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)".

## Putting the pieces together

Here's a more complicated example, complete with comments:

```js
import { buildTag, printSource } from 'bablr';
import { t } from '@bablr/boot';
import { Path } from '@agast/helpers/path';
import { treeFromStream } from '@agast/helpers/tree';
import language from '@bablr/language-en-esnext';

let js = buildTag(language);

let condition = js`true`;
let consequent = js.Statement`log("y")`;

// We parse first, *then* interpolate
// Without gap support, this template would not parse as valid JS
let code = js`while (${condition}) ${consequent}`;

// All our formatting is preserved verbatim
printSource(code) === 'while (true) log("y")'; // true

// Here we will hand-build a segment of tree
let newString = treeFromStream([
  t`<String>`,
  t`  openToken:`, t`  <* "'" />`,
  t`  content:`, t`  <*StringContent "N" />`,
  t`  closeToken:`, t`  <* "'" />`,
  t`</>`
]);

// A Path retains your currect context as you move around in a tree
// We need a path to the string we wish to replace, but what is it?
let path = Path.from(code);

// To replace the string we need to know its path in the tree
// Here is the code. The JS parser built into this page should
// allow you to see how it is structured.
while (true) log("y")

// Now we can use the structure we see to target the string
let loopBodyPath = path.get(['statements', 0, 'body']);
let logPath = loopBodyPath.get(['statements', 0]);
let argPath = logPath.get(['arguments', 0]);

// Paths are immutable, so we must store the return value
let newArgApth = argPath.replaceWith(newString);

// The old path and node are still there unchanged
printSource(argPath.node) === '"y"'; // true
// But we can see our new node at the old path
printSource(newArgApth.node) === "'N'"; // true

// The logged string is N and the code now uses single quotes
code = newArgPath.rootNode;
printSource(code) === "while (true) log('N')"; // true
```

While the interface we're offering here is not perfect (and is not yet perfectly polished in quality) I am aware of no other API for refactoring so flexible. You can see, hopefully, that while the system is written in Javascript, its APIs are designed in a way that are totally language agnostic. Just by substituting a different `language` we could have used these same libraries and APIs just as easily to edit a Python script or a Java class or Clojure or Brainfuck. If you put a few extra nodes at the root of the tree as a virtual filesystem, now you can use scripting on immutable data structures to move code between files and even create, rename, and delete files, all using this one system of immutable Lego-brick nodes and this one set of flexible `Path` APIs!

## The future

There's already a remarkable amount that's already/immediately possible with this system. One the first day this blog post is published, there will be very few parsers available, and the ones that are available like JS/TS will need bugfixes, improvements, and missing features built. But even without new releases of the core, each parser built (by me or through community contributions) will make the platform more useful, and more powerful, and more desirable to build tools on top of.

My role in all this is to broker a compromise between the competing needs of three key groups of people: people who design programming languages, people who build tools, and the users. If I've done well in representing and prioritizing the needs of each group then theoretically a virtuous cycle should form in which language authors create value by writing parsers which then makes it worth creating new tools like IDEs, debuggers, and even whole code forges which might share more of Unison's DNA that Github's. In turn building these much-used features should help us get new users who want to bring the tools with then to new languages for which they write more parsers and tools which attract more users...

And then I hope something even better will happen: we'll attract more implementations! XML started its life in Java, but now many langauges implement XML. JSON got popular with Javascript, and then gained implementations in many langauges. So to do I hope that the Javascript implementation of CSTML and BABLR will prove to be more like a reference implementation that can be a blueprint implementations in other languages like Python or Rust or Java. A remarkable amount is possible when you're talking about a tool whose theoretically capabilities include transpiling code between unrelated programming langauges.

Where it goes from there, well, that's up to you! I wrote this code in the hopes that people would use it to do things with it that I never imagined or anticipated. Now I have to wait and see what people show me. If Minecraft is any indication, all human creativity lacks for on any given day is an outlet and an audience.





```
<p>
  "You might enjoy reading " <a { href: 'https://xkcd.com' } 'XKCD' /> ", a webcomic of romance, math, sarcasm, and language."
</>
```

In fact this blog post was authored using CSTML as an embedding format for HTML documents! This has the benefit of allowing us to sidestep HTML's [weird awful whitespace semantics](https://blog.dwac.dev/posts/html-whitespace/).







The problem we are left with then is that we haven't been able to agree *at the integration surface* how the big stacks should be broken down.

Today I am offering a new proposed solution for how to break code down at the integration layer: using 




 Whether human or bot we still write code in files, where a file is a direct analog to a stack of punchcards. Pretty much every tool you use for code will have line numbers on the left hand side, partly I suspect as a kind of branding. "Hey," it announces. "I have line numbers. I'm a tool for *coders*!" But underneath this facade of branding there's a more practical purpose: many if not tools start to break down when there are too many characters on one line or too many lines in one file.

It's almost as if behind the scenes the IDE is really a robot arm which is fetching and storing stacks of punchcards and if you make the stacks too tall the robot arm has to go much slower to support the weight and keep the stack from toppling. The end result is that you can give any coder instant nightmare flashbacks just by saying a phrase like "47,000 lines of code in one file." They will be picturing (something like) a robot crushed under a stack of punchcards the size of a skyscraper. And they will be picturing themselves, having to try to use that poor, lumbering, overloaded robot to try to accomplish delicate surgery on the skyscraper-size stack.

We've proven with Git that we can break big files down into little chunks of manageable size: the single file becomes a database of many "objects". This shows us how to avoid crushing our card-carrying robot friends under the weight of huge stacks of cards. Unfortunately git requires files to be "checked out" from its library-database, which is how we say that all the manageable little stacks of punchcards are being reassembled into skyscrapers, because your IDE expects to integrate in terms of skyscraper-stacks which it then breaks down into manageably small pieces in a similar-but-different way to how Git does it.


To acco
