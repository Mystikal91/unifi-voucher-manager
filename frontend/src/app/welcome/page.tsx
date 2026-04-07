"use client";

import { api } from "@/utils/api";
import { getRuntimeConfig } from "@/utils/runtimeConfig";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function WelcomePage() {
  const [visited, setVisited] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const ssid = useMemo(() => {
    if (!hasMounted) return null;
    const { WIFI_SSID: ssid } = getRuntimeConfig();
    return ssid;
  }, [hasMounted, getRuntimeConfig]);

  const rotateVoucher = useCallback(async () => {
    try {
      await api.createRollingVoucher();
    } catch (error: any) {
      // Error 403 is expected if the user already created a rolling voucher
      if (error?.status !== 403) {
        console.error("Failed to create rolling voucher", error);
      }
    }
  }, []);

  useEffect(() => {
    setHasMounted(true);

    if (visited) return;
    rotateVoucher();
    setVisited(true);
  }, [rotateVoucher]);

  return (
    <main className="flex-center h-screen w-full px-4">
      <div className="w-full text-center font-bold text-4xl sm:text-5xl md:text-7xl lg:text-9xl leading-snug">
        {ssid ? (
          <>
            Benvenuto/a su <span className="text-brand font-mono">{ssid}</span>!
          </>
        ) : (
          "Benvenuto!"
        )}
      </div>
    </main>
  );
}
