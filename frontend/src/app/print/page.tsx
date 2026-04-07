"use client";

import "./styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Voucher } from "@/types/voucher";
import {
  formatBytes,
  formatDuration,
  formatMaxGuests,
  formatSpeed,
} from "@/utils/format";
import { useGlobal } from "@/contexts/GlobalContext";
import { formatCode } from "@/utils/format";
import Spinner from "@/components/utils/Spinner";

export type PrintMode = "list" | "grid";

// This component represents a single voucher card to be printed
function VoucherPrintCard({ voucher }: { voucher: Voucher }) {
  const { wifiConfig, wifiString } = useGlobal();

  const fields = [
    {
      label: "Durata",
      value: formatDuration(voucher.timeLimitMinutes),
    },
    {
      label: "Massimi Ospiti",
      value: formatMaxGuests(voucher.authorizedGuestLimit),
    },
    {
      label: "Limite Dati",
      value: voucher.dataUsageLimitMBytes
        ? formatBytes(voucher.dataUsageLimitMBytes * 1024 * 1024)
        : "Illimitato",
    },
    {
      label: "Velocità Download",
      value: formatSpeed(voucher.rxRateLimitKbps),
    },
    {
      label: "Velocità Upload",
      value: formatSpeed(voucher.txRateLimitKbps),
    },
  ];

  return (
    <div className="print-voucher">
      <div className="print-header">
        <div className="print-title">Voucher Accesso WiFi</div>
      </div>

      <div className="print-voucher-code">{formatCode(voucher.code)}</div>

      {fields.map((field) => (
        <div key={`${voucher.id}:${field.label}`} className="print-info-row">
          <span className="print-label">{field.label}:</span>
          <span className="print-value">{field.value}</span>
        </div>
      ))}

      {wifiConfig && (
        <div className="print-qr-section">
          {wifiString && (
            <>
              <div className="font-bold mb-2">Scansiona per Connetterti</div>
              <QRCodeSVG
                value={wifiString}
                size={140}
                level="H"
                marginSize={4}
                title="Accesso WiFi - QR Code"
              />
            </>
          )}
          <div className="print-qr-text">
            <strong>Rete:</strong> {wifiConfig.ssid}
            <br />
            {wifiConfig.type === "nopass" ? (
              "Nessuna Password"
            ) : (
              <>
                <strong>Password:</strong> {wifiConfig.password}
              </>
            )}
            {wifiConfig.hidden && <div>(Rete Nascosta)</div>}
          </div>
        </div>
      )}

      <div className="print-footer">
        <div>
          <strong className="text-sm">ID:</strong> {voucher.id}
        </div>
        <div>
          <strong className="text-sm">Stampato:</strong>{" "}
          {new Date().toLocaleString("it-IT")}
        </div>
      </div>
    </div>
  );
}

// This component handles displaying and printing the vouchers based on URL params
function Vouchers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [mode, setMode] = useState<PrintMode>("list");
  const lastSearchParams = useRef<string | null>(null);

  useEffect(() => {
    const paramString = searchParams.toString();
    if (lastSearchParams.current === paramString) {
      return;
    }
    lastSearchParams.current = paramString;

    const vouchersParam = searchParams.get("vouchers");
    const modeParam = searchParams.get("mode");

    if (!vouchersParam || !modeParam) {
      return;
    }

    try {
      const parsedVouchers = JSON.parse(decodeURIComponent(vouchersParam));
      setVouchers(parsedVouchers);
      setMode(modeParam as PrintMode);

      setTimeout(() => {
        window.print();
        router.replace("/");
      }, 100);
    } catch (error) {
      console.error("Failed to parse vouchers:", error);
    }
  }, [searchParams, router]);

  return !vouchers.length ? (
    <div style={{ textAlign: "center" }}>
      Nessun Voucher da stampare, premi Esc
    </div>
  ) : (
    <div className={mode === "grid" ? "print-grid" : "print-list"}>
      {vouchers.map((v) => (
        <VoucherPrintCard key={v.id} voucher={v} />
      ))}
    </div>
  );
}

// This sets up the print page itself
export default function PrintPage() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace") router.replace("/");
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return (
    <main className="print-wrapper">
      <Suspense fallback={<Spinner />}>
        <Vouchers />
      </Suspense>
    </main>
  );
}
