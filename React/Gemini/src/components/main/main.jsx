import React from "react";
import "./main.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/context.jsx";

const Main = () => {
  const {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    previousPrompt,
    setPreviousPrompt,
    showResult,
    setShowResult,
    loading,
    setLoading,
    resultData,
    setResultData,
    onsent,
  } = React.useContext(Context);

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} alt="" />
      </div>
      <div className="main-container">

        {!showResult ? 
        <>
        <div className="greet">
          <p>
            <span>Hello,Ayush!</span>
          </p>
          <p>How can I assist you today?</p>
        </div>
        <div className="cards">
          <div className="card">
            <p>Suggest beautiful places to visit</p>
            <img src={assets.compass_icon} alt="" />
          </div>
          <div className="card">
            <p>Summarize The Concept:Urban planning</p>
            <img src={assets.bulb_icon} alt="" />
          </div>
          <div className="card">
            <p>Brainstorming Team bonding activity </p>
            <img src={assets.message_icon} alt="" />
          </div>
          <div className="card">
            <p>Improve readability of following code snippets</p>
            <img src={assets.code_icon} alt="" />
          </div>
        </div>
        </>
        :<div className="result">
            <div className="result-title">
                <img src={assets.user_icon} alt="" />
                <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
                <img src={assets.gemini_icon} alt="" />
                {loading ? 
                <div className="loader">
                    <hr />
                    <hr />
                    <hr />
                </div>
                : 
                <p dangerouslySetInnerHTML={{__html:resultData}}></p>
                }
            </div>
            </div>
        
        }
        <div className="main-bottom">
          <div className="search-box">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder="Search for a topic..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onsent(input);
                }
              }}
            />
            <div>
              <img src={assets.gallery_icon} alt="" />
              <img src={assets.mic_icon} alt="" />
              <img onClick={() => onsent(input)} src={assets.send_icon} alt="" />
            </div>
          </div>
          <p>
            Gemini may display inaccurate info, please verify with reliable
            sources.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Main;
