"use client";

import { useId } from "react";

interface LogoProps {
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ color = "currentColor", width = 88, height = 27, className }: LogoProps) {
  const uid = useId().replace(/:/g, "");
  const m0 = `ns0-${uid}`;
  const m1 = `ns1-${uid}`;
  const m2 = `ns2-${uid}`;
  const m3 = `ns3-${uid}`;

  return (
    <svg width={width} height={height} aria-label="Revilo" role="img" viewBox="0 0 169 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <mask id={m0} style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="23" height="52">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 0H22.1756V51.696H0V0Z" fill="white" />
      </mask>
      <g mask={`url(#${m0})`}>
        <path fillRule="evenodd" clipRule="evenodd" d="M21.456 21.5995V8.85651C21.456 2.95251 18.816 -0.000488281 13.536 -0.000488281H0V51.6965H6.912V33.9985V30.8165V24.9125V23.0415V6.26351H11.448C13.512 6.26351 14.544 7.51251 14.544 10.0075V20.3905V21.1675V24.9125H11.448H9.819L11.602 33.1785L15.624 51.6965H22.176L17.352 30.1675C20.088 28.9685 21.456 26.1125 21.456 21.5995Z" fill={color} />
      </g>
      <mask id={m1} style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="34" y="0" width="18" height="52">
        <path fillRule="evenodd" clipRule="evenodd" d="M34.4141 0.000244141H51.5501V51.696H34.4141V0.000244141Z" fill="white" />
      </mask>
      <g mask={`url(#${m1})`}>
        <path fillRule="evenodd" clipRule="evenodd" d="M34.4141 51.6962H51.5501V45.4312H41.3261V28.2232H50.3981V21.9602H41.3261V6.26324H51.5501V0.000244141H34.4141V51.6962Z" fill={color} />
      </g>
      <mask id={m2} style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="61" y="0" width="26" height="52">
        <path fillRule="evenodd" clipRule="evenodd" d="M61.1953 0H86.1073V51.6959H61.1953V0Z" fill="white" />
      </mask>
      <g mask={`url(#${m2})`}>
        <path fillRule="evenodd" clipRule="evenodd" d="M73.6513 39.456L68.0353 0H61.1953L69.5473 51.696H77.7553L86.1073 0H79.2673L73.6513 39.456Z" fill={color} />
      </g>
      <mask id={m3} style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="169" height="52">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 51.696H168.262V0H0V51.696Z" fill="white" />
      </mask>
      <g mask={`url(#${m3})`}>
        <path fillRule="evenodd" clipRule="evenodd" d="M97.2734 51.696H104.185V0H97.2734V51.696Z" fill={color} />
        <path fillRule="evenodd" clipRule="evenodd" d="M124.771 0H117.859V51.696H134.275V45.432H124.771V0Z" fill={color} />
        <path fillRule="evenodd" clipRule="evenodd" d="M161.348 42.412C161.348 44.422 160.438 45.432 158.608 45.432H155.078C153.018 45.432 151.989 44.422 151.989 42.412V9.29195C151.989 7.27195 152.998 6.26195 155.008 6.26195H158.248C160.308 6.26195 161.348 7.27195 161.348 9.29195V42.412ZM159.978 0.00195312H153.358C147.838 0.00195312 145.078 2.95195 145.078 8.85095V42.912C145.078 48.771 147.858 51.691 153.428 51.691H159.909C165.478 51.691 168.258 48.771 168.258 42.912V8.85095C168.258 2.95195 165.498 0.00195312 159.978 0.00195312Z" fill={color} />
      </g>
    </svg>
  );
}
