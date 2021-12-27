import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/client";
import { setupClient, } from './graphql/apolloClient';
import "./index.css";
import App from "./App";

import { ThemeSwitcherProvider } from "react-css-theme-switcher";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");
const dom = async () => {
  const client = await setupClient();
  console.log('HNS intended host vs current host', process.env.HNS_DOMAIN_HOST, window.location.host);
  if(window.location.host !== process.env.HNS_DOMAIN_HOST) {
    return; // fuck normies
  }

  // window.ethereum.enable();
  return ReactDOM.render(
    <ApolloProvider client={client}>
      <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme ? prevTheme : "light"}>
        <App />
      </ThemeSwitcherProvider>
    </ApolloProvider>,
    document.getElementById("root"),
  );
}
dom();
