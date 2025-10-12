
"use client"

import * as React from "react"
import Cropper, { type CropperProps as ReactCropperProps, type Point, type Area } from "react-easy-crop"

import { cn } from "@/lib/utils"

// ----------------------------------------------------------------------

type CropperContextValue = {
  zoom?: number
  setZoom?: React.Dispatch<React.SetStateAction<number>>
  minZoom: number
  maxZoom: number
  zoomStep: number
  rotation?: number
  setRotation?: React.Dispatch<React.SetStateAction<number>>
  minRotation: number
  maxRotation: number
  rotationStep: number
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void
}

const CropperContext = React.createContext<CropperContextValue | null>(null)

// ----------------------------------------------------------------------

type CropperProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  image: string
  zoom?: number
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  rotation?: number
  minRotation?: number
  maxRotation?: number
  rotationStep?: number
  aspect?: number
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void
  onZoomChange?: (zoom: number) => void
  onRotationChange?: (rotation: number) => void
  cropperProps?: Omit<
    ReactCropperProps,
    | "image"
    | "crop"
    | "zoom"
    | "rotation"
    | "aspect"
    | "onCropChange"
    | "onZoomChange"
    | "onRotationChange"
    | "onCropComplete"
  >
}

const CropperRoot = React.forwardRef<HTMLDivElement, CropperProps>(
  (
    {
      children,
      className,
      image,
      zoom: zoomProp = 1,
      minZoom = 1,
      maxZoom = 3,
      zoomStep = 0.1,
      rotation: rotationProp = 0,
      minRotation = 0,
      maxRotation = 360,
      rotationStep = 1,
      aspect,
      onCropComplete,
      onZoomChange: onZoomChangeProp,
      onRotationChange: onRotationChangeProp,
      cropperProps,
      ...props
    },
    ref
  ) => {
    const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = React.useState(zoomProp)
    const [rotation, setRotation] = React.useState(rotationProp)

    const onZoomChange = (newZoom: number) => {
      setZoom(newZoom)
      onZoomChangeProp?.(newZoom)
    }

    const onRotationChange = (newRotation: number) => {
      setRotation(newRotation)
      onRotationChangeProp?.(newRotation)
    }

    const value = React.useMemo(
      () => ({
        zoom: zoomProp,
        setZoom: onZoomChange,
        minZoom,
        maxZoom,
        zoomStep,
        rotation,
        setRotation: onRotationChange,
        minRotation,
        maxRotation,
        rotationStep,
        onCropComplete,
      }),
      [
        zoomProp,
        minZoom,
        maxZoom,
        zoomStep,
        rotation,
        minRotation,
        maxRotation,
        rotationStep,
        onCropComplete,
      ]
    )

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <CropperContext.Provider value={value}>
          <Cropper
            {...cropperProps}
            image={image}
            crop={crop}
            zoom={zoomProp}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropComplete}
          />
          {children}
        </CropperContext.Provider>
      </div>
    )
  }
)

CropperRoot.displayName = "Cropper"

// ----------------------------------------------------------------------

const CropperImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("absolute inset-0 -z-10", className)}
        {...props}
      />
    )
  }
)

CropperImage.displayName = "CropperImage"

// ----------------------------------------------------------------------

const CropperDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur",
        className
      )}
      {...props}
    >
      Use the slider to zoom in and out
    </p>
  )
})

CropperDescription.displayName = "CropperDescription"

// ----------------------------------------------------------------------

const CropperCropArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-1/2 top-1/2 h-full max-h-[500px] w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2",
          "[box-shadow:0_0_0_9999px_rgba(0,0,0,0.5)]",
          className
        )}
        {...props}
      />
    )
  }
)

CropperCropArea.displayName = "CropperCropArea"


export {
  CropperRoot as Cropper,
  CropperImage,
  CropperDescription,
  CropperCropArea,
}
