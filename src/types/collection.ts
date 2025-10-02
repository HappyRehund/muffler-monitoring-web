import type { Timestamp } from "firebase/firestore";

export interface Incident {
  id: string;
  plateNumbers: string[];
  videoUrl: string;
  audioUrl: string;
  createdAt: Timestamp;
  status: "unverified" | "verified_brong" | "verified_not_brong";
}