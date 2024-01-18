export function LinkToOverpassQuery({
  queryStr,
  children,
}: {
  queryStr: string | undefined;
  children: React.ReactNode;
}) {
  return queryStr ? <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://overpass-turbo.eu/?Q=${encodeURIComponent(queryStr)}&R=`}
    >
      {children}
    </a> : <>{children}</>;
}
