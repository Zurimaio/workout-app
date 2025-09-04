import { useState } from "react";

export default function LoginRegister({ onLogin, onRegister }) {
  const [open, setOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      onRegister({ name, surname, email, password });
    } else {
      onLogin({ email, password });
    }
    // reset
    setName("");
    setSurname("");
    setEmail("");
    setPassword("");
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Bottone apri form */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {isRegister ? "Registrati" : "Login"}
      </button>

      {/* Form popup */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg p-6 z-20">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {isRegister ? "Crea un account" : "Login"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border px-3 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Cognome"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="border px-3 py-2 rounded"
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />

            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
            >
              {isRegister ? "Registrati" : "Login"}
            </button>
          </form>

          {/* Toggle link */}
          <p className="text-sm mt-3 text-center">
            {isRegister ? "Hai già un account?" : "Non hai un account?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-500 underline"
            >
              {isRegister ? "Login" : "Registrati"}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
