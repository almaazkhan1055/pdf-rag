import Link from "next/link";
import React from "react";

const Sidebar = () => {
  const routes = [
    {
      link: "/upload",
      title: "Upload",
    },
    {
      link: "/ask",
      title: "Ask",
    },
  ];
  return (
    <aside className="w-62.5 shrink-0 border-r border-gray-800 bg-slate-950">
      {routes.map((route) => (
        <Link
          href={route.link}
          key={route.link}
          className="block border-b border-gray-900 p-4 hover:bg-slate-900"
        >
          {route.title}
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;
