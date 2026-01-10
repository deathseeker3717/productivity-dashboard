/**
 * WeatherCard.jsx - Dynamic Weather Widget
 * 
 * Live weather data with context-aware visuals.
 * Updates automatically, changes appearance based on conditions.
 * 
 * Safety features:
 * - AbortController for fetch cancellation
 * - Mount state tracking
 * - Graceful fallback on errors
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './WeatherCard.css';

// Weather condition to theme mapping
const getWeatherTheme = (condition, isNight) => {
    const themes = {
        clear: {
            gradient: isNight
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%)',
            accent: isNight ? '#ffd700' : '#FFD93D',
            icon: isNight ? 'moon' : 'sun'
        },
        clouds: {
            gradient: 'linear-gradient(135deg, #E8EEF2 0%, #C5D5E4 100%)',
            accent: '#8BA4B4',
            icon: 'clouds'
        },
        rain: {
            gradient: 'linear-gradient(135deg, #FFF9E6 0%, #E8F4E5 100%)',
            accent: '#6B8E7B',
            icon: 'rain'
        },
        drizzle: {
            gradient: 'linear-gradient(135deg, #F0F4F8 0%, #D9E4EC 100%)',
            accent: '#7BA3C4',
            icon: 'drizzle'
        },
        thunderstorm: {
            gradient: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)',
            accent: '#F6E05E',
            icon: 'storm'
        },
        snow: {
            gradient: 'linear-gradient(135deg, #EDF2F7 0%, #E2E8F0 100%)',
            accent: '#90CDF4',
            icon: 'snow'
        },
        mist: {
            gradient: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
            accent: '#A0AEC0',
            icon: 'mist'
        },
        default: {
            gradient: 'linear-gradient(135deg, #FFF9E6 0%, #E8F4E5 100%)',
            accent: '#6B8E7B',
            icon: 'clouds'
        }
    };

    const key = condition?.toLowerCase() || 'default';
    return themes[key] || themes.default;
};

// Weather Icons as SVG components
const WeatherIcons = {
    sun: () => (
        <svg viewBox="0 0 64 64" className="weather-icon sun-icon">
            <circle cx="32" cy="32" r="14" fill="#FFD93D" />
            <g stroke="#FFD93D" strokeWidth="3" strokeLinecap="round">
                <line x1="32" y1="6" x2="32" y2="14" />
                <line x1="32" y1="50" x2="32" y2="58" />
                <line x1="6" y1="32" x2="14" y2="32" />
                <line x1="50" y1="32" x2="58" y2="32" />
                <line x1="13.5" y1="13.5" x2="19" y2="19" />
                <line x1="45" y1="45" x2="50.5" y2="50.5" />
                <line x1="13.5" y1="50.5" x2="19" y2="45" />
                <line x1="45" y1="19" x2="50.5" y2="13.5" />
            </g>
        </svg>
    ),
    moon: () => (
        <svg viewBox="0 0 64 64" className="weather-icon moon-icon">
            <path d="M40 12c-12 0-22 10-22 22s10 22 22 22c2 0 4-0.3 6-0.8-4-4-6-10-6-16 0-12 8-20 16-24-4-2-9-3.2-16-3.2z" fill="#ffd700" />
        </svg>
    ),
    clouds: () => (
        <svg viewBox="0 0 64 64" className="weather-icon cloud-icon">
            <ellipse cx="28" cy="36" rx="16" ry="10" fill="#B0C4D4" />
            <ellipse cx="42" cy="38" rx="14" ry="9" fill="#C5D5E4" />
            <ellipse cx="35" cy="32" rx="12" ry="8" fill="#D4E4EC" />
        </svg>
    ),
    rain: () => (
        <svg viewBox="0 0 64 64" className="weather-icon rain-icon">
            <ellipse cx="28" cy="26" rx="14" ry="9" fill="#B0C4D4" />
            <ellipse cx="40" cy="28" rx="12" ry="8" fill="#C5D5E4" />
            <g stroke="#6B8E7B" strokeWidth="2" strokeLinecap="round" className="raindrops">
                <line x1="22" y1="40" x2="20" y2="50" />
                <line x1="32" y1="42" x2="30" y2="52" />
                <line x1="42" y1="40" x2="40" y2="50" />
            </g>
        </svg>
    ),
    drizzle: () => (
        <svg viewBox="0 0 64 64" className="weather-icon drizzle-icon">
            <ellipse cx="30" cy="28" rx="14" ry="9" fill="#C5D5E4" />
            <ellipse cx="40" cy="30" rx="10" ry="7" fill="#D4E4EC" />
            <g stroke="#7BA3C4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3">
                <line x1="24" y1="42" x2="22" y2="50" />
                <line x1="34" y1="44" x2="32" y2="52" />
                <line x1="44" y1="42" x2="42" y2="50" />
            </g>
        </svg>
    ),
    storm: () => (
        <svg viewBox="0 0 64 64" className="weather-icon storm-icon">
            <ellipse cx="28" cy="22" rx="14" ry="9" fill="#4A5568" />
            <ellipse cx="40" cy="24" rx="12" ry="8" fill="#2D3748" />
            <polygon points="32,30 28,42 34,42 30,54 40,38 34,38 38,30" fill="#F6E05E" />
        </svg>
    ),
    snow: () => (
        <svg viewBox="0 0 64 64" className="weather-icon snow-icon">
            <ellipse cx="30" cy="26" rx="14" ry="9" fill="#CBD5E0" />
            <ellipse cx="40" cy="28" rx="10" ry="7" fill="#E2E8F0" />
            <g fill="#90CDF4">
                <circle cx="22" cy="44" r="2" />
                <circle cx="32" cy="48" r="2" />
                <circle cx="42" cy="44" r="2" />
                <circle cx="27" cy="52" r="1.5" />
                <circle cx="37" cy="54" r="1.5" />
            </g>
        </svg>
    ),
    mist: () => (
        <svg viewBox="0 0 64 64" className="weather-icon mist-icon">
            <g stroke="#A0AEC0" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="28" x2="52" y2="28" opacity="0.6" />
                <line x1="16" y1="36" x2="48" y2="36" opacity="0.8" />
                <line x1="12" y1="44" x2="52" y2="44" opacity="0.5" />
            </g>
        </svg>
    )
};

// Calculate moon phase (0-7: new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent)
const getMoonPhase = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Simplified moon phase calculation (Conway's method)
    let r = year % 100;
    r %= 19;
    if (r > 9) r -= 19;
    r = ((r * 11) % 30) + month + day;
    if (month < 3) r += 2;
    r -= ((year < 2000) ? 4 : 8.3);
    r = Math.floor(r + 0.5) % 30;
    if (r < 0) r += 30;

    // Convert to 0-7 phase index
    return Math.floor(r / 3.75);
};

// Moon Phase SVG Component
const MoonPhaseSVG = ({ phase }) => {
    // Phase 0 = new moon, 4 = full moon
    const phases = [
        { name: 'New Moon', fill: '#2d3748', shadow: 0 },
        { name: 'Waxing Crescent', fill: '#f7fafc', shadowDir: 'right', shadow: 0.75 },
        { name: 'First Quarter', fill: '#f7fafc', shadowDir: 'right', shadow: 0.5 },
        { name: 'Waxing Gibbous', fill: '#f7fafc', shadowDir: 'right', shadow: 0.25 },
        { name: 'Full Moon', fill: '#f7fafc', shadow: 0 },
        { name: 'Waning Gibbous', fill: '#f7fafc', shadowDir: 'left', shadow: 0.25 },
        { name: 'Last Quarter', fill: '#f7fafc', shadowDir: 'left', shadow: 0.5 },
        { name: 'Waning Crescent', fill: '#f7fafc', shadowDir: 'left', shadow: 0.75 }
    ];

    const current = phases[phase] || phases[4];
    const isNew = phase === 0;
    const isFull = phase === 4;

    return (
        <svg className="moon-phase-svg" viewBox="0 0 50 50" width="40" height="40">
            <defs>
                <radialGradient id="moonGlow">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <clipPath id="moonClip">
                    <circle cx="25" cy="25" r="18" />
                </clipPath>
            </defs>

            {/* Glow effect */}
            {!isNew && (
                <circle cx="25" cy="25" r="24" fill="url(#moonGlow)" />
            )}

            {/* Moon base */}
            <circle cx="25" cy="25" r="18" fill={isNew ? '#1a1a2e' : '#e8e8e8'} stroke={isNew ? '#3d3d5c' : 'none'} strokeWidth="1" />

            {/* Shadow for phases (using ellipse to create crescent effect) */}
            {!isNew && !isFull && current.shadow > 0 && (
                <ellipse
                    cx={current.shadowDir === 'right' ? 25 + (18 * (1 - current.shadow)) : 25 - (18 * (1 - current.shadow))}
                    cy="25"
                    rx={18 * current.shadow}
                    ry="18"
                    fill="#1a1a2e"
                    clipPath="url(#moonClip)"
                />
            )}

            {/* Moon craters for texture (only on lit parts) */}
            {!isNew && (
                <g opacity="0.15" clipPath="url(#moonClip)">
                    <circle cx="20" cy="20" r="3" fill="#87878733" />
                    <circle cx="30" cy="28" r="4" fill="#87878733" />
                    <circle cx="18" cy="32" r="2" fill="#87878733" />
                    <circle cx="28" cy="18" r="2.5" fill="#87878733" />
                </g>
            )}
        </svg>
    );
};

