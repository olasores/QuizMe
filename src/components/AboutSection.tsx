import React from "react";

export default function AboutSection() {
  return (
    <section id="about" className="mt-16 w-full max-w-4xl scroll-mt-24">
      <div className="bg-white rounded-2xl shadow-md p-8 border border-black">
        <h2 className="text-3xl font-bold text-black">About QuizMe</h2>

        <p className="mt-4 text-lg leading-7 text-gray-600">
          QuizMe lets you create or AI-generate quizzes, save &amp; retrieve them,
          share publicly or with friends, and review results in your dashboard.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Feature
            title="Create or Generate"
            desc="Write questions yourself or let AI generate a set for your topic."
          />
          <Feature
            title="Save & Retrieve"
            desc="Keep all your quizzes and results in one place."
          />
          <Feature
            title="Share Controls"
            desc="Private by default; make public or share with specific people."
          />
          <Feature
            title="Results & Scores"
            desc="Show results and scores after each quiz; track progress over time."
          />
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold text-black">Tech we use</h3>
          <ul className="mt-3 list-disc list-inside text-gray-600">
            <li>Front end: Next.js, React, Tailwind CSS</li>
            <li>Back end: Node.js, SQL</li>
            <li>Auth: Email/Password, Google, GitHub</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-black">
      <h4 className="text-xl font-bold text-black">{title}</h4>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  );
}
