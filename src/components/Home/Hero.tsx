"use client";



const Hero = () => {
    return (
        <section id="home" className="relative w-full min-h-[calc(100dvh-0px)] flex items-center justify-center px-4 py-20 scroll-mt-24">
            
            <div className="w-full max-w-4xl flex flex-col items-center text-center">
                
              
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-black mb-4 leading-tight">
                    Generate AI Quizzes Instantly <br />
                    to Master Any Topic
                </h1>
                
                <p className="text-lg sm:text-2xl text-gray-600 mb-10 max-w-xl font-medium">
                    AI-powered quizzes built for students, designed for self-learners.
                </p>

                <div className="flex justify-center">
                    <a href="/signup" className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-12 rounded-xl shadow-lg transition-all text-xl tracking-wider transform hover:scale-[1.02] border border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                        Get Started
                    </a>
                </div>

            </div>
            
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white to-gray-100" />
        </section>
    );
};

export default Hero;
