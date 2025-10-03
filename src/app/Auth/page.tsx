"use client"

const Auth = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
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
                        className=""
                    >
                        Login
                    </button>
                </form>

                <p className="text-center">
                    Register Here{" "}
                    <span className="cursor-pointer">
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Auth;