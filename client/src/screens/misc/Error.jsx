import React from 'react';

function Error() {
    return (
        <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center px-3"
             style={{
                 background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                 fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
             }}>

            <div className="mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </div>

            {/* Error message */}
            <h2 className="text-white fw-bold mb-3"
                style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                Qualcosa è andato storto
            </h2>

            <p className="text-white mb-4 opacity-75"
               style={{
                   fontSize: 'clamp(1rem, 3vw, 1.1rem)',
                   maxWidth: '400px'
               }}>
                Ti preghiamo di riprovare più tardi
            </p>

            {/* Home button */}
            <button
                className="btn btn-light btn-lg px-4 py-2 fw-semibold shadow"
                style={{
                    borderRadius: '25px',
                    minWidth: '120px',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                onClick={() => window.location.href = '/'}
            >
                Home
            </button>
        </div>
    );
}

export default Error;