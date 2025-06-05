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
        description: "The first production-grade release",
        audienceTypes: ["tool", "ide", "lang"],
      },
      {
        title: "Broader language support",
        description: "Define the first 1000 languages",
        audienceTypes: ["tool"],
      },
      {
        title: "More implementations",
        description: "Port BABLR engine to other runtimes",
        audienceTypes: ["lang"],
      },
      {
        title: "isValid cache",
        description: "...for both typed and untyped trees",
        audienceTypes: ["tool"],
      },
    ],
  },
  {
    title: "In Progress",
    status: "in-progress",
    items: [
      {
        title: "Javascript language support",
        description: "Our tools should parse our own source code",
        audienceTypes: ["tool"],
      },
      {
        title: "Spamex",
        description: "Structural Pattern Matcher EXpressions",
        audienceTypes: ["tool", "ide"],
      },
      {
        title: "Syntax highlighting",
        description: "A CSS-like system for styling code",
        audienceTypes: ["ide"],
      },
      {
        title: "Documentation",
        description: "API docs, guides, architecture and more",
        audienceTypes: ["tool", "ide", "lang"],
      },
      {
        title: "Ruby language support",
        description: "A BABLR grammar for your favorite friendly language",
        audienceTypes: ["tool", "lang"],
      },
    ],
  },
  {
    title: "Completed",
    status: "completed",
    items: [
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
    ],
  },
];
