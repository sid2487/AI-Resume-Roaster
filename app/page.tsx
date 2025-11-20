"use client";

import { signOut, useSession } from "next-auth/react";

export default function HomePage(){
  const { data: session } = useSession();

  return (
    <div className="p-6">
      <div>Welcome {session?.user?.email}</div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}