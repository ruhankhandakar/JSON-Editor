// Types
export type SchemaType = {
  [key: string]: string | SchemaType | SchemaType[];
};

export type FormState = {
  [key: string]: any;
};
