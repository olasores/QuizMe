import Nav from "@/components/Nav/nav";


const Homepage = () => (
  <>
    <Nav />
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-300">
      <section className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-10 mt-12 flex flex-col items-center border border-black">
        <h1 className="text-5xl font-extrabold text-black mb-4 text-center drop-shadow-lg">Welcome to <span className="text-gray-700">QuizMe!</span></h1>
        <p className="text-xl text-gray-700 mb-8 text-center">
          Your interactive platform for fun and effective learning.<br />
          Get started by exploring quizzes or creating your own!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-xl shadow transition-all text-lg">Explore Quizzes</button>
          <button className="bg-white border border-black hover:bg-gray-100 text-black font-semibold py-3 px-8 rounded-xl shadow transition-all text-lg">Create Quiz</button>
        </div>
      </section>
      <section className="mt-16 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-black">
          <svg className="w-12 h-12 text-black mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          <h2 className="text-xl font-bold mb-2 text-black">Track Progress</h2>
          <p className="text-gray-600 text-center">Monitor your learning journey and see your improvement over time.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-black">
          <svg className="w-12 h-12 text-black mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z" /></svg>
          <h2 className="text-xl font-bold mb-2 text-black">Secure & Private</h2>
          <p className="text-gray-600 text-center">Your data is safe and private. Only you control your learning experience.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-black">
          <svg className="w-12 h-12 text-black mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
          <h2 className="text-xl font-bold mb-2 text-black">Fun & Engaging</h2>
          <p className="text-gray-600 text-center">Enjoy interactive quizzes designed to make learning enjoyable and effective.</p>
        </div>
      </section>
    </main>
  </>
);

export default Homepage;