import React from "react";
import { GraduationCap } from "lucide-react";

export default function Brand({ light = false }) {
  return (
    <a className={`brand${light ? " brand-light" : ""}`} href="/" aria-label="CampusConnect home">
      <span className="brand-icon"><GraduationCap size={21} strokeWidth={2.2} /></span>
      <span>Campus<span className="brand-accent">Connect</span></span>
    </a>
  );
}
