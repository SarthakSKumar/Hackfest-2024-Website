import {
  AiOutlineInstagram,
  AiOutlineMail,
  AiOutlinePhone,
} from "react-icons/ai";

export const cardContent: Array<{
  img: string;
  header: string;
  content: string;
}> = [
  {
    img: "/assets/about1.png",
    header: "36 HOURS LONG HACKATHON",
    content:
      "A theme based Hackathon consisting of 5 tracks resulting in 3 Grand winners",
  },
  {
    img: "/assets/about2.png",
    header: "TECH CONFERENCES",
    content:
      "Conference Talks from Top Quality Tech Speakers & Representative from Sponsors",
  },
  {
    img: "/assets/about3.png",
    header: "ENGAEMENT & NETWORKING",
    content: `A lot more than just a ${"'"}Hackathon${"'"}, more of a tech fest with Engagement Activities`,
  },
];

export const social: Array<{
  link: string;
  icon: JSX.Element;
  name: string;
}> = [
  {
    link: "https://www.instagram.com/hackfest.dev",
    icon: <AiOutlineInstagram className="h-7 w-7 hover:text-yellow-500" />,
    name: "Instagram",
  },
  {
    link: "mailto:admin@hackfest.dev",
    icon: <AiOutlineMail className="h-7 w-7 hover:text-yellow-500" />,
    name: "E-mail",
  },
  // {
  //   link: "tel:8197903771",
  //   icon: <AiOutlinePhone className="h-7 w-7 hover:text-yellow-500" />,
  //   name: "Call Us",
  // },
];

export const domains: Array<{
  name?: string;
  img?: string;
}> = [{}, {}, {}, {}, {}];
