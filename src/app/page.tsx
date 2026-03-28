"use client";

import { useState, useEffect } from "react";
import TrendingColors from "@/components/TrendingColors";
import { supabase } from "@/lib/supabase";

interface Extra {
  name: string;
  price: number;
}

export default function Home() {
  // ADMIN
  const [showAdmin, setShowAdmin] = useState(false);

  const [pricePerLitre, setPricePerLitre] = useState(80);
  const [hourRate, setHourRate] = useState(30);

  const [extras, setExtras] = useState<Extra[]>([]);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState(0);

  // LOAD CONFIG — Supabase en priorité, localStorage en fallback
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("resin_config")
          .select("price_per_litre, hour_rate, extras")
          .limit(1)
          .single();

        if (!error && data) {
          setPricePerLitre(data.price_per_litre ?? 80);
          setHourRate(data.hour_rate ?? 30);
          setExtras(data.extras ?? []);
          return;
        }
      } catch (_) {
        // Supabase indisponible, on passe au fallback
      }

      // Fallback localStorage
      const saved = localStorage.getItem("config");
      if (saved) {
        const config = JSON.parse(saved);
        setPricePerLitre(config.pricePerLitre || 80);
        setHourRate(config.hourRate || 30);
        setExtras(config.extras || []);
      }
    };

    loadConfig();
  }, []);

  const saveConfig = async () => {
    try {
      await supabase.from("resin_config").upsert({
        id: 1,
        price_per_litre: pricePerLitre,
        hour_rate: hourRate,
        extras,
      });
    } catch (_) {
      // Supabase indisponible, on sauvegarde en localStorage
      localStorage.setItem(
        "config",
        JSON.stringify({ pricePerLitre, hourRate, extras })
      );
    }

    // Toujours sauvegarder en localStorage comme cache local
    localStorage.setItem(
      "config",
      JSON.stringify({ pricePerLitre, hourRate, extras })
    );

    setShowAdmin(false);
  };

  // ADD EXTRA
  const addExtra = () => {
    if (!newExtraName) return;
    setExtras([...extras, { name: newExtraName, price: newExtraPrice }]);
    setNewExtraName("");
    setNewExtraPrice(0);
  };

  // DELETE EXTRA
  const deleteExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  // PRICE CALCULATOR
  const [weight, setWeight] = useState(0);
  const [time, setTime] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);

  const resinPrice = (weight / 1000) * pricePerLitre;
  const timePrice = (time / 60) * hourRate;
  const extrasTotal = selectedExtras.reduce(
    (sum, index) => sum + extras[index].price,
    0
  );
  const total = resinPrice + timePrice + extrasTotal;

  // MIX
  const [quantity, setQuantity] = useState(0);
  const partA = (quantity * 2) / 3;
  const partB = (quantity * 1) / 3;

  return (
    <main className="min-h-screen bg-[#F8F5F2] p-4 flex flex-col gap-6 max-w-md mx-auto text-[#1F2937]">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🧪 Resin Calculator</h1>
        <button onClick={() => setShowAdmin(!showAdmin)} className="text-xl">
          ⚙️
        </button>
      </div>

      {/* ADMIN PANEL */}
      {showAdmin && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="font-semibold mb-4 text-lg">⚙️ Paramètres</h2>

          <div className="mb-4">
            <label className="text-sm font-medium block mb-1">Prix résine (€/L)</label>
            <input
              type="number"
              value={pricePerLitre}
              onChange={(e) => setPricePerLitre(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium block mb-1">Taux horaire (€/h)</label>
            <input
              type="number"
              value={hourRate}
              onChange={(e) => setHourRate(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Paramètres supplémentaires</h3>
            {extras.length === 0 && (
              <p className="text-sm text-gray-500 mb-2">Aucun paramètre ajouté</p>
            )}
            {extras.map((extra, index) => (
              <div key={index} className="flex justify-between items-center mb-2 bg-[#F8F5F2] p-2 rounded">
                <span>{extra.name} (+{extra.price}€)</span>
                <button onClick={() => deleteExtra(index)} className="text-red-500 text-sm">❌</button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">+ Ajouter un paramètre</h3>
            <input
              type="text"
              placeholder="Nom (ex: Emballage)"
              value={newExtraName}
              onChange={(e) => setNewExtraName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-2"
            />
            <input
              type="number"
              placeholder="Prix (€)"
              value={newExtraPrice}
              onChange={(e) => setNewExtraPrice(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl mb-3"
            />
            <button onClick={addExtra} className="bg-[#C08457] text-white p-3 rounded-xl w-full">
              + Ajouter
            </button>
          </div>

          <button onClick={saveConfig} className="bg-[#3F3F46] text-white p-3 rounded-xl w-full mt-4">
            Sauvegarder
          </button>
        </div>
      )}

      {/* PRICE */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-lg">💰 Calcul prix</h2>

        <input
          type="number"
          placeholder="Poids (g)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-3"
          onChange={(e) => setWeight(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Temps (minutes)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-3"
          onChange={(e) => setTime(Number(e.target.value))}
        />

        <div className="mb-4">
          {extras.map((extra, index) => (
            <label key={index} className="flex justify-between mb-1">
              {extra.name} (+{extra.price}€)
              <input
                type="checkbox"
                onChange={() => {
                  if (selectedExtras.includes(index)) {
                    setSelectedExtras(selectedExtras.filter((i) => i !== index));
                  } else {
                    setSelectedExtras([...selectedExtras, index]);
                  }
                }}
              />
            </label>
          ))}
        </div>

        <div className="bg-[#C08457] text-white p-4 rounded-xl text-center text-xl font-bold">
          {total.toFixed(2)} €
        </div>
      </div>

      {/* MIX */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-lg">🧪 Calcul mélange</h2>

        <input
          type="number"
          placeholder="Quantité totale (g)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4"
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
      </div>

      {/* COULEURS DU MOMENT — en bas de page */}
      <TrendingColors />

    </main>
  );
}
