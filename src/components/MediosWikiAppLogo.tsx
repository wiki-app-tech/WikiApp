export default function MediosWikiAppLogo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Fondo con gradiente Aqua */}
            <defs>
                <linearGradient id="logoAquaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Círculo de fondo */}
            <circle cx="32" cy="32" r="30" fill="url(#logoAquaGradient)" filter="url(#logoGlow)" />

            {/* Icono de megáfono/comunicación */}
            <g transform="translate(16, 16)">
                {/* Megáfono */}
                <path
                    d="M8 6L24 2V30L8 26V6Z"
                    fill="white"
                    opacity="0.9"
                />
                <path
                    d="M8 10L2 12V20L8 22"
                    fill="white"
                    opacity="0.9"
                />
                {/* Ondas de sonido */}
                <path
                    d="M28 8C30 10 30 14 30 16C30 18 30 22 28 24"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                />
                <path
                    d="M32 6C34 9 34 13 34 16C34 19 34 23 32 26"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                />
            </g>
        </svg>
    );
}
