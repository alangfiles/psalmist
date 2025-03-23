import React, { useState, useEffect, useRef } from "react";

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

async function fetchAllPsalms() {
  try {
    const response = await fetch('/psalmist/psalms/psalms.json'); // Corrected path
    const psalms = await response.json();
    return psalms.chapters; // Assuming `chapters` contains all psalms
  } catch (error) {
    console.error('Error fetching Psalms:', error);
    return [];
  }
}

const PsalmistApp = () => {
  const totalPsalms = 150;
  const dayOfYear = getDayOfYear();
  const [psalms, setPsalms] = useState([]); // Store all psalms
  const [selectedPsalm, setSelectedPsalm] = useState((dayOfYear % totalPsalms) + 1);
  const [userInput, setUserInput] = useState("");
  const [completion, setCompletion] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar visibility

  const todayPsalmRef = useRef(null);

  useEffect(() => {
    // Fetch all psalms once when the component mounts
    fetchAllPsalms().then(setPsalms);
  }, []);

  useEffect(() => {
    if (psalms.length > 0) {
      const localStorageKey = `psalm-${selectedPsalm}`;
      const savedInput = localStorage.getItem(localStorageKey) || "";
      setUserInput(savedInput);

      const selectedPsalmData = psalms.find((psalm) => psalm.chapter === selectedPsalm.toString());
      if (selectedPsalmData) {
        const psalmText = selectedPsalmData.verses
          .map((verse) => `${verse.verse}. ${verse.text}`)
          .join("\n");
        setCompletion((savedInput.length / psalmText.length) * 100);
      }
    }
  }, [selectedPsalm, psalms]);

  useEffect(() => {
    const localStorageKey = `psalm-${selectedPsalm}`;
    localStorage.setItem(localStorageKey, userInput);

    if (psalms.length > 0) {
      const selectedPsalmData = psalms.find((psalm) => psalm.chapter === selectedPsalm.toString());
      if (selectedPsalmData) {
        const psalmText = selectedPsalmData.verses
          .map((verse) => `${verse.verse}. ${verse.text}`)
          .join("\n");
        setCompletion((userInput.length / psalmText.length) * 100);
      }
    }
  }, [userInput, psalms, selectedPsalm]);

  useEffect(() => {
    if (todayPsalmRef.current) {
      todayPsalmRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handlePsalmClick = (psalmNumber) => {
    setSelectedPsalm(psalmNumber);
    setIsSidebarOpen(false); // Close the sidebar on mobile after selecting a psalm
  };

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleNextPsalm = () => {
    setSelectedPsalm((prev) => (prev % totalPsalms) + 1);
  };

  const getProgressBarStyle = () => {
    let progress = Math.min(Math.round(completion), 100); // Cap at 100%
    if (progress >= 90) {
      progress = 100;
    }
    const color = progress > 90 ? "bg-green-500" : "bg-blue-500"; // Green if > 90%
    return { width: `${progress}%`, colorClass: color };
  };

  const { width, colorClass } = getProgressBarStyle();

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-10 bg-white border-r p-4 overflow-y-auto transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:relative md:translate-x-0 md:w-34`}
      >
        <h2 className="text-lg font-bold mb-4">Psalms</h2>
        <ul>
          {Array.from({ length: totalPsalms }, (_, i) => i + 1).map((psalmNumber) => {
            const localStorageKey = `psalm-${psalmNumber}`;
            const savedInput = localStorage.getItem(localStorageKey) || "";

            const selectedPsalmData = psalms.find(
              (psalm) => psalm.chapter === psalmNumber.toString()
            );
            const psalmText =
              selectedPsalmData?.verses
                .map((verse) => `${verse.verse}. ${verse.text}`)
                .join("\n") || "";
            const completionPercentage = (savedInput.length / psalmText.length) * 100;

            const isCompleted = completionPercentage > 90;
            const status = isCompleted
              ? "✓"
              : savedInput
              ? "✎"
              : "";
            const rowClass = isCompleted ? "bg-green-200" : "";

            const isTodayPsalm = psalmNumber === (dayOfYear % totalPsalms) + 1;

            return (
              <li
                key={psalmNumber}
                ref={isTodayPsalm ? todayPsalmRef : null}
                className={`cursor-pointer rounded p-2 ${rowClass} ${
                  psalmNumber === selectedPsalm ? "bg-gray-200 font-bold" : ""
                }`}
                onClick={() => handlePsalmClick(psalmNumber)}
              >
                ψ {psalmNumber} {status}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Sidebar Toggle Button (Visible on Mobile) */}
        <button
          className="md:hidden mb-4 bg-blue-500 text-white px-4 py-2 rounded shadow"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "Close" : "Menu"}
        </button>

        <h1 className="text-xl font-bold">Psalm {selectedPsalm}</h1>
        <pre className="border p-2 bg-gray-100 whitespace-pre-wrap">
          {psalms
            .find((psalm) => psalm.chapter === selectedPsalm.toString())
            ?.verses.map((verse) => (
              <span key={verse.verse}>
                <span className="text-sm text-gray-500">{verse.verse}.</span> {verse.text}
                {"\n"}
              </span>
            )) || ""}
        </pre>
        <textarea
          className="w-full p-2 border mt-2 h-60"
          value={userInput}
          onChange={handleChange}
        />
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className={`${colorClass} h-4 rounded-full transition-all duration-300 ease-in-out`}
            style={{ width }}
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
