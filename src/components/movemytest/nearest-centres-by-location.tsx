"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Navigation, LocateFixed, AlertCircle } from "lucide-react";

type CentreWithCoords = {
  id: string;
  slug: string;
  displayName: string;
  region: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  activeSwapCount: number;
  passRateLabel?: string;
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;// Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function NearestCentresByLocation({ centres }: { centres: CentreWithCoords[] }) {
  const [status, setStatus] = useState<"idle" | "requesting" | "success" | "error" | "denied" | "unsupported">("idle");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const nearest = useMemo(() => {
    if (userLat == null || userLon == null) return [];
    const withDistance = centres
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => ({
        ...c,
        distance: haversineDistance(userLat, userLon, Number(c.latitude), Number(c.longitude)),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
    return withDistance;
  }, [userLat, userLon, centres]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLon(position.coords.longitude);
        setStatus("success");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("error");
          setErrorMsg(error.message);
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  if (status === "idle") {
    return (
      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
          <LocateFixed className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-950">Find nearby test centres</h3>
        <p className="mt-2 text-sm text-slate-600">Allow location access to see the 3 closest test centres to where you are right now.</p>
        <button
          onClick={requestLocation}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]"
        >
          <Navigation className="h-4 w-4" />
          Use my location
        </button>
        <p className="mt-3 text-xs text-slate-500">Your location is only used on this page and is not stored or shared.</p>
      </div>
    );
  }

  if (status === "requesting") {
    return (
      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
          <LocateFixed className="h-6 w-6 animate-pulse" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-950">Getting your location…</h3>
        <p className="mt-2 text-sm text-slate-600">Please allow location access if your browser asks.</p>
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-amber-900">
        <AlertCircle className="mx-auto h-6 w-6" />
        <h3 className="mt-3 text-lg font-semibold">Location not available</h3>
        <p className="mt-2 text-sm">Your browser does not support geolocation. Use the search or browse by region instead.</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-amber-900">
        <AlertCircle className="mx-auto h-6 w-6" />
        <h3 className="mt-3 text-lg font-semibold">Location access denied</h3>
        <p className="mt-2 text-sm">You blocked location access. Use the search box or browse by region below.</p>
        <button onClick={requestLocation} className="mt-3 text-sm font-semibold underline">
          Try again
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-900">
        <AlertCircle className="mx-auto h-6 w-6" />
        <h3 className="mt-3 text-lg font-semibold">Could not get location</h3>
        <p className="mt-2 text-sm">{errorMsg || "Something went wrong. Use the search or browse by region."}</p>
        <button onClick={requestLocation} className="mt-3 text-sm font-semibold underline">
          Try again
        </button>
      </div>
    );
  }

// success
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <Navigation className="h-4 w-4" />
        Closest test centres to you
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {nearest.map((centre) => (
          <Link
            key={centre.id}
            href={`/test-centres/${centre.slug}`}
            className="group rounded-2xl border border-emerald-300 bg-white p-4 text-sm shadow-sm transition hover:border-[var(--brand)] hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <MapPin className="h-4 w-4 text-[var(--brand)]" />
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                {centre.distance.toFixed(1)} mi
              </span>
            </div>
            <p className="mt-2 font-semibold text-slate-950">{centre.displayName}</p>
            <p className="mt-1 text-xs text-slate-600">
              {centre.region} · {centre.postcode ?? "Postcode unavailable"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {centre.activeSwapCount > 0 ? `${centre.activeSwapCount} active swaps` : "No active swaps"}
              </span>
              {centre.passRateLabel ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {centre.passRateLabel}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
      {nearest.length < 3 ? (
        <p className="mt-3 text-xs text-emerald-800">
          Only {nearest.length} centre{nearest.length === 1 ? "" : "s"} with coordinates found near you.
        </p>
      ) : null}
      <button
        onClick={requestLocation}
        className="mt-3 text-xs font-semibold text-emerald-800 underline"
      >
        Refresh location
      </button>
    </div>
  );
}
