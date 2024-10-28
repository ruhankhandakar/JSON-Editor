export type SchemaType = {
  [key: string]: string | SchemaType | SchemaType[];
};

export type FormState = {
  [key: string]: any;
};

export type ValidationError = {
  [key: string]: string | ValidationError | ValidationError[];
};
