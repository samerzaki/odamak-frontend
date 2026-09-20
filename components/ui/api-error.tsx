// API Error Component - Reusable error display with retry

export function ApiError({
  error,
  retry
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div className="rounded-[14px] bg-down-soft p-4">
      <p className="text-[13.5px] text-down">
        ⚠️ {error.message || 'فشل تحميل البيانات'}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="mt-2 text-[13px] font-medium text-down hover:underline"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
