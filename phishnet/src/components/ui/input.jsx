import React from "react";
import PropTypes from "prop-types";

export function Input({ type = "text", placeholder, className, ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500 ${className}`}
      {...props}
    />
  );
}

// ✅ Add PropTypes
Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

