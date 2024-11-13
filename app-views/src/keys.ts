import type { InjectionKey } from "vue";

export type IAddPanelFun = (
  parentPaht: string,
  path: string,
  item: MyLayout.ILayoutPanel
) => void;

export const addPanel = Symbol("add-panel") as InjectionKey<IAddPanelFun>;