// Enhanced Background Scene with dynamic weather effects
const BackgroundScene = ({ condition, isNight }) => {
    const [shootingStarActive, setShootingStarActive] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Trigger shooting star every 5 minutes
    useEffect(() => {
        if (!isNight) return;

        const triggerShootingStar = () => {
            if (isMountedRef.current) {
                setShootingStarActive(true);
                setTimeout(() => {
                    if (isMountedRef.current) {
                        setShootingStarActive(false);
                    }
                }, 700);
            }
        };

        const initialTimeout = setTimeout(triggerShootingStar, 10000);
        const interval = setInterval(triggerShootingStar, 300000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [isNight]);

    return (
        <div className={`weather-scene weather-bg-${condition || 'default'} ${isNight ? 'night' : 'day'}`}>
            {/* Sun rays for clear weather */}
            {condition === 'clear' && !isNight && (
                <div className="sun-rays">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="sun-ray" style={{
                            transform: `rotate(${i * 45}deg)`
                        }} />
                    ))}
                </div>
            )}

            {/* Stars for night - fixed positions */}
            {isNight && (
                <div className="stars-container">
                    <div className="star" style={{ left: '5%', top: '10%', animationDelay: '0s' }} />
                    <div className="star" style={{ left: '15%', top: '25%', animationDelay: '0.5s' }} />
                    <div className="star" style={{ left: '25%', top: '8%', animationDelay: '1s' }} />
                    <div className="star" style={{ left: '35%', top: '35%', animationDelay: '1.5s' }} />
                    <div className="star" style={{ left: '45%', top: '15%', animationDelay: '0.3s' }} />
                    <div className="star" style={{ left: '55%', top: '28%', animationDelay: '0.8s' }} />
                    <div className="star" style={{ left: '65%', top: '12%', animationDelay: '1.2s' }} />
                    <div className="star" style={{ left: '75%', top: '38%', animationDelay: '0.6s' }} />
                    <div className="star" style={{ left: '85%', top: '20%', animationDelay: '1.8s' }} />
                    <div className="star" style={{ left: '92%', top: '5%', animationDelay: '0.2s' }} />
                    <div className="star large" style={{ left: '20%', top: '18%', animationDelay: '2s' }} />
                    <div className="star large" style={{ left: '60%', top: '5%', animationDelay: '2.5s' }} />
                    <div className="star large" style={{ left: '80%', top: '30%', animationDelay: '1.7s' }} />

                    <div className={`shooting-star s1 ${shootingStarActive ? 'active' : ''}`} />
                    <div className={`shooting-star s2 ${shootingStarActive ? 'active' : ''}`} style={{ animationDelay: '0.2s' }} />

                    {/* Dynamic Moon Phase */}
                    {condition === 'clear' && (
                        <div className="moon-container">
                            <MoonPhaseSVG phase={getMoonPhase()} />
                        </div>
                    )}
                </div>
            )}

            {/* Clouds floating */}
            {(condition === 'clouds' || condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') && (
                <div className="floating-clouds">
                    <div className="float-cloud c1" />
                    <div className="float-cloud c2" />
                    <div className="float-cloud c3" />
                </div>
            )}

            {/* Rain overlay */}
            {(condition === 'rain' || condition === 'drizzle') && (
                <div className="rain-overlay">
                    {[...Array(condition === 'rain' ? 20 : 10)].map((_, i) => (
                        <div key={i} className={`raindrop ${condition === 'drizzle' ? 'light' : ''}`} style={{
                            left: `${5 + i * 5}%`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: `${0.6 + Math.random() * 0.4}s`
                        }} />
                    ))}
                </div>
            )}

            {/* Lightning flash for thunderstorm */}
            {condition === 'thunderstorm' && (
                <div className="lightning-container">
                    <div className="lightning-flash" />
                    <svg className="lightning-bolt" viewBox="0 0 40 60">
                        <polygon points="20,0 12,25 22,25 8,60 18,30 10,30" fill="#FFE066" />
                    </svg>
                </div>
            )}

            {/* Snow particles */}
            {condition === 'snow' && (
                <div className="snow-overlay">
                    {[...Array(25)].map((_, i) => (
                        <div key={i} className={`snowflake ${i % 3 === 0 ? 'large' : ''}`} style={{
                            left: `${4 + i * 4}%`,
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: `${2.5 + Math.random() * 2}s`
                        }} />
                    ))}
                </div>
            )}

            {/* Mist/Fog layers */}
            {condition === 'mist' && (
                <div className="mist-overlay">
                    <div className="mist-layer m1" />
                    <div className="mist-layer m2" />
                    <div className="mist-layer m3" />
                </div>
            )}

            {/* Rolling hills silhouette */}
            <svg className="scene-ground" viewBox="0 0 400 80" preserveAspectRatio="xMidYMax slice">
                <defs>
                    <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(120, 140, 160, 0.15)" />
                        <stop offset="100%" stopColor="rgba(100, 120, 140, 0.25)" />
                    </linearGradient>
                    <linearGradient id="hillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(90, 110, 130, 0.2)" />
                        <stop offset="100%" stopColor="rgba(70, 90, 110, 0.35)" />
                    </linearGradient>
                    <linearGradient id="hillGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(60, 80, 100, 0.3)" />
                        <stop offset="100%" stopColor="rgba(50, 70, 90, 0.5)" />
                    </linearGradient>
                </defs>
                <path d="M0 80 Q60 50 120 60 T240 45 T360 55 T400 50 L400 80 Z" fill="url(#hillGrad1)" />
                <path d="M0 80 Q100 55 180 65 T320 52 T400 62 L400 80 Z" fill="url(#hillGrad2)" />
                <path d="M0 80 Q50 68 120 72 T260 65 T400 75 L400 80 Z" fill="url(#hillGrad3)" />
            </svg>

            {/* Decorative umbrella for rain */}
            {condition === 'rain' && (
                <svg className="scene-umbrella" viewBox="0 0 40 50">
                    <path d="M20 5 Q5 15 5 25 L35 25 Q35 15 20 5 Z" fill="#E57373" />
                    <path d="M20 5 Q15 12 12 18" fill="none" stroke="#EF9A9A" strokeWidth="1" opacity="0.5" />
                    <line x1="20" y1="25" x2="20" y2="48" stroke="#8D6E63" strokeWidth="2" />
                    <path d="M20 48 Q15 50 18 52" fill="none" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
                </svg>
            )}
        </div>
    );
};

