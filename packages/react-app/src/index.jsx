import React from "react";
import ReactDOM from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "./index.css";
import App from "./App";

console.log('subgrpah', process.env.REACT_APP_GRAPH_NODE_URI, process.env.GRAPH_NODE_URI)

let subgraphUri = "http://localhost:8000/subgraphs/name/kibagateaux/badassens"

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App subgraphUri={subgraphUri}/>
  </ApolloProvider>,
  document.getElementById("root"),
);
