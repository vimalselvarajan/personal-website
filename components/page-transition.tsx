import {
  ViewTransition,
  type ReactNode,
  type ViewTransitionClassPerType,
} from "react";

type PageTransitionProps = {
  children: ReactNode;
};

const transitionClasses = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  "nav-root": "page-fade",
  default: "none",
} satisfies ViewTransitionClassPerType;

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <ViewTransition update={transitionClasses} default="none">
      {children}
    </ViewTransition>
  );
}
