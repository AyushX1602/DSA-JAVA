import './hero.css';
import arrow_btn from '../../assets/arrow_btn.png';
import play_btn from '../../assets/play_icon.png';
import pause_btn from '../../assets/pause_icon.png';

const Hero = ({ herodata, herocount, setherocount, setplaystatus, playstatus }) => {
  return (
    <div className='hero'>
            <div className="herotext">
                <p> {herodata[herocount].text1}</p>
                <p> {herodata[herocount].text2}</p>
            </div>
        <div className="hero-explore">
            <p>Explore The Features</p>
            <img src={arrow_btn} alt=""/>
        </div>
        <div className="hero-dot-play">
            <ul className="hero-dots">
                <li onClick={()=>setherocount(0)} className={herocount === 0 ?"hero-dot-orange":"hero-dot"}></li>
                <li onClick={()=>setherocount(1)} className={herocount === 1 ?"hero-dot-orange":"hero-dot"}></li>
                <li onClick={()=>setherocount(2)} className={herocount === 2 ?"hero-dot-orange":"hero-dot"}></li>
            </ul>
            <div className="hero-play">
                <img onClick={() => setplaystatus(!playstatus)}src={playstatus ? pause_btn : play_btn} alt="" />
                <p>See the video</p>
                


            </div>
        </div>
    </div>
  )
}

export default Hero;