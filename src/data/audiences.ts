import { Code, Terminal, Braces } from "lucide-astro";

export type AudienceType = "tool" | "lang" | "ide";

export type Audience = {
  icon: any;
  color: string;
  borderColor: string;
  shadowColor: string;
};

export const audiences: { [T in AudienceType]: Audience } = {
  tool: {
    icon: Code,
    color: "bg-purple-100 text-purple-600",
    borderColor: "border-purple-200",
    shadowColor: "shadow-purple-100",
  },
  ide: {
    icon: Terminal,
    color: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
    shadowColor: "shadow-blue-100",
  },
  lang: {
    icon: Braces,
    color: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-200",
    shadowColor: "shadow-orange-200",
  },
};
