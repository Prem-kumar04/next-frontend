type TableProps = {
  headers: string[];
  children: React.ReactNode;
};

export default function Table({
  headers,
  children,
}: Readonly<TableProps>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-slate-100">
            {headers.map((header) => (
              <th
                key={header}
                className="p-3 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}