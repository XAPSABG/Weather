import React from 'react';

interface WeatherEffectsProps {
  condition: string;
  isDay: boolean;
  showEffects: boolean;
}

const Rain: React.FC = () => (
    <>
      {Array.from({ length: 150 }).map((_, i) => {
        const style = {
          left: `${Math.random() * 110 - 5}%`,
          animation: `fall ${0.5 + Math.random() * 0.3}s linear ${Math.random() * 5}s infinite`,
          height: `${20 + Math.random() * 30}px`,
          opacity: Math.random() * 0.4 + 0.3,
          transform: 'skewX(-15deg)',
        };
        return <div key={i} className="absolute top-0 w-[2px] bg-gradient-to-b from-transparent to-blue-200/80" style={style} />;
      })}
    </>
);

const Snow: React.FC = () => (
    <>
      {Array.from({ length: 200 }).map((_, i) => {
        const size = 2 + Math.random() * 6;
        const blur = Math.random() > 0.5 ? `blur(${Math.random() * 2}px)` : 'none';
        const style = {
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          animation: `fall ${8 + Math.random() * 7}s linear ${Math.random() * 10}s infinite, drift ${4 + Math.random() * 3}s ease-in-out ${Math.random() * 5}s infinite`,
          opacity: Math.random() * 0.7 + 0.3,
          filter: blur,
        };
        return <div key={i} className="absolute top-0 bg-white rounded-full" style={style} />;
      })}
    </>
);

const Clouds: React.FC<{ count?: number; dark?: boolean }> = ({ count = 6, dark = false }) => {
    const cloudColor = dark ? 'bg-slate-800/40' : 'bg-white/20';
    return (
        <>
            {Array.from({ length: count }).map((_, i) => {
                const size = 20 + Math.random() * 20; // in rem
                const style = {
                    width: `${size}rem`,
                    height: `${size}rem`,
                    top: `${-20 + Math.random() * 90}%`,
                    left: `${-20 + Math.random() * 90}%`,
                    opacity: 0.1 + Math.random() * 0.3,
                    animation: `cloudDrift ${60 + Math.random() * 120}s linear ${Math.random() * 10}s infinite ${i % 2 === 0 ? 'reverse' : 'normal'}`
                }
                return <div key={i} className={`absolute ${cloudColor} rounded-full blur-3xl`} style={style} />
            })}
        </>
    );
};


const Thunderstorm: React.FC = () => (
    <>
      <Rain />
      <Clouds dark={true} count={8}/>
      <div className="absolute inset-0 bg-blue-300/50 animate-lightning" style={{ animationDelay: `1s` }}></div>
      <div className="absolute inset-0 bg-white/70 animate-lightning" style={{ animationDelay: `4.3s` }}></div>
      <div className="absolute inset-0 bg-blue-200/60 animate-lightning" style={{ animationDelay: `6.8s` }}></div>
    </>
);

const Aurora: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-r from-green-300/40 via-cyan-400/40 to-indigo-500/40 opacity-40 animate-aurora" style={{ backgroundSize: '400% 400%' }} />
);

const ShootingStars: React.FC = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <div 
        key={i} 
        className="absolute top-0 left-0 w-40 h-px bg-gradient-to-l from-transparent to-white/70"
        style={{ animation: `shooting-star ${3 + Math.random() * 5}s linear ${Math.random() * 10}s infinite`}}
      />
    ))}
  </>
);

const SunRays: React.FC = () => (
    <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2">
        <div className="absolute inset-0 bg-gradient-radial from-yellow-200/20 via-yellow-200/10 to-transparent rounded-full animate-sun-rays" />
    </div>
);

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ condition, isDay, showEffects }) => {
  const cond = condition.toLowerCase();

  const getEffect = () => {
    if (cond.includes('thunder')) return <Thunderstorm />;
    if (cond.includes('snow') || cond.includes('sleet') || cond.includes('blizzard')) return <Snow />;
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return <Rain />;
    if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog') || cond.includes('mist')) return <Clouds dark={!isDay} />;
    
    if (showEffects) {
        if ((cond.includes('sun') || cond.includes('clear')) && isDay) return <SunRays />;
        if (cond.includes('clear') && !isDay) return <><Aurora /><ShootingStars /></>;
    }
    
    return null;
  };
  
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {getEffect()}
    </div>
  );
};

export default WeatherEffects;