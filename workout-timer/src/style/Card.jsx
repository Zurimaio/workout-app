import React from "react";
import { classes } from "./classes";

export default function Card({ title, children }) {
  return (
    <div className={classes.card}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}