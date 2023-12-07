import { social } from "../constants/page";

const Footer = () => {
  return (
    <>
      <footer className=" relative border-t border-gray-700 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-10">
            <img
              src="/assets/flcLogo.png"
              alt="flcLogo"
              className="lg:h-24 md:h-20 lg:w-64 md:w-56 sm:w-42 sm:h-16 w-32 h-12"
            />
            <img
              src="/assets/NMAMITLogo.png"
              alt="flcLogo"
              className="lg:h-16 md:h-12 lg:w-96 md:w-72 sm:h-8 sm:w-48 h-6 w-32"
            />
          </div>

          <div>
            <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-black dark:text-gray-200">
              NMAM Institute of Technology, Nitte, SH1, Karkala, Karnataka,
              KARKALA, NMAMIT 574110, IN
            </p>
          </div>

          <ul className="mt-12 flex justify-center gap-6 md:gap-8">
            {social.map((link, index) => (
              <li key={index}>
                <a
                  href={link.link}
                  className="text-black transition hover:text-gray-200/75 dark:text-gray-100"
                  target="_blank"
                >
                  <span className="sr-only">{link.name}</span>
                  {link.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
};

export default Footer;
