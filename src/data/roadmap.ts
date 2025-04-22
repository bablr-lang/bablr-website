interface RoadmapItem {
  title: string;
  description: string;
  tags: Array<"tool" | "lang" | "ide">;
}

interface RoadmapCategory {
  title: string;
  items: RoadmapItem[];
  status: "completed" | "in-progress" | "planned";
}

export const roadmapData: RoadmapCategory[] = [
  {
    title: "Completed",
    status: "completed",
    items: [
      {
        title: "Shift operation",
        description: "Enables LR parsing of expressions like 2+2",
        tags: ["lang"],
      },
      {
        title: "Unicode support",
        description: "CSTML identifiers may now contain unicode",
        tags: ["lang", "tool"],
      },
      {
        title: "Immutable btrees",
        description: "Amortized-cost changes to wide nodes",
        tags: ["tool"],
      },
      {
        title: "Language embedding",
        description: "Languages can refer to and extend each other",
        tags: ["lang"],
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
        tags: ["tool"],
      },
      {
        title: "Spamex",
        description: "Structural Pattern Matcher EXpressions",
        tags: ["tool"],
      },
      {
        title: "Syntax highlighting",
        description: "A CSS-like system for styling code",
        tags: ["ide"],
      },
      {
        title: "Documentation",
        description: "API docs, guides, architecture and more",
        tags: ["ide", "tool", "lang"],
      },
    ],
  },
  {
    title: "Planned",
    status: "planned",
    items: [
      {
        title: "isValid cache",
        description: "...for both typed and untyped trees",
        tags: ["tool"],
      },
      {
        title: "Broader language support",
        description: "Define the first 1000 languages",
        tags: ["lang"],
      },
      {
        title: "More implementations",
        description: "Port BABLR engine to other runtimes",
        tags: ["ide"],
      },
      {
        title: "1.0.0",
        description: "The first production-grade release",
        tags: ["ide"],
      },
    ],
  },
];
