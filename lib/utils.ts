import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateUID(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function getRankLabel(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

// Calculate member archetype from activity data
export function calculateArchetype(data: {
  projectsShipped: number;
  workshopsAttended: number;
  connections: number;
  endorsementsGiven: number;
  workshopsLed: number;
  bugsReported: number;
}): string {
  const scores = {
    builder: data.projectsShipped * 3,
    scholar: data.workshopsAttended * 2,
    connector: data.connections * 1.5 + data.endorsementsGiven,
    speaker: data.workshopsLed * 5,
    debugger: data.bugsReported * 4,
  };
  return Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
}
