"use client";

const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-200">
            <div className="bg-white shadow-md">
                <h2 className="text-2xl text-center">
                    Login
                </h2>

                <form className="flex flex-col">
                    <input
                        type="email"
                        placeholder="Email"
                        className="border rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border rounded"
                    />

                    <button
                        type="button"
                        className="bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;