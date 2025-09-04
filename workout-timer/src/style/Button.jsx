import React from "react";
import { classes } from "./classes";

export default function Button({ children, onClick }) {
  return (
    <button className={classes.button} onClick={onClick}>
      {children}
    </button>
  );
}
