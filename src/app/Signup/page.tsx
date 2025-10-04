"use client";

const Signup = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-200">
            <div className="bg-white shadow-md rounded-lg p-8 w-80">
                <h2 className="text-2xl text-center mb-6">
                    Sign Up
                </h2>

                <form className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <button
                        type="button"
                        className="bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;