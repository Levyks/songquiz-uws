import { ValidationError } from "class-validator";

export type ArgValidationError = {
  position: number;
  name: string;
  errors: ValidationError[];
};
