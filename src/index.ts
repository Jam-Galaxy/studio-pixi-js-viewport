
import "./styles.css";
import { app } from "./Application/app";

// Типобезопасная проверка HMR (для Webpack)
declare const module: any; // eslint-disable-line
if (module?.hot) {
  module.hot.accept();
}

app();