import type { ExtractedField } from "../pages/Analyze";

interface DataTableProps {
  data: ExtractedField[][];
}

export function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0 || !data[0] || data[0].length === 0) {
    return <p className="text-muted-foreground">Extracted data is in an unexpected format or empty.</p>;
  }

  const headers = data[0].map((field: ExtractedField) => field.label);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border">
        <thead>
          <tr>
            {headers.map((label: string, idx: number) => (
              <th
                key={idx}
                className="border px-2 py-1 text-left bg-gray-100 dark:bg-gray-800"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item: ExtractedField[], idx: number) => (
            <tr key={idx}>
              {item.map((field: ExtractedField, fidx: number) => (
                <td key={fidx} className="border px-2 py-1">
                  {String(field.value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
