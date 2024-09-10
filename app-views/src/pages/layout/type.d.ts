export type ILayoutPanel = {
    name: string;
    url: string;
};

export type ILayoutItem = {
    direction: 'row' | 'column';
    layouts?: ILayoutItem[];
    panels?: ILayoutPanel[];
} & (
    | {
          layouts: ILayoutItem[];
      }
    | {
          panels: ILayoutPanel[];
      }
);
