import React from "react";
import PropTypes from "prop-types";

export function Button({ children, className, ...props }) {
  return (
    <button
      className={`bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ✅ Add PropTypes
Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
