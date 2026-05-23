import { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { differenceInDays, format } from 'date-fns';
import { Heart, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

function AnniversaryCard() {
  const { state, updateState } = useApp();
  const [isEditing, setIsEditing] = useState(!state?.anniversaryDate);
  const [dateInput, setDateInput] = useState(state?.anniversaryDate || '');

  const daysPassed = state?.anniversaryDate 
    ? differenceInDays(new Date(), new Date(state.anniversaryDate))
    : 0;

  const handleSave = () => {
    if (dateInput) {
      updateState({ anniversaryDate: dateInput });
      setIsEditing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-300 rounded-[2rem] p-6 text-white shadow-lg cute-shadow relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Heart className="w-28 h-28 text-white fill-white rotate-12" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <h2 className="text-lg font-bold text-white font-handwriting">恋爱日记</h2>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <p className="text-sm text-white/90">我们是从哪一天开始的呢？</p>
            <input 
              type="date" 
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white bg-white/20 text-white placeholder-white/50 backdrop-blur-sm"
              style={{ colorScheme: 'dark' }}
            />
            <button 
              onClick={handleSave}
              className="w-full py-3 bg-white text-primary-400 rounded-xl font-bold hover:bg-white/90 transition-colors"
            >
              保存纪念日
            </button>
          </div>
        ) : (
          <div className="text-center py-4 cursor-pointer" onClick={() => setIsEditing(true)}>
            <p className="text-sm text-white/90 mb-2 font-medium">我们在一起已经</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-black text-white font-sans drop-shadow-sm">{daysPassed}</span>
              <span className="text-2xl font-bold text-white">天啦</span>
            </div>
            <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-2 px-4 shadow-sm border border-white/20">
               <p className="text-xs text-white pb-1 font-medium">起始日: {state?.anniversaryDate}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function WeatherCard() {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            setWeather({
              temp: data.current_weather.temperature,
              code: data.current_weather.weathercode,
            });
          } catch (err) {
            setError('获取天气失败啦');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('需要位置权限才能看天气哦');
          setLoading(false);
        }
      );
    } else {
      setError('浏览器不支持位置服务');
      setLoading(false);
    }
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-12 h-12 text-amber-400 fill-amber-400" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-12 h-12 text-gray-400 fill-gray-200" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-12 h-12 text-blue-400 fill-blue-400" />;
    if (code >= 71 && code <= 82) return <CloudSnow className="w-12 h-12 text-sky-200 fill-sky-200" />;
    if (code >= 95) return <CloudLightning className="w-12 h-12 text-purple-400 fill-purple-400" />;
    return <Sun className="w-12 h-12 text-amber-400" />;
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return '晴朗好天气';
    if (code >= 1 && code <= 3) return '有云彩漂浮';
    if (code >= 51 && code <= 67) return '下雨啦，出门带伞';
    if (code >= 71 && code <= 82) return '哇，下雪了！';
    if (code >= 95) return '雷阵雨，乖乖待在室内';
    return '宜想我';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-[2rem] p-6 border-2 border-primary-100 cute-shadow"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🌤️</span>
        <h2 className="text-sm font-bold text-primary-600">今日头顶的天空</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-2" />
          <p className="text-xs text-gray-400">正在看天...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4 opacity-70">
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          <span className="text-xs bg-primary-50 px-3 py-1 rounded-full border border-primary-100 text-primary-400">不知道天气也要开心！</span>
        </div>
      ) : weather ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-gray-700 font-sans">
              {weather.temp}<span className="text-xl font-normal">°C</span>
            </div>
            <p className="text-sm text-gray-400 mt-1 font-medium">{getWeatherText(weather.code)}</p>
          </div>
          <div className="animate-pulse drop-shadow-md">
            {getWeatherIcon(weather.code)}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

export function Home() {
  const { state } = useApp();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了，快睡觉猪猪';
    if (hour < 12) return '早上好，Judy宝贝';
    if (hour < 18) return '下午好呀';
    return '晚上好，今天辛苦啦';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="pt-4 pb-2 px-2">
        <h1 className="text-3xl font-bold text-primary-400 mb-1">Judy's Space ✨</h1>
        <p className="text-gray-400 text-sm">{getGreeting()}</p>
      </header>

      <AnniversaryCard />
      <WeatherCard />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-4 bg-primary-50 rounded-2xl border border-dashed border-primary-100"
      >
        <h3 className="text-sm font-bold text-primary-600 mb-2 flex items-center gap-2">
          <span>💡</span> Judy专属鼓励
        </h3>
        <p className="text-primary-600 text-sm leading-relaxed font-handwriting">
          "今天也是闪闪发光的一天！肚子饿了就去吃好吃的，累了就抱抱我，不要给自己太大压力哦。"
        </p>
      </motion.div>
      
    </div>
  );
}
