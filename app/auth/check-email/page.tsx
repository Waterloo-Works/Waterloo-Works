export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] px-6">
      <div className="max-w-md w-full rounded-2xl bg-white shadow-sm border border-black/10 p-8 text-center">
        <h1 className="text-3xl font-serif italic text-black mb-3">Check your email</h1>
        <p className="text-gray-700">We sent you a magic link to sign in. Open your UWaterloo inbox and click the link to continue.</p>
        <div className="mt-6 text-sm text-gray-500">Didn’t get it? It can take a minute. Also check spam.</div>
      </div>
    </div>
  );
}

