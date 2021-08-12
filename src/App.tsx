import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Authentication } from "./components/authentication";
import { AppContextProvider } from "./components/app-context";
import { Menu } from "./components/menu";
import { Configuration } from "./components/configuration";
import { Artist } from "./components/artist";
import { FpArtist } from "./components/fp_artist";
import { Workshop } from "./components/workshop";
import { Night } from "./components/nights";
import { NightAdder } from "./components/nights/night-adder";
import { Shop } from "./components/shop";
import { ShopAdder } from "./components/shop/shop-adder";
import { AboutUs } from "./components/about_us";

import "./styles.css";

const routes = [
  { path: ["/", "/configuration"], component: Configuration },
  { path: "/about_us", component: AboutUs },
  { path: "/artists", component: Artist },
  { path: "/fp_artists", component: FpArtist },
  { path: "/workshops", component: Workshop },
  { path: "/nights", component: Night },
  { path: "/nights_adder", component: NightAdder },
  { path: "/shop", component: Shop },
  { path: "/shop_adder", component: ShopAdder }
];

export default function App() {
  return (
    <AppContextProvider>
      <Router>
        <Authentication />
        <div className="container App">
          <div><Menu/></div>
          <div className="col">
            <Switch>
            {routes.map((elm, i) =>
              <Route key={i} exact path={elm.path}>
                <elm.component/>
              </Route>
            )}
            </Switch>
          </div>
        </div>
      </Router>
    </AppContextProvider>
  );
}
