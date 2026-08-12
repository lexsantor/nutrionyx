/**
 * Hand-drawn anatomical silhouette (front/back) on a 200x420 canvas, used by
 * the landing hero teaser. The interactive body map uses the mannequin
 * renders instead (public/mannequin-*.png). Server-safe (pure SVG); subtle
 * vertical gradient + faint definition lines; theme-aware via currentColor.
 */
const GRADIENT_ID = "body-silhouette-grad";

export function BodySilhouette({ view }: { view: "front" | "back" }) {
  const gradientId = GRADIENT_ID;
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>
        {/* head + neck */}
        <ellipse cx="100" cy="28" rx="14.5" ry="17.5" />
        <path d="M92 42 C 92 50 92 54 90 58 C 96 61 104 61 110 58 C 108 54 108 50 108 42 C 103 46 97 46 92 42 Z" />
        {/* torso: trapezius, deltoids, chest, waist taper, hips */}
        <path d="M90 58
          C 78 60 68 63 60 68
          C 53 73 49 80 48 90
          C 47 98 49 104 51 112
          C 55 128 60 140 63 152
          C 65 164 62 178 58 192
          C 56 202 56 212 60 222
          C 66 232 80 237 100 238
          C 120 237 134 232 140 222
          C 144 212 144 202 142 192
          C 138 178 135 164 137 152
          C 140 140 145 128 149 112
          C 151 104 153 98 152 90
          C 151 80 147 73 140 68
          C 132 63 122 60 110 58
          C 106 62 94 62 90 58 Z" />
        {/* left arm: deltoid, biceps (band y=122), elbow, forearm, hand */}
        <path d="M48 90
          C 42 98 38 108 35 120
          C 33 130 33 142 34 154
          C 35 168 35 182 36 196
          C 36 210 37 224 39 236
          C 40 244 42 252 45 256
          C 49 259 53 257 53 252
          C 52 240 51 226 51 212
          C 51 198 51 184 52 170
          C 53 156 54 142 54 130
          C 54 116 53 102 51 94 Z" />
        {/* right arm (mirror) */}
        <path d="M152 90
          C 158 98 162 108 165 120
          C 167 130 167 142 166 154
          C 165 168 165 182 164 196
          C 164 210 163 224 161 236
          C 160 244 158 252 155 256
          C 151 259 147 257 147 252
          C 148 240 149 226 149 212
          C 149 198 149 184 148 170
          C 147 156 146 142 146 130
          C 146 116 147 102 149 94 Z" />
        {/* left leg: quad, knee, calf (band y=344), ankle, foot */}
        <path d="M62 224
          C 60 244 62 262 66 280
          C 69 294 71 306 72 318
          C 72 330 73 344 75 356
          C 77 372 78 386 78 398
          C 78 404 80 408 85 408
          C 92 408 95 405 95 399
          C 95 386 95 370 95 356
          C 95 342 96 328 96 314
          C 97 298 98 282 98 266
          C 98 252 98 242 97 236 Z" />
        {/* right leg (mirror) */}
        <path d="M138 224
          C 140 244 138 262 134 280
          C 131 294 129 306 128 318
          C 128 330 127 344 125 356
          C 123 372 122 386 122 398
          C 122 404 120 408 115 408
          C 108 408 105 405 105 399
          C 105 386 105 370 105 356
          C 105 342 104 328 104 314
          C 103 298 102 282 102 266
          C 102 252 102 242 103 236 Z" />
      </g>
      {/* definition lines */}
      <g
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {view === "front" ? (
          <>
            {/* clavicles, pectoral line, linea alba, knees */}
            <path d="M78 74 C 88 78 112 78 122 74" />
            <path d="M68 108 C 80 116 96 118 100 118 C 104 118 120 116 132 108" />
            <path d="M100 122 v96" />
            <path d="M74 292 c 4 3 10 3 14 0 M112 292 c 4 3 10 3 14 0" />
          </>
        ) : (
          <>
            {/* spine, shoulder blades, glute fold (band y=208), knee folds */}
            <path d="M100 62 v152" />
            <path d="M74 84 C 80 96 82 106 80 116 M126 84 C 120 96 118 106 120 116" />
            <path d="M64 218 C 76 228 92 230 100 226 M136 218 C 124 228 108 230 100 226" />
            <path d="M74 296 c 4 -3 10 -3 14 0 M112 296 c 4 -3 10 -3 14 0" />
          </>
        )}
      </g>
    </g>
  );
}
