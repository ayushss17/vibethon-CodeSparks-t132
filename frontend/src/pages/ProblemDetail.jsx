import { useState } from "react";

export default function ProblemDetail() {
    const [code, setCode] = useState("# Write your code here");
    const [output, setOutput] = useState("");

    const runCode = async () => {
        try {
            const res = await fetch("http://localhost:5000/run", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();
            setOutput(data.output || data.error);
        } catch (err) {
            setOutput("Error running code");
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f1a] text-white p-6">

            {/* 🔷 HEADER */}
            <h1 className="text-3xl font-bold text-blue-400 mb-4">
                Implement Sigmoid Function
            </h1>

            {/* 🔷 MAIN GRID */}
            <div className="grid grid-cols-2 gap-6">

                {/* 🧠 LEFT SIDE */}
                <div className="space-y-6">

                    {/* 📘 Problem Statement */}
                    <div className="bg-[#121826] p-5 rounded-2xl shadow-lg border border-blue-900">
                        <h2 className="text-xl text-blue-300 mb-2">Problem</h2>
                        <p className="text-gray-300">
                            Implement the sigmoid function using NumPy.
                            Sigmoid(x) = 1 / (1 + e^-x)
                        </p>
                    </div>

                    {/* 📚 Learn Section */}
                    <div className="bg-[#121826] p-5 rounded-2xl border border-blue-900">
                        <h2 className="text-xl text-blue-300 mb-2">💡 Learn First</h2>
                        <p className="text-gray-300">
                            The sigmoid function maps any value into a range between 0 and 1.
                            It is widely used in logistic regression and neural networks.
                        </p>
                    </div>

                    {/* 🎯 Test Cases */}
                    <div className="bg-[#121826] p-5 rounded-2xl border border-blue-900">
                        <h2 className="text-xl text-blue-300 mb-2">Test Case</h2>
                        <p className="text-gray-300">Input: x = 0</p>
                        <p className="text-gray-300">Output: 0.5</p>
                    </div>

                </div>

                {/* 💻 RIGHT SIDE */}
                <div className="space-y-4">

                    {/* 🧾 Code Editor */}
                    <div className="bg-[#121826] p-4 rounded-2xl border border-blue-900">
                        <h2 className="text-blue-300 mb-2">Code Editor</h2>

                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-64 bg-black text-green-400 p-3 rounded-lg outline-none font-mono"
                        />
                    </div>

                    {/* ▶ Run Button */}
                    <button
                        onClick={runCode}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold transition"
                    >
                        ▶ Run Code
                    </button>

                    {/* 📤 Output */}
                    <div className="bg-black p-4 rounded-xl border border-blue-900">
                        <h2 className="text-blue-300 mb-2">Output</h2>
                        <pre className="text-green-400">{output}</pre>
                    </div>

                </div>

            </div>
        </div>
    );
}