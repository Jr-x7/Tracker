import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button
                onClick={scrollToTop}
                className="p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg hover:shadow-cyan-500/40 transition-all transform hover:scale-110"
                title="Back to Top"
            >
                <ArrowUp className="w-6 h-6" />
            </button>
        </div>
    );
}
