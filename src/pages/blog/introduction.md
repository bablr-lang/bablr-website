---
layout: "../../layouts/BlogLayout.astro"
title: "An introduction to BABLR"
author: "Stirling Hostetter"
date: "10/31/2024"
draft: false
---

# The first of many...

This is the first in what we hope will be a series of status updates intended to
provide the most recent updates surrounding the development of BABLR.

To catch you up on what has happened so far, BABLR started development in 2020
as `cst-tokens`, intended as a successor to `recast`. Since then the scope of
the project has grown considerably, and it now aims to be a new fully featured
IDE, built from the ground up. Its development has also progress steadily over
the last four years, with Conrad (aka conartist6) working on the project full
time.

My name is Stirling (aka stirlhoss) and I have been following the project for 2
and half years now. Together Conrad and I founded Silphium Labs with the goal of
developing the BABLR technology and use it to bring programming literacy to a
majority of the general population. For the past three months I’ve been working
part time, but as of tomorrow I will be working full time for Silphium:
developing the core BABLR technology, doing community outreach, and building out
this website.

## Here are some of the major accomplishments we’ve had so far:

- Bootstrapped the BABLR VM: a system for defining LR parsers that are
  implemented in terms of itself.
- Implemented regex parsing over streaming inputs
- Built an efficient representation for asynchronous input streams

## Here is a list of some of the things we’ve accomplished recently:

- Numerous changes and improvements to CSTML, the core markup language that
  powers BABLR
- Built a prototype of Paneditor, our browser-based drag and drop visual code
  editor
- Released a new stable version of BABLR
- Released a Deno version of our CLI
- Implemented template tag interpolation rigorously
- Implemented a prototype of the Spamex pattern matching language
- Defined `$` flag as a way of defining templates
- Set a tentative date for an alpha release on or around November 18th

## Some goals we hope to reach next month include:

- Launch an interactive playground on the website
- Add the ability to use nested (JSON-structured) attributes in CSTML
- Implement drag and drop end to end for the first time in Paneditor

Right now this website is mostly stubbed out pages and layouts, but we are
hoping to rapidly expand its content as we race closer and closer to having a
production-ready product. Eventually this will be a place you can find
tutorials on building grammars, docs on how to make use of all of BABLR's rich
features, and informative blog posts detailing the engineering work that goes
into making it all a reality.

If you would like to contribute to the building of the website or any part of
BABLR, feel free to hop into our [Discord](https://discord.gg/pTbg4JGEZp). There
is no shortage of work that needs doing and we have tasks at a wide array of
skill levels. Any and all help is welcome!
