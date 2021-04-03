import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <div id='header-logo-container'>
      <a href="/">
        <h2 id="logo"> XNHNS </h2>
        <h4> Handshake domains anywhere </h4>
      </a>
    </div>
  );
}
