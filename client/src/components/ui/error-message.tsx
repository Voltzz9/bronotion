import { TriangleIcon } from "lucide-react";

export default function ErrorMessage({
  message,
}: Readonly<{
  message: string;
}>) {
  return (
    <div className="flex items-center space-x-2 bg-red-100 text-red-800 p-4 rounded-lg">
      <TriangleIcon size={24} />
      <p>{message}</p>
    </div>
  );
}