import React from "react";
import clsx from "clsx";

const Select = ({
  label,
  error,
  options = [],
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
      <select
        className={clsx(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white",
          error ? "border-red-500" : "border-dark-300",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
