import { useEffect, useState } from 'react'
import Background from './Components/Background/background'
import Navbar from './Components/Navbar/navbar'
import Hero from './Components/Hero/hero'

const App = () => {
  let herodata = [
    {text1:"Dive Into ", text2:"What You Love"},
    {text1:"Indulge ", text2:"Your Passion"},
    {text1:"Give Into ", text2:"Your Desires"},
  ]
  const[herocount,setherocount]= useState(0);
  const[playstatus,setplaystatus]= useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setherocount((prevCount) => {
        return prevCount === 2 ? 0 : prevCount + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Background playstatus={playstatus} herocount={herocount}/>
      <Navbar />
      <Hero
        setplaystatus={setplaystatus}
        herocount={herocount}
        herodata={herodata}
        setherocount={setherocount}
        playstatus={playstatus}
      />
    </div>
  )
}

export default App;