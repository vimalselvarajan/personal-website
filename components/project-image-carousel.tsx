"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { preload as preloadResource } from "react-dom";
import { assetUrl } from "@/config/site";
import type { ProjectFrontmatter } from "@/lib/content";
import {
  getProjectCardImageVariantPath,
  getProjectCardImageVariantWidths,
  getProjectGalleryImageVariantPath,
  getProjectImageSizes,
  getProjectImageVariantPath,
  getProjectImageVariantWidths,
} from "@/lib/project-image-variants";

type ProjectImageCarouselProps = Pick<
  ProjectFrontmatter,
  "slug" | "image" | "imageAlt" | "imageCaption" | "imageWidth" | "imageHeight" | "gallery"
> & {
  preload?: boolean;
};

type Slide = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  responsivePath: (width: number) => string;
};

type PointerGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  startedAt: number;
  axis: "pending" | "horizontal" | "vertical";
};

const gestureIntentThreshold = 8;
const swipeMinimumDistance = 24;
const swipeVelocityThreshold = 0.45;

export function ProjectImageCarousel({
  slug,
  image,
  imageAlt,
  imageCaption,
  imageWidth,
  imageHeight,
  gallery,
  preload = false,
}: ProjectImageCarouselProps) {
  const primarySlide: Slide = {
    src: image,
    alt: imageAlt,
    caption: imageCaption ?? "Project image",
    width: imageWidth,
    height: imageHeight,
    responsivePath: (width) => getProjectImageVariantPath(slug, width),
  };
  const slides: Slide[] = [
    primarySlide,
    ...(gallery ?? []).map((asset, index) => ({
      ...asset,
      responsivePath: (width: number) => getProjectGalleryImageVariantPath(slug, index, width),
    })),
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerGesture = useRef<PointerGesture | null>(null);
  const activeSlide = slides[activeIndex] ?? primarySlide;
  const primaryWidths = getProjectImageVariantWidths(primarySlide.width);
  const primarySizes = getProjectImageSizes(primarySlide.width, primarySlide.height);
  const primaryAvifWidths = getProjectCardImageVariantWidths(primarySlide.width);
  const primaryAvifSrcSet = primaryAvifWidths
    .map((width) => `${assetUrl(getProjectCardImageVariantPath(slug, width, "avif"))} ${width}w`)
    .join(", ");
  const primarySrcSet = primaryWidths
    .map((width) => `${assetUrl(primarySlide.responsivePath(width))} ${width}w`)
    .join(", ");
  const primaryPreloadWidth = primaryAvifWidths.find((width) => width >= 672) ?? primarySlide.width;

  const selectSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlide(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlide(activeIndex + 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(slides.length - 1);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea")) {
      return;
    }

    if (!event.isPrimary || slides.length < 2 || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    pointerGesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: event.timeStamp,
      axis: "pending",
    };

    if (event.pointerType === "mouse") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = pointerGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (
      gesture.axis === "pending"
      && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= gestureIntentThreshold
    ) {
      gesture.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
  };

  const clearPointerGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerGesture.current?.pointerId !== event.pointerId) {
      return;
    }

    pointerGesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = pointerGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gesture.startX;
    const elapsed = Math.max(event.timeStamp - gesture.startedAt, 1);
    const distanceThreshold = Math.min(
      72,
      Math.max(44, event.currentTarget.clientWidth * 0.16),
    );
    const isSwipe = gesture.axis === "horizontal"
      && (
        Math.abs(deltaX) >= distanceThreshold
        || (Math.abs(deltaX) >= swipeMinimumDistance && Math.abs(deltaX) / elapsed >= swipeVelocityThreshold)
      );

    clearPointerGesture(event);
    if (isSwipe) {
      selectSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    }
  };

  if (preload) {
    preloadResource(
      assetUrl(getProjectCardImageVariantPath(slug, primaryPreloadWidth, "avif")),
      {
        as: "image",
        fetchPriority: "high",
        imageSrcSet: primaryAvifSrcSet,
        imageSizes: primarySizes,
        type: "image/avif",
      },
    );
  }
  return (
    <section
      aria-label="Project image gallery"
      aria-roledescription="carousel"
      className="project-carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="project-carousel-stage select-none"
        style={{ touchAction: "pan-y pinch-zoom" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={clearPointerGesture}
        onLostPointerCapture={clearPointerGesture}
        onDragStart={(event) => event.preventDefault()}
      >
        <div key={activeSlide.src} className="project-carousel-slide">
          <picture>
            {activeIndex === 0 ? (
              <source
                type="image/avif"
                srcSet={primaryAvifSrcSet}
                sizes={primarySizes}
              />
            ) : null}
            <source
              type="image/webp"
              srcSet={activeIndex === 0
                ? primarySrcSet
                : getProjectImageVariantWidths(activeSlide.width)
                  .map((width) => `${assetUrl(activeSlide.responsivePath(width))} ${width}w`)
                  .join(", ")}
              sizes={getProjectImageSizes(activeSlide.width, activeSlide.height)}
            />
            <Image
              src={assetUrl(activeSlide.src)}
              width={activeSlide.width}
              height={activeSlide.height}
              alt={activeSlide.alt}
              sizes={getProjectImageSizes(activeSlide.width, activeSlide.height)}
              loading={preload && activeIndex === 0 ? "eager" : "lazy"}
              fetchPriority={preload && activeIndex === 0 ? "high" : "auto"}
              decoding="async"
              draggable={false}
              className="project-carousel-image"
            />
          </picture>
        </div>

        <div className="project-carousel-navigation">
          <button
            type="button"
            className="project-carousel-control h-11 min-w-11"
            aria-label="Previous image"
            onClick={() => selectSlide(activeIndex - 1)}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            className="project-carousel-control h-11 min-w-11"
            aria-label="Next image"
            onClick={() => selectSlide(activeIndex + 1)}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <div className="project-carousel-dock">
        <p className="project-carousel-caption" aria-live="polite" aria-atomic="true">
          <span>{activeSlide.caption}</span>
          <span aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
        </p>
        <div className="project-carousel-pagination" aria-label="Choose an image">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={slide.src}
                type="button"
                className="grid min-h-11 min-w-11 place-items-center rounded-full"
                aria-label={`Show image ${index + 1}: ${slide.caption}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              >
                <span
                  aria-hidden="true"
                  aria-current={isActive ? "true" : undefined}
                  className="project-carousel-dot block"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
