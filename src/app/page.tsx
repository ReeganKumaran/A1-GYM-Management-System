import Link from "next/link";

const features = [
  {
    icon: "🧾",
    title: "Digital Receipts",
    description:
      "Generate and download professional PDF receipts for every transaction instantly.",
  },
  {
    icon: "👥",
    title: "Member Management",
    description:
      "Track memberships, monitor attendance, and manage member profiles with ease.",
  },
  {
    icon: "💊",
    title: "Supplement Store",
    description:
      "Browse and manage a full catalog of supplements with categories and stock tracking.",
  },
  {
    icon: "🥗",
    title: "Diet Plans",
    description:
      "Access curated diet plans with calorie counts, meal breakdowns, and nutritional info.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-32 sm:py-40 lg:py-48 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
            <span className="text-orange-500">A1</span> GYM
            <br />
            <span className="text-gray-300">Management System</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 leading-relaxed">
            Manage your gym digitally &mdash; members, bills, supplements &amp;
            more
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/login"
              className="px-8 py-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base transition-colors shadow-lg shadow-orange-500/20"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-3.5 rounded-lg border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-white font-semibold text-base transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Everything You Need
        </h2>
        <p className="text-center text-gray-400 mb-14 max-w-xl mx-auto">
          A complete solution to run your gym operations smoothly and
          efficiently.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 hover:border-orange-500/40 transition-colors group"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} A1 GYM Management System. All
            rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            Built with Next.js &amp; Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
