import { useState, useEffect, type FormEvent } from 'react';
import { useApp } from '../lib/AppContext';
import { differenceInDays } from 'date-fns';
import { Heart, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, MapPin, Loader2, Search } from 'lucide-react';
import { motion } from 'motion/react';

const WEATHER_CITY_KEY = 'judy_weather_city';
const DEFAULT_CITY = {
  name: '北京',
  latitude: 39.9042,
  longitude: 116.4074,
};
const PRESET_CITIES: Record<string, typeof DEFAULT_CITY> = {
  北京: DEFAULT_CITY,
  上海: { name: '上海', latitude: 31.2304, longitude: 121.4737 },
  广州: { name: '广州', latitude: 23.1291, longitude: 113.2644 },
  深圳: { name: '深圳', latitude: 22.5431, longitude: 114.0579 },
  杭州: { name: '杭州', latitude: 30.2741, longitude: 120.1551 },
  成都: { name: '成都', latitude: 30.5728, longitude: 104.0668 },
  重庆: { name: '重庆', latitude: 29.563, longitude: 106.5516 },
  武汉: { name: '武汉', latitude: 30.5928, longitude: 114.3055 },
  南京: { name: '南京', latitude: 32.0603, longitude: 118.7969 },
  西安: { name: '西安', latitude: 34.3416, longitude: 108.9398 },
  天津: { name: '天津', latitude: 39.3434, longitude: 117.3616 },
};

type WeatherInfo = {
  temp: number;
  code: number;
  place: string;
};

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
      className="bg-primary-300 rounded-[1.75rem] p-5 text-white shadow-lg cute-shadow relative overflow-hidden sm:p-6"
    >
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Heart className="w-24 h-24 text-white fill-white rotate-12 sm:h-28 sm:w-28" />
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
          <div className="text-center py-3 cursor-pointer sm:py-4" onClick={() => setIsEditing(true)}>
            <p className="text-sm text-white/90 mb-2 font-medium">我们在一起已经</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black text-white font-sans drop-shadow-sm sm:text-6xl">{daysPassed}</span>
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
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cityInput, setCityInput] = useState(() => localStorage.getItem(WEATHER_CITY_KEY) || DEFAULT_CITY.name);

  const fetchWeather = async (latitude: number, longitude: number, place: string) => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current_weather: 'true',
      timezone: 'auto',
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) throw new Error('weather request failed');
    const data = await res.json();
    if (!data.current_weather) throw new Error('weather data missing');
    setWeather({
      temp: Math.round(Number(data.current_weather.temperature)),
      code: Number(data.current_weather.weathercode),
      place,
    });
  };

  const fetchCityWeather = async (cityName: string, fallbackNotice?: string) => {
    const city = cityName.trim() || DEFAULT_CITY.name;
    setLoading(true);
    setError('');
    try {
      const presetCity = PRESET_CITIES[city];
      if (presetCity) {
        await fetchWeather(presetCity.latitude, presetCity.longitude, presetCity.name);
      } else {
        const params = new URLSearchParams({
          name: city,
          count: '1',
          language: 'zh',
          format: 'json',
        });
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
        if (!res.ok) throw new Error('city request failed');
        const data = await res.json();
        const result = data.results?.[0];
        if (!result) throw new Error('city not found');
        await fetchWeather(result.latitude, result.longitude, result.name || city);
      }
      localStorage.setItem(WEATHER_CITY_KEY, city);
      setCityInput(city);
      setNotice(fallbackNotice || '');
    } catch {
      setError('这个城市暂时没找到天气');
      setNotice('');
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackWeather = async (message: string) => {
    const savedCity = localStorage.getItem(WEATHER_CITY_KEY) || DEFAULT_CITY.name;
    await fetchCityWeather(savedCity, message);
  };

  useEffect(() => {
    const locationUnavailable = !window.isSecureContext || !("geolocation" in navigator);
    if (locationUnavailable) {
      void loadFallbackWeather('当前访问方式不能定位，已显示城市天气');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await fetchWeather(latitude, longitude, '当前位置');
          setNotice('');
        } catch (err) {
          await loadFallbackWeather('定位天气失败，已显示城市天气');
        } finally {
          setLoading(false);
        }
      },
      () => {
        void loadFallbackWeather('没有位置权限，已显示城市天气');
      }
    );
  }, []);

  const handleCitySubmit = (event: FormEvent) => {
    event.preventDefault();
    fetchCityWeather(cityInput);
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-11 h-11 text-amber-400 fill-amber-400" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-11 h-11 text-gray-400 fill-gray-200" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-11 h-11 text-blue-400 fill-blue-400" />;
    if (code >= 71 && code <= 82) return <CloudSnow className="w-11 h-11 text-sky-200 fill-sky-200" />;
    if (code >= 95) return <CloudLightning className="w-11 h-11 text-purple-400 fill-purple-400" />;
    return <Sun className="w-11 h-11 text-amber-400" />;
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
      className="bg-white rounded-[1.75rem] p-5 border-2 border-primary-100 cute-shadow sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌤️</span>
          <h2 className="text-sm font-bold text-primary-600">今日头顶的天空</h2>
        </div>
        {weather && (
          <div className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-primary-400" />
            <span className="max-w-20 truncate">{weather.place}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-5">
          <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-2" />
          <p className="text-xs text-gray-400">正在看天...</p>
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-primary-50 px-4 py-3 text-center text-sm font-medium text-gray-600">{error}</p>
      ) : weather ? (
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-black text-gray-700 font-sans">
              {weather.temp}<span className="text-xl font-normal">°C</span>
            </div>
            <p className="text-sm text-gray-400 mt-1 font-medium">{getWeatherText(weather.code)}</p>
            {notice && <p className="mt-2 text-xs font-medium text-primary-600">{notice}</p>}
          </div>
          <div className="animate-pulse drop-shadow-md">
            {getWeatherIcon(weather.code)}
          </div>
        </div>
      ) : null}

      <form onSubmit={handleCitySubmit} className="mt-4 flex items-center gap-2">
        <input
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
          placeholder="输入城市"
          className="min-w-0 flex-1 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-primary-300 focus:bg-white"
        />
        <button
          type="submit"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-400 text-white shadow-sm transition active:scale-95"
          aria-label="查询城市天气"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
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
    <div className="space-y-4 px-4 pb-4 pt-safe sm:space-y-5 md:p-6">
      <header className="px-1 pb-1 pt-4">
        <h1 className="mb-1 text-3xl font-black leading-tight text-primary-400">Judy's Space ✨</h1>
        <p className="text-sm font-medium text-gray-500">{getGreeting()}</p>
      </header>

      <AnniversaryCard />
      <WeatherCard />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-[1.5rem] border border-dashed border-primary-100 bg-white/70 p-4"
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
