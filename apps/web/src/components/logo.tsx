export default function Logo({
  variant = "default",
}: {
  variant?: "default" | "small"
}) {
  return (
    <div className="">
      {variant === "default" ? (
        <h1 className="text-2xl font-medium tracking-tight text-white">
          Study<span className="text-blue-400">Mate</span>
        </h1>
      ) : (
        <h1 className="text-2xl font-medium tracking-tight text-white">
          S<span className="text-blue-400">M</span>
        </h1>
      )}
    </div>
  )
}