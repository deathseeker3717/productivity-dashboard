/**
 * WeatherCard.jsx - Dynamic Premium Weather Widget
 * 
 * Live weather data with context-aware visuals.
 * Powered by Framer Motion for smooth transitions.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import './WeatherCard.css';

// ==========================================
// SUB-COMPONENTS (Visual Elements)
// ==========================================

const Stars = () => (
    <div className="stars-container">
        {[...Array(12)].map((_, i) => (
            <motion.div
                key={i}
                className="star"
                initial={{ opacity: 0.2, scale: 0.8 }}
                animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                }}
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                }}
            />
        ))}
    </div>
);

const Rain = ({ intensity = 'normal' }) => (
    <div className="rain-overlay">
        {[...Array(intensity === 'light' ? 15 : 30)].map((_, i) => (
            <motion.div
                key={i}
                className="raindrop"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 300, opacity: [0, 1, 0] }}
                transition={{
                    duration: 0.8 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 1
                }}
                style={{
                    left: `${Math.random() * 100}%`,
                    height: 10 + Math.random() * 10,
                    opacity: 0.6
                }}
            />
        ))}
    </div>
);

const Snow = () => (
    <div className="snow-overlay">
        {[...Array(25)].map((_, i) => (
            <motion.div
                key={i}
                className="snowflake"
                initial={{ y: -20, rotate: 0, opacity: 0 }}
                animate={{
                    y: 300,
                    rotate: 360,
                    opacity: [0, 0.8, 0],
                    x: [0, Math.random() * 40 - 20, 0] // sway
                }}
                transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 2
                }}
                style={{
                    left: `${Math.random() * 100}%`,
                    width: 4 + Math.random() * 4,
                    height: 4 + Math.random() * 4,
                }}
            />
        ))}
    </div>
);

const Clouds = () => (
    <div className="floating-clouds">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className={`float-cloud c${i + 1}`}
                animate={{ x: [0, 20, 0], y: [0, -5, 0] }}
                transition={{
                    duration: 10 + i * 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        ))}
    </div>
);

const Sun = () => (
    <motion.div
        className="sun-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 360 }}
        transition={{ duration: 1, opacity: { duration: 0.5 }, rotate: { duration: 60, repeat: Infinity, ease: "linear" } }}
    >
        <div className="sun-rays">
            <div className="sun-disk" />
            {[...Array(8)].map((_, i) => (
                <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
            ))}
        </div>
    </motion.div>
);

const BackgroundScene = ({ condition, isNight, timePeriod }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${condition}-${timePeriod}`}
                className={`weather-scene weather-bg-${condition} ${timePeriod}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Celestial Bodies */}
                {condition === 'clear' && !isNight && timePeriod !== 'dusk' && <Sun />}
                {(isNight || timePeriod === 'dusk') && <Stars />}

                {/* Weather Particles */}
                {(condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') && (
                    <Rain intensity={condition === 'drizzle' ? 'light' : 'normal'} />
                )}
                {condition === 'snow' && <Snow />}
                {(condition === 'clouds' || condition === 'mist') && <Clouds />}

                {/* Ground Silhouette */}
                <svg className="scene-ground" viewBox="0 0 400 80" preserveAspectRatio="xMidYMax slice">
                    <defs>
                        <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
                        </linearGradient>
                    </defs>
                    <path d="M0 80 Q60 50 120 60 T240 45 T360 55 T400 50 L400 80 Z" fill="url(#hillGrad1)" />
                </svg>
            </motion.div>
        </AnimatePresence>
    );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

function WeatherCard() {
    const { weatherData, weatherLoading } = useApp();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Derived State
    const weather = weatherData || {};
    const condition = weather.condition || 'clear'; // Already mapped by AppContext
    const isDay = weather.isDay !== undefined ? weather.isDay : true; // Default to day

    // Time Period Logic (Visuals)
    const getTimePeriod = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 7) return 'dawn';
        if (hour >= 17 && hour < 20) return 'dusk';
        return isDay ? 'day' : 'night';
    };

    // Override time period if API says night but local time says day (and vice versa) for accuracy or rely on visual cues?
    // Let's rely on API isDay for major switch, but local time for dawn/dusk flavor
    const timePeriod = isDay ? (getTimePeriod() === 'night' ? 'day' : getTimePeriod()) : 'night';

    // Skeleton Loader
    if (!hasMounted || weatherLoading) {
        return (
            <div className="weather-card loading">
                <div className="weather-skeleton">
                    <motion.div
                        className="skeleton-icon"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                        className="skeleton-temp"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                        className="skeleton-stats"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="weather-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)" }}
        >
            <BackgroundScene
                condition={weather.condition || 'clear'}
                isNight={!isDay}
                timePeriod={timePeriod}
            />

            <div className="weather-content">
                {/* Location */}
                <motion.div
                    className="weather-city-label"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {weather.location?.city || 'Unknown Location'}
                </motion.div>

                {/* Header */}
                <div className="weather-header">
                    {/* Icon would go here if we had SVGs passed as props or imported. 
                         The background scene handles most visuals now. */}
                    <motion.span
                        className="weather-condition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {weather.description || 'Clear Sky'}
                    </motion.span>
                </div>

                {/* Temperature */}
                <div className="weather-temp">
                    <motion.span
                        className="temp-value"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                    >
                        {weather.temp ?? '--'}
                    </motion.span>
                    <span className="temp-unit">°C</span>
                </div>

                {/* Stats */}
                <motion.div
                    className="weather-stats"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="stat-item">
                        <span className="stat-label">Wind</span>
                        <span className="stat-value">{weather.windSpeed ?? 0} km/h</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-label">Humidity</span>
                        <span className="stat-value">{weather.humidity ?? 0}%</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default WeatherCard;
