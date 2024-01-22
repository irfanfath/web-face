"use client";

import Camera from "./component/Camera";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div>
        <Camera />
      </div>
    </main>
  )
}
