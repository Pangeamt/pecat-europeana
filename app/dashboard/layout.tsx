export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      <div className="">{children}</div>
    </section>
  );
}
