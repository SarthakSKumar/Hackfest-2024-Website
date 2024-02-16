import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { useState, useEffect } from "react";
import { getAllFaqs } from "@/src/server/actions";

export default function QnaAccordion({ cat }: { cat: string }) {
  const [faqData, setFaqData] = useState<
    {
      id: number;
      question: string;
      answer: string;
      category: "GENERAL" | "FOOD" | "STAY" | "TRAVEL";
      published: boolean;
    }[]
  >([]);
  useEffect(() => {
    getAllFaqs().then((data) => {
      setFaqData(data);
    });
  }, []);
  return (
    <>
      <div className="flex flex-col">
        {faqData.map((faq, index) => {
          if (faq.category === cat && faq.published) {
            return (
              <Accordion
                type="single"
                collapsible
                key={index}
                className="md:w-[50vw] w-[80vw]"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="w-full">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          }
        })}
      </div>
    </>
  );
}
