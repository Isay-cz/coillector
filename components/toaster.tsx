"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      offset={16}
      toastOptions={{
        className: "!rounded-xl !font-sans !text-[15px]",
        duration: 4000,
      }}
    />
  );
}
