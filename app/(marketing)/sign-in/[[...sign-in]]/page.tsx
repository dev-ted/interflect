import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/Logo";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-bg px-4 py-16">
      <LogoMark className="h-10 w-10" />
      <Suspense>
        <SignIn />
      </Suspense>
    </main>
  );
}
