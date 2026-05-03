import { createBrowserRouter } from "react-router";
import { BioAppRoot } from "./components/BioAppRoot";
import { HomeScreen } from "./screens/HomeScreen";
import { NeuralMatrix } from "./screens/NeuralMatrix";
import { TaskHub } from "./screens/TaskHub";
import { FlowState } from "./screens/FlowState";
import { StatsTransition } from "./screens/StatsTransition";
import { MyTasksScreen } from "./screens/MyTasksScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: BioAppRoot,
    children: [
      { index: true, Component: HomeScreen },
      { path: "dashboard", Component: NeuralMatrix },
      { path: "task", Component: TaskHub },
      { path: "mylist", Component: MyTasksScreen },
      { path: "flow", Component: FlowState },
      { path: "stats", Component: StatsTransition },
    ],
  },
]);