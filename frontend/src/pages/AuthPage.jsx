import { useState } from "react";
import { registerUser, loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const res = await registerUser({ email, password });
    alert(res.message);
  };

  const handleLogin = async () => {
    const res = await loginUser({ email, password });

    if (res.access_token) {
      localStorage.setItem("token", res.access_token);
      navigate("/dashboard");
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-6 bg-gray-800 rounded-xl w-80">
        <h2 className="text-xl mb-4">NeuralQuest Auth</h2>

        <input
          className="w-full p-2 mb-3 text-black"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 text-black"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} className="w-full bg-blue-500 p-2 mb-2 rounded">
          Login
        </button>

        <button onClick={handleRegister} className="w-full bg-green-500 p-2 rounded">
          Register
        </button>
      </div>
    </div>
  );
}