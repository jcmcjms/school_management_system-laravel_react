import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="40" rx="6" fill="#6366f1" />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="sans-serif"
                fontWeight="bold"
                fontSize="18"
                fill="white"
                letterSpacing="2"
            >
                SMS
            </text>
        </svg>
    );
}
