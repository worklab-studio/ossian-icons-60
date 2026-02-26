import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface LibraryFAQProps {
  libraryName: string;
  iconCount: number;
  style?: string;
}

export const LibraryFAQ: React.FC<LibraryFAQProps> = ({ libraryName, iconCount, style }) => {
  const faqs = [
    {
      question: `How many ${libraryName} icons are available?`,
      answer: `${libraryName} offers ${iconCount.toLocaleString()} ${style || ''} icons on Iconstack. Browse the complete list above, use the search bar to find specific icons, or filter by category.`,
    },
    {
      question: `Are ${libraryName} icons free to use?`,
      answer: `Yes, all ${libraryName} icons are MIT-licensed and completely free for both personal and commercial projects. No attribution is required.`,
    },
    {
      question: `What styles does ${libraryName} offer?`,
      answer: style
        ? `${libraryName} icons are available in ${style} style. You can further customize them on Iconstack by adjusting color and stroke width before copying or downloading.`
        : `${libraryName} icons can be customized on Iconstack by adjusting color and stroke width before copying or downloading.`,
    },
    {
      question: `How do I use ${libraryName} icons in my project?`,
      answer: `Simply search for the icon you need, click to copy the SVG code, and paste it into your HTML, React, Vue, or any other project. You can also download icons as SVG or PNG files.`,
    },
    {
      question: `Can I customize ${libraryName} icons?`,
      answer: `Yes! Use the customization panel on the right to change the icon color and stroke width in real-time. Your customizations are applied before copying or downloading, so you get exactly the icon you need.`,
    },
  ];

  return (
    <section className="px-6 py-8 border-t border-border/30">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Frequently Asked Questions about {libraryName} Icons
      </h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`}>
            <AccordionTrigger className="text-sm text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
