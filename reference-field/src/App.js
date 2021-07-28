import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { Home } from "./Home";

function App() {

  return (
    <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/" component={Home} />
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;
