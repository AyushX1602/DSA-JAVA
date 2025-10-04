import { useState, useRef, useEffect } from "react";

const WhatsAppChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  // Function to handle clicks outside of the popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div>
      {/* WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 bg-green-500 text-white px-5 py-3 text-lg rounded-full shadow-lg hover:bg-green-600 transition-all"
      >
        💬 Chat with NGO
      </button>

      {/* WhatsApp Chat Popup */}
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed bottom-20 left-5 bg-white p-4 rounded-lg shadow-lg w-64 z-10"
        >
          <p className="text-gray-700 font-medium mb-2">📢 Connect with an NGO now!</p>
          <a
            href={`https://wa.me/${918208312162}?text=Hello!%20I%20want%20to%20donate%20food.`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all">
              Start Chat
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat;
