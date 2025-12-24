import React from "react";
import clsx from "clsx";

const Card = ({
  title,
  children,
  actions,
  className = "",
  headerClassName = "",
}) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-lg shadow-md border border-dark-200",
        className
      )}
    >
      {title && (
        <div
          className={clsx(
            "px-6 py-4 border-b border-dark-200 flex justify-between items-center",
            headerClassName
          )}
        >
          <h3 className="text-lg font-semibold text-dark-900">{title}</h3>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
