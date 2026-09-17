import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('site-theme');
        if (savedTheme) return savedTheme;
        return 'light'; // Default to light
    });

    useEffect(() => {
        // Mark that JS is available so CSS can enable entrance animations
        document.body.classList.add('js-enabled');
        return () => {
            document.body.classList.remove('js-enabled');
        };
    }, []);

    useEffect(() => {
        // Apply theme attribute to body so CSS variables switch palettes
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('site-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
