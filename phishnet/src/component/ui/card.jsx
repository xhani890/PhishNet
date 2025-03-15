import React from "react";
import PropTypes from "prop-types";

export function Card({ children, className }) {
  return <div className={`bg-grey shadow-md rounded-lg p-6 ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="border-b pb-4 mb-4">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}

export function CardTitle({ children }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

// ✅ Add PropTypes
Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

