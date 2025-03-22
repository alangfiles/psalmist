import React, { useState, useEffect } from "react";

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

async function fetchPsalm(psalmNumber) {
  try {
    const response = await fetch('/psalmist/psalms/psalms.json'); // Corrected path
    const psalms = await response.json();
    const chapter = psalms.chapters.find((ch) => ch.chapter === psalmNumber.toString());
    if (!chapter) {
      return "Psalm not found";
    }
    return chapter.verses.map((verse) => `${verse.verse}. ${verse.text}`).join("\n");
  } catch (error) {
    console.error('Error fetching Psalms:', error);
    return 'Error loading Psalm';
  }
}

const PsalmistApp = () => {
  const totalPsalms = 150;
  const dayOfYear = getDayOfYear();
  const [selectedPsalm, setSelectedPsalm] = useState((dayOfYear % totalPsalms) + 1);
  const [psalmText, setPsalmText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const localStorageKey = `psalm-${selectedPsalm}`;
    const savedInput = localStorage.getItem(localStorageKey) || "";
    setUserInput(savedInput);

    fetchPsalm(selectedPsalm).then(setPsalmText);
  }, [selectedPsalm]);

  useEffect(() => {
    const localStorageKey = `psalm-${selectedPsalm}`;
    localStorage.setItem(localStorageKey, userInput);
    setCompletion((userInput.length / psalmText.length) * 100);
  }, [userInput, psalmText, selectedPsalm]);

  const handlePsalmClick = (psalmNumber) => {
    setSelectedPsalm(psalmNumber);
  };

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Psalms</h2>
        <ul>
          {Array.from({ length: totalPsalms }, (_, i) => i + 1).map((psalmNumber) => {
            const localStorageKey = `psalm-${psalmNumber}`;
            const savedInput = localStorage.getItem(localStorageKey);
            return (
              <li
                key={psalmNumber}
                className={`cursor-pointer p-2 ${
                  psalmNumber === selectedPsalm ? "bg-gray-200 font-bold" : ""
                }`}
                onClick={() => handlePsalmClick(psalmNumber)}
              >
                Psalm {psalmNumber} - {savedInput ? "In Progress" : "Not Started"}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-4">
        <h1 className="text-xl font-bold">Psalm {selectedPsalm}</h1>
        <pre className="border p-2 bg-gray-100 whitespace-pre-wrap">{psalmText}</pre>
        <textarea
          className="w-full p-2 border mt-2 h-40"
          value={userInput}
          onChange={handleChange}
        />
        <p className="mt-2">Completion: {completion.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default PsalmistApp;
