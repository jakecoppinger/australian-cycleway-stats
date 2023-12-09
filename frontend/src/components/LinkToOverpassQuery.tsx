export function LinkToOverpassQuery({
  queryStr,
  children,
}: {
  queryStr: string;
  children: React.ReactNode;
}) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://overpass-turbo.eu/?Q=${encodeURIComponent(queryStr)}&R=`}
    >
      {children}
    </a>
  );
}
