interface ToolbarProps {
  houseName: string;
}

export function Toolbar({ houseName }: ToolbarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 truncate">{houseName}</h1>
      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
        Mode Lihat
      </span>
    </header>
  );
}
