import React from 'react';
import  './sidebar.css';
import {assets} from '../../assets/assets';
import { Context } from '../../context/context';
const Sidebar =() => {
    const [extended,setextended] = React.useState(false);
    const { onsent, input, setInput, recentPrompt, previousPrompt, loadPreviousConversation, newChat } = React.useContext(Context);
  return ( 
    <div className='sidebar'>
      <div className="top">
        <img onClick={() => setextended(prev => !prev)} className='menu' src={assets.menu_icon} alt="Menu" />
        <div className="new-chat" onClick={newChat}>
          <img className='new-chat-icon' src={assets.plus_icon} alt='' />
         { extended?<p>New Chat</p> :null}
        </div>
        { extended ? 
        <div className="recent">
            <p className="recent-title">Recent </p>
            {previousPrompt.slice().reverse().map((items,index)=>{
              return (
                <div key={index} onClick={() => loadPreviousConversation(items)} className="recent-entry">
                  <img src={assets.message_icon} alt="" />
                  <p>{items.slice(0, 18)}...</p>
                </div>
              )
            })}
        </div>
        :null }
      </div>

      <div className="bottom">
        <div className="bottom-items">
            <img className='bottom-icon' src={assets.question_icon} alt="" />
            {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-items">
            <img className='bottom-icon' src={assets.history_icon} alt="" />
            {extended ? <p>Activity</p> : null}
        </div>
        <div className="bottom-items">
            <img className='bottom-icon' src={assets.setting_icon} alt="" />
            {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  )
}
export default Sidebar;