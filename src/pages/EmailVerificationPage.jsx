import React from "react";

export default function EmailVerificationPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-6 sm:py-12 bg-white">
      <div className="max-w-xl px-5 text-center">
        <h2 className="mb-2 text-[32px] sm:text-[42px] font-bold text-zinc-800">
          Check your inbox
        </h2>
        <p className="mb-2 px- sm:text-lg text-zinc-500">
          We are glad that you're with us! We've sent you a verification link to
          your email address.
        </p>
        <a
          href="/"
          className="mt-3 inline-block w-80 rounded bg-custom-red px-5 py-3 font-medium text-white shadow-md shadow-indigo-500/20"
        >
          Continue to Beytty →
        </a>
      </div>
    </div>
  );
}
