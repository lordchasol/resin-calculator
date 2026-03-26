"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // PRICE CALCULATOR
  const [weight, setWeight] = useState(0);
  const [integration, setIntegration] = useState(false);
  const [time, setTime] = useState(0);
  const [custom, setCustom] = useState(false);

  const resinPrice = (weight / 1000) * 80;
  const timePrice = (time / 60) * 30;

  const total =
    resinPrice +
    timePrice +
    (integration ? 1 : 0) +
    (custom ? 1 : 0);

  // MIX CALCULATOR
  const [quantity, setQuantity] = useState(0);
  const partA = (quantity * 2) / 3;
  const partB = (quantity * 1) / 3;

  // HISTORY
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (entry: any) => {
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const deleteItem = (index: number) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("history");
  };

  return (
    <main className="min-h-screen bg-[#F8F5F2] p-4 flex flex-col gap-6 max-w-md mx-auto text-[#1F2937]">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-center">
        🧪 Resin Calculator
      </h1>

      {/* PRICE */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-lg">💰 Calcul prix</h2>

        <input
          type="number"
          placeholder="Poids (g)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-3 bg-white"
          onChange={(e) => setWeight(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Temps (minutes)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-3 bg-white"
          onChange={(e) => setTime(Number(e.target.value))}
        />

        <div className="flex justify-between items-center mb-2">
          <span>Intégration</span>
          <input
            type="checkbox"
            onChange={() => setIntegration(!integration)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <span>Personnalisation</span>
          <input
            type="checkbox"
            onChange={() => setCustom(!custom)}
          />
        </div>

        <div className="bg-[#C08457] text-white p-4 rounded-xl text-center text-xl font-bold">
          {total.toFixed(2)} €
        </div>

        <button
          className="bg-[#3F3F46] text-white p-3 rounded-xl mt-4 w-full active:scale-95 transition"
          onClick={() =>
            saveToHistory({
              type: "price",
              total,
              weight,
              time,
              integration,
              custom,
              date: Date.now(),
            })
          }
        >
          Sauvegarder
        </button>
      </div>

      {/* MIX */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-lg">🧪 Calcul mélange</h2>

        <input
          type="number"
          placeholder="Quantité totale (g)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 bg-white"
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <div className="flex gap-3">
          <div className="flex-1 bg-[#F1ECE7] p-3 rounded-xl text-center">
            <p className="text-sm text-gray-600">Résine A</p>
            <p className="text-lg font-bold">{partA.toFixed(2)} g</p>
          </div>

          <div className="flex-1 bg-[#F1ECE7] p-3 rounded-xl text-center">
            <p className="text-sm text-gray-600">Résine B</p>
            <p className="text-lg font-bold">{partB.toFixed(2)} g</p>
          </div>
        </div>

        <button
          className="bg-[#3F3F46] text-white p-3 rounded-xl mt-4 w-full active:scale-95 transition"
          onClick={() =>
            saveToHistory({
              type: "mix",
              quantity,
              partA,
              partB,
              date: Date.now(),
            })
          }
        >
          Sauvegarder
        </button>
      </div>

      {/* HISTORY */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-lg">📜 Historique</h2>

        {history.length === 0 && (
          <p className="text-sm text-gray-500">Aucun calcul</p>
        )}

        <div className="flex flex-col gap-2">
          {history.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-[#F8F5F2] p-3 rounded-xl"
            >
              <div>
                {item.type === "price" ? (
                  <p className="font-medium">
                    💰 {item.total.toFixed(2)} €
                  </p>
                ) : (
                  <p className="font-medium">
                    🧪 {item.quantity}g → A:{item.partA.toFixed(1)} / B:
                    {item.partB.toFixed(1)}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteItem(i)}
                className="text-red-500 text-sm"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="mt-4 text-red-600 text-sm w-full"
          >
            Tout supprimer
          </button>
        )}
      </div>
    </main>
  );
}