"use client";

const Hero = () => {
	return (
			<section id="home" className="relative w-full min-h-[calc(100dvh-0px)] flex items-center justify-center px-4 py-20 scroll-mt-24">
				<div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10 flex flex-col items-center border border-black">
					<h1 className="text-5xl font-extrabold text-black mb-4 text-center drop-shadow-lg">
						Welcome to <span className="text-gray-700">QuizMe!</span>
					</h1>
					<p className="text-xl text-gray-700 mb-8 text-center">
						Your interactive platform for fun and effective learning.<br />
						Get started by exploring quizzes or creating your own!
					</p>
					<div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
						<button className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-xl shadow transition-all text-lg">Explore Quizzes</button>
						<button className="bg-white border border-black hover:bg-gray-100 text-black font-semibold py-3 px-8 rounded-xl shadow transition-all text-lg">Create Quiz</button>
					</div>
				</div>
				<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-gray-100 to-gray-300" />
			</section>
	);
};

export default Hero;
