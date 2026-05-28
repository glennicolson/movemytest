export function ContentDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="font-semibold">General guidance only</p>
          <p className="mt-1">
            This information is for general guidance. Always follow the advice of your DVSA-approved instructor 
            and check the latest official guidance at{" "}
            <a href="https://www.gov.uk/learn-to-drive-a-car" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900">GOV.UK</a>.{" "}
            MoveMyTest is not responsible for changes to DVSA requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
