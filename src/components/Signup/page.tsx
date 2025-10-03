"use client"

const Signup = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white shadow-md">
                <h2 className="text-2xl text-center">
                    Signup
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
                        Signup
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Signup;