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
        title: "Broader language support",
        description: "Define the first 100 and the first 1000 languages",
        audienceTypes: ["tool"],
      },
      {
        title: "More implementations",
        description: "Port BABLR engine to other runtimes",
        audienceTypes: ["lang"],
      },
      {
        title: "Syntax themes",
        description: "A CSS-like system for styling code",
        audienceTypes: ["ide"],
      },
      {
        title: "Structural hashing",
        description:
          "Enables progressive tree transfer and syntax-aware version control",
        audienceTypes: ["tool"],
      },
      {
        title: "Snapshot testing",
        description:
          "Use BABLR to codemod test files to include the expected test results",
        audienceTypes: ["tool", "lang"],
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
        title: "Spamex",
        description:
          "Pattern matching language for searching in CSTML structures",
        audienceTypes: ["tool", "ide"],
      },
      {
        title: "Javascript language support",
        description: "Our tools should parse our own source code",
        audienceTypes: ["tool"],
      },
      {
        title: "Ruby language support",
        description: "A BABLR grammar for your favorite friendly language",
        audienceTypes: ["tool", "lang"],
      },
      {
        title: "Paneditor",
        description:
          "A browser-based semantic code editor using a CSTML document as its state",
        audienceTypes: ["ide"],
      },
    ],
  },
  {
    title: "Completed",
    status: "completed",
    items: [
      {
        title: "BedazzLR",
        description: "Client-side syntax highlighter for the web",
        audienceTypes: ["ide", "lang"],
      },
      {
        title: "Shift operation",
        description: "Enables LR parsing of expressions like 2+2",
        audienceTypes: ["lang"],
      },
      {
        title: "Unicode support",
        description: "CSTML identifiers may now contain unicode",
        audienceTypes: ["tool", "lang"],
      },
      {
        title: "Immutable btrees",
        description: "Amortized-cost changes to wide nodes",
        audienceTypes: ["tool"],
      },
      {
        title: "Language embedding",
        description: "Languages can refer to and extend each other",
        audienceTypes: ["tool", "lang"],
      },
      {
        title: "CLI",
        description: "Test parsers from your favorite shell",
        audienceTypes: ["lang"],
      },
    ],
  },
];
