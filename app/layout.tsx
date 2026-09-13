import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Quiddler",
	description:
		"The short word game — a single-table Quiddler for a few friends.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="scheme-dark">
			<body className="min-h-screen bg-radial-[circle_at_50%_0%] from-green-900 to-green-950 text-green-50 antialiased">
				{children}
			</body>
		</html>
	);
}
