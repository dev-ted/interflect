import { createColorScheme, createLocalStorage, createPreference } from "@ui-sdk/core";

export const colorScheme = createColorScheme({
  global: true,
  storage: createLocalStorage("vukora-color-scheme"),
});

/** Desktop sidebar width. Applied to <html data-sidebar> before first paint, so there's no flash. */
export const sidebarState = createPreference({
  values: ["expanded", "collapsed"],
  defaultValue: "expanded",
  attribute: "data-sidebar",
  global: true,
  storage: createLocalStorage("interflect-sidebar"),
});
