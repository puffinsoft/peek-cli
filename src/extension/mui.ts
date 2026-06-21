import type {
  DetailedHTMLProps,
  HTMLAttributes,
  InputHTMLAttributes
} from "react";

type MaterialElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;

type MaterialButtonProps = MaterialElementProps & {
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

type MaterialCheckboxProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "md-filled-button": MaterialButtonProps;
      "md-outlined-button": MaterialButtonProps;
      "md-text-button": MaterialButtonProps;
      "md-checkbox": MaterialCheckboxProps;
    }
  }
}

export {};