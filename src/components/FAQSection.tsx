import React from "react";

type FAQ = { q: string; a: string };

const faqs: FAQ[] = [
  { q: "Do I need an account?", a: "It is better to create an account to save your progress." },
  { q: "Can AI generate quizzes?", a: "Yes! Choose a topic and number of questions; we will generate a custom set for you." },
  { q: "Is it public or private?", a: "It is private by default. You can make a quiz public or share with specific people." },
  { q: "Are results saved?", a: "Yes, you can always view them later in your dashboard." },
  { q: "How do I sign up?", a: "Email/password or continue with Google/Github from the landing page." },
  { q: "Is it free?", a: "It is free during development. We'll announce any premium features before official release." },
];

export default function FAQSection() {
  return (
    <section id="faq" className="mt-16 w-full max-w-4xl scroll-mt-24">
      <div className="bg-white rounded-2xl shadow-md p-8 border border-black">
        <h2 className="text-3xl font-bold text-black">Frequently Asked Questions</h2>

        <div className="mt-6 divide-y divide-black/10">
          {faqs.map((item, i) => (
            <details key={i} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left">
                <span className="text-xl font-medium text-black">{item.q}</span>
                <span className="ml-4 text-gray-600 transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
