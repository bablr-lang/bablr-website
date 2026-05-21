import type { AudienceType } from "./audiences";

interface RoadmapItem {
  title: string;
  description: string;
  audienceTypes: Array<AudienceType>;
}

interface RoadmapCategory {
  title: string;
  items: RoadmapItem[];
  status: "completed" | "in-progress" | "planned";
}

export const roadmapData: RoadmapCategory[] = [
  {
    title: "Planned",
    status: "planned",
    items: [
      {
        title: "1.0.0",
        description: "Declare the BABLR APIs stable",
        audienceTypes: ["tool", "ide", "lang"],
      },
      {
        title: "More implementations",
        description: "Try using BABLR to port itself to... Python? Rust?",
        audienceTypes: ["tool", "ide"],
      },
      {
        title: "Snapshot testing",
        description:
          "Use BABLR to update test files when the expected results change",
        audienceTypes: ["tool", "lang"],
      },
      {
        title: "Paneditor",
        description:
          "A browser-based semantic code editor using an agAST document as a DOM. Structural search powered by Spamex",
        audienceTypes: ["ide"],
      },
      {
        title: "Far.OS",
        description:
          "A UNIX-inspired in-browser operating system with streaming data and a virtual filesystem",
        audienceTypes: ["ide"],
      },
    ],
  },
  {
    title: "In Progress",
    status: "in-progress",
    items: [
      {
        title: "Documentation",
        description: "API docs, guides, architecture and more",
        audienceTypes: ["tool", "ide", "lang"],
      },
      {
        title: "Broader Language Support",
        description:
          "Currently incomplete grammars include Typescript, Python, and Ruby. Help us finish those and add more!",
        audienceTypes: ["tool", "ide"],
      },
      {
        title: "Virtual Filesystem",
        description:
          "<Directory> nodes let you put a whole repo into one CSTML or agAST tree!",
        audienceTypes: ["tool", "ide"],
      },
      {
        title: "Structural Hashing",
        description:
          "Enables progressive tree transfer and git-like version control",
        audienceTypes: ["ide"],
      },
      {
        title: "Snippets/Forge",
        description:
          "A remote peer with a fancy web UI! Free for open source projects",
        audienceTypes: ["ide", "lang"],
      },
    ],
  },
  {
    title: "Completed",
    status: "completed",
    items: [
      {
        title: "CSTML",
        description:
          "A modern, XML-like markup language that avoids repeating XML's mistakes",
        audienceTypes: ["tool", "ide"],
      },
      {
        title: "agAST",
        description:
          "Uses btrees to store CSTML documents in a way that is monomorphic, deeply immutable, and safe from prototype injection",
        audienceTypes: ["tool", "ide"],
      },
      {
        title: "Guarded Spans",
        description:
          "A parser author can set a guard pattern which, until cleared, will seem to end the input when matched",
        audienceTypes: ["lang"],
      },
      {
        title: "Themes",
        description: "Users can use CSS to add custom styling to code",
        audienceTypes: ["ide"],
      },
      {
        title: "CLI",
        description:
          "Runs and traces parsers. Includes helpful syntax highlighting.",
        audienceTypes: ["lang", "tool"],
      },
    ],
  },
];
