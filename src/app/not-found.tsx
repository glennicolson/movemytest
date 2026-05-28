import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-slate-600 mb-6">Could not find the requested resource.</p>
      <Link
        href="/"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Return Home
      </Link>
    </div>
  );
}
