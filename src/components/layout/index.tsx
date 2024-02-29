import { Toaster } from "sonner";
import Navbar from "../navbar";
import Footer from "../footer";
import ProgressBarProvider from "../progressBarProvider";
import { useRouter } from "next/router";

export default function RootLayout(props: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div
      className={`dark text-white ${router.pathname === "/" ? "" : "bg-black"}`}
    >
      <ProgressBarProvider>
        <Toaster richColors expand={true} position="bottom-center" />
        <Navbar />
        {props.children}
        <Footer />
      </ProgressBarProvider>
    </div>
  );
}