// Map Open-Meteo weather codes to conditions
const mapWeatherCode = (code) => {
    if (code === 0) return 'clear';
    if ([1, 2, 3].includes(code)) return 'clouds';
    if ([45, 48].includes(code)) return 'mist';
    if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if ([95, 96, 99].includes(code)) return 'thunderstorm';
    return 'clouds';
};

const getWeatherDescription = (code) => {
    const descriptions = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing Rime Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        56: 'Light Freezing Drizzle',
        57: 'Dense Freezing Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        66: 'Light Freezing Rain',
        67: 'Heavy Freezing Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Slight Hail',
        99: 'Thunderstorm with Heavy Hail'
    };
    return descriptions[code] || 'Unknown';
};

// Default fallback weather
const DEFAULT_WEATHER = {
    temp: 22,
    condition: 'clear',
    description: 'Clear Sky',
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    feelsLike: 21
};

const DEFAULT_LOCATION = { city: 'Your City', country: '' };

function WeatherCard() {
    // Use cached weather data from AppContext
    const { weatherData, weatherLoading } = useApp();

    const [isTransitioning, setIsTransitioning] = useState(false);

    // Derive display values from context data
    const weather = weatherData;
    const loading = weatherLoading;
    const location = weatherData?.location || DEFAULT_LOCATION;

    // Check if night time (6pm - 6am)
    const isNight = () => {
        const hour = new Date().getHours();
        return hour < 6 || hour >= 18;
    };

    const theme = weather ? getWeatherTheme(weather.condition, isNight()) : getWeatherTheme('default', false);
    const IconComponent = weather ? WeatherIcons[theme.icon] || WeatherIcons.clouds : WeatherIcons.clouds;

    if (loading) {
        return (
            <div className="weather-card loading">
                <div className="weather-skeleton">
                    <div className="skeleton-icon" />
                    <div className="skeleton-temp" />
                    <div className="skeleton-stats" />
                </div>
            </div>
        );
    }


    return (
        <div
            className={`weather-card ${isTransitioning ? 'transitioning' : ''}`}
            style={{ background: theme.gradient }}
        >
            <BackgroundScene condition={weather?.condition} isNight={isNight()} />

            <div className="weather-content">
                {/* City name at top */}
                <div className="weather-city-label">
                    {location.city || 'Your City'}
                </div>

                {/* Top section: Icon + Condition */}
                <div className="weather-header">
                    <div className="weather-icon-wrapper">
                        <IconComponent />
                    </div>
                    <span className="weather-condition">{weather?.description || 'Unknown'}</span>
                </div>

                {/* Temperature */}
                <div className="weather-temp">
                    <span className="temp-value">{weather?.temp ?? '--'}</span>
                    <span className="temp-unit">°C</span>
                </div>

                {/* Stats Row */}
                <div className="weather-stats">
                    <div className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                        </svg>
                        <span className="stat-value">{weather?.windSpeed ?? '--'}</span>
                        <span className="stat-label">km/h</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="12" x2="16" y2="12" />
                        </svg>
                        <span className="stat-value">{weather?.pressure ?? '--'}</span>
                        <span className="stat-label">hPa</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                        <span className="stat-value">{weather?.humidity ?? '--'}</span>
                        <span className="stat-label">%</span>
                    </div>
                </div>
            </div>

            {/* Hover overlay */}
            <div className="weather-hover-overlay">
                <span>View Details</span>
            </div>
        </div>
    );
}

export default WeatherCard;
