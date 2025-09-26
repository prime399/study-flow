export default function Logo({
  variant = "default",
}: {
  variant?: "default" | "small"
}) {
  return (
    <div className="">
      {variant === "default" ? (
        <h1 className="text-2xl font-medium tracking-tight">
          Study<span className="text-blue-600">Mate</span>
        </h1>
      ) : (
        <h1 className=" font-medium tracking-tight text-2xl ">
          S<span className="text-blue-600">M</span>
        </h1>
      )}
    </div>
  )
}
