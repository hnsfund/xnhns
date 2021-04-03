import React from "react";

/**
 * @summary Wrapper for any page level view components
 */
export default ({ children }) => (
  <div className="app-wrapper">
    {children}
  </div>
);
