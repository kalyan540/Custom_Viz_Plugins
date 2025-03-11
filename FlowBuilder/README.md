# FlowBuilder

This is the FlowBuilder is a powerful and intuitive plugin designed to simplify workflow creation. Whether you&#39;re automating tasks, managing processes, or designing complex workflows, FlowBuilder provides the tools you need to visually design, customize, and deploy workflows with ease. Perfect for developers, teams, and businesses looking to streamline their operations and boost productivity. Superset Chart Plugin.

### Usage

To build the plugin, run the following commands:

```
npm ci
npm run build
```

Alternatively, to run the plugin in development mode (=rebuilding whenever changes are made), start the dev server with the following command:

```
npm run dev
```

To add the package to Superset, go to the `superset-frontend` subdirectory in your Superset source folder (assuming both the `FlowBuilder` plugin and `superset` repos are in the same root directory) and run
```
npm i -S ../../FlowBuilder
```

If your Superset plugin exists in the `superset-frontend` directory and you wish to resolve TypeScript errors about `@superset-ui/core` not being resolved correctly, add the following to your `tsconfig.json` file:

```
"references": [
  {
    "path": "../../packages/superset-ui-chart-controls"
  },
  {
    "path": "../../packages/superset-ui-core"
  }
]
```

You may also wish to add the following to the `include` array in `tsconfig.json` to make Superset types available to your plugin:

```
"../../types/**/*"
```

Finally, if you wish to ensure your plugin `tsconfig.json` is aligned with the root Superset project, you may add the following to your `tsconfig.json` file:

```
"extends": "../../tsconfig.json",
```

After this edit the `superset-frontend/src/visualizations/presets/MainPreset.js` and make the following changes:

```js
import { FlowBuilder } from 'FlowBuilder';
```

to import the plugin and later add the following to the array that's passed to the `plugins` property:
```js
new FlowBuilder().configure({ key: 'FlowBuilder' }),
```

After that the plugin should show up when you run Superset, e.g. the development server:

```
npm run dev-server
```
