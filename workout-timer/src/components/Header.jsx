import React from "react";

export default function Header({ title, subtitle, actions }) {
  return (
    <header className="bg-brand-dark text-offwhite shadow p-6 flex justify-between items-center rounded-2xl mb-3">
      <div>
        <h1 className="text-2xl font-bold ">{title}</h1>
        {subtitle && <p className="">{subtitle}</p>}
      </div>
      <div className="flex gap-2">{actions}</div>
    </header>
  );
} 