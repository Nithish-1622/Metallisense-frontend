import React from "react";
import clsx from "clsx";

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-dark-100 text-dark-700 border-dark-300",
    success: "bg-green-100 text-green-700 border-green-300",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
    error: "bg-red-100 text-red-700 border-red-300",
    info: "bg-blue-100 text-blue-700 border-blue-300",
    primary: "bg-primary-100 text-primary-700 border-primary-300",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
