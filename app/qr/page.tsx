import type { Metadata } from "next";
import { QrPortada } from "./qr-portada";

export const metadata: Metadata = { title: "QR de Coillector" };

export default function QrPage() {
  return <QrPortada />;
}
