import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title="XNHNS"
        subTitle="Handshake domains anywhere"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
