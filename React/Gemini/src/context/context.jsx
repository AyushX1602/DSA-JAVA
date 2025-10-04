import { createContext } from "react";
import React from 'react';

import runChat from "../components/config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {

      const[input,setInput] = React.useState("");
      const[recentPrompt,setRecentPrompt] = React.useState("");
      const[previousPrompt,setPreviousPrompt] = React.useState([]);
      const[showResult,setShowResult] = React.useState(false);
      const[loading,setLoading] = React.useState(false);
      const[resultData,setResultData] = React.useState("");
      const[chatHistory,setChatHistory] = React.useState([]); // Store conversation history

      const delayPara =(index,nextWord) => {
         setTimeout(function(){
            setResultData((prev) => prev + nextWord);
         }, index * 75);
       }

    const loadPreviousConversation = (prompt) => {
        // Find the conversation for this prompt
        const conversation = chatHistory.find(chat => chat.prompt === prompt);
        if (conversation) {
            setRecentPrompt(prompt);
            setResultData(conversation.response);
            setShowResult(true);
            setLoading(false);
        }
    }

    const newChat = () => {
        // Reset to main page with cards
        setShowResult(false);
        setInput("");
        setRecentPrompt("");
        setResultData("");
        setLoading(false);
    }

    const onsent= async(prompt)=>{
      
      if(!input.trim()) return; // Don't send empty messages
      
      const currentPrompt = input; // Save the current input before clearing
      
      setResultData("")
      setLoading(true)
      setShowResult(true)
      setRecentPrompt(currentPrompt)
      setPreviousPrompt((prev) => [...prev, currentPrompt]);
      setInput("") // Clear input after saving
      
      const response = await runChat(currentPrompt)
      
      let responseArray = response.split("**");
      let newResponse = "";
      for(let i=0;i<responseArray.length;i++){
         if(i==0||i%2!==1){
            newResponse+= responseArray[i];
         }
         else{
            newResponse += "<b>"+responseArray[i]+"</b>"  ;
         }
      }
      let newResponse2= newResponse.split("*").join("</br>")
      let newResponseArray = newResponse2.split(" ");
      
      // Save the complete conversation to history
      setChatHistory((prev) => [...prev, { prompt: currentPrompt, response: newResponse2 }]);
      
      for(let i=0;i<newResponseArray.length;i++){
         const nextWord = newResponseArray[i];
         delayPara(i,nextWord+" "); 
      }

      setLoading(false)
    }
    
    const ContextValue = {
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
      chatHistory,
      setChatHistory,
      onsent,
      loadPreviousConversation,
      newChat
    }
 return (
    <Context.Provider value={ContextValue}>
        {props.children}
    </Context.Provider>
 )
}
export default ContextProvider;

