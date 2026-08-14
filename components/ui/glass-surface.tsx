import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GlassSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "regular" | "media";
  material?: "thin" | "regular" | "thick";
  elevated?: boolean;
};

const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  function GlassSurface({
    variant = "regular",
    material = "regular",
    elevated = false,
    className,
    ...props
  }, ref) {
    return (
      <div
        ref={ref}
        data-glass-variant={variant}
        data-material={material}
        data-elevated={elevated || undefined}
        className={cn("glass-surface", className)}
        {...props}
      />
    );
  },
);

GlassSurface.displayName = "GlassSurface";

export { GlassSurface };
