export function JFILogo({ size = 'md', showTagline = true }) {
  const scales = { sm: 0.6, md: 1, lg: 1.4 }
  const s = scales[size] || 1

  return (
    <div className="flex flex-col items-center select-none">
      <div className="flex items-end gap-3">
        {/* Growth mark */}
        <svg
          width={Math.round(68 * s)}
          height={Math.round(72 * s)}
          viewBox="0 0 68 72"
          fill="none"
        >
          {/* Rising bars */}
          <rect x="0"  y="38" width="14" height="24" rx="3" fill="#10b981" opacity="0.35"/>
          <rect x="18" y="24" width="14" height="38" rx="3" fill="#10b981" opacity="0.65"/>
          <rect x="36" y="8"  width="14" height="54" rx="3" fill="#10b981"/>
          {/* Arrow on top of tallest bar */}
          <polyline
            points="43,4 43,0 51,0"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="43" y1="0"
            x2="56" y2="13"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Wordmark */}
        <div className="flex flex-col pb-1">
          <span
            style={{
              fontSize:      Math.round(38 * s),
              fontWeight:    800,
              letterSpacing: '-2px',
              lineHeight:    1,
              color:         '#f1f5f9',
              fontFamily:    'system-ui, sans-serif'
            }}
          >
            JFI
          </span>
          <span
            style={{
              fontSize:      Math.round(8 * s),
              fontWeight:    400,
              letterSpacing: '3px',
              color:         '#475569',
              fontFamily:    'system-ui, sans-serif',
              marginTop:     2
            }}
          >
            FLEET INVESTMENT
          </span>
        </div>
      </div>

      {showTagline && (
        <span
          style={{
            fontSize:      Math.round(9 * s),
            letterSpacing: '3px',
            color:         '#334155',
            fontFamily:    'system-ui, sans-serif',
            marginTop:     Math.round(6 * s)
          }}
        >
          INVEST · TRACK · EARN
        </span>
      )}
    </div>
  )
}