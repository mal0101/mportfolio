export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
        <p className="font-mono text-xs tracking-widest text-gray-500">LOADING</p>
      </div>
    </div>
  )
}
