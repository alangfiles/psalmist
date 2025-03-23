import React, { useState, useEffect, useRef } from "react";

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

  // Ref to store the element for today's psalm
  const todayPsalmRef = useRef(null);

  useEffect(() => {
    const localStorageKey = `psalm-${selectedPsalm}`;
    const savedInput = localStorage.getItem(localStorageKey) || "";
    setUserInput(savedInput);

    fetchPsalm(selectedPsalm).then(setPsalmText);
  }, [selectedPsalm]);

  useEffect(() => {
    const localStorageKey = `psalm-${selectedPsalm}`;
    localStorage.setItem(localStorageKey, userInput);

    // Calculate fuzzy completion
    const psalmLength = psalmText.length;
    const inputLength = userInput.length;
    const fuzzyCompletion = (inputLength / psalmLength) * 100;
    setCompletion(fuzzyCompletion);
  }, [userInput, psalmText, selectedPsalm]);

  // Scroll to today's psalm when the component mounts
  useEffect(() => {
    if (todayPsalmRef.current) {
      todayPsalmRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handlePsalmClick = (psalmNumber) => {
    setSelectedPsalm(psalmNumber);
  };

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleNextPsalm = () => {
    setSelectedPsalm((prev) => (prev % totalPsalms) + 1);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-52 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Psalms</h2>
        <ul>
          {Array.from({ length: totalPsalms }, (_, i) => i + 1).map((psalmNumber) => {
            const localStorageKey = `psalm-${psalmNumber}`;
            const savedInput = localStorage.getItem(localStorageKey) || "";

            // Attach the ref to today's psalm
            const isTodayPsalm = psalmNumber === (dayOfYear % totalPsalms) + 1;

            return (
              <li
                key={psalmNumber}
                ref={isTodayPsalm ? todayPsalmRef : null}
                className={`cursor-pointer p-2 ${
                  psalmNumber === selectedPsalm ? "bg-gray-200 font-bold" : ""
                }`}
                onClick={() => handlePsalmClick(psalmNumber)}
              >
                ψ {psalmNumber} - {savedInput ? "In Progress" : "Not Started"}
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
          className="w-full p-2 border mt-2 h-60" // Increased height
          value={userInput}
          onChange={handleChange}
        />
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${Math.round(completion / 10) * 10}%` }}
          ></div>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleNextPsalm}
        >
          Next Psalm
        </button>
      </div>
    </div>
  );
};

export default PsalmistApp;
