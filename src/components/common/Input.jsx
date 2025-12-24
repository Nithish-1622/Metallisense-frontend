import React from "react";
import clsx from "clsx";

const Input = ({
  label,
  error,
  type = "text",
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={clsx("mb-4", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={clsx(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
          error ? "border-red-500" : "border-dark-300",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
