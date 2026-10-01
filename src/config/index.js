const path = require('path');
const fs = require('fs');

const YT_COOKIES_TEXT = `__Secure-YNID=22.YT=r58GsOmsXze4lDZQRPWMtlWDwZnr9Ezmf-n08YILW_L6XY57fetYR7PwIs4IZlaivpuWbgoTh1GNM1ganJtOsiDJ6T1McsmO0CHzGMJEEJihApXELnEFUPC9ec1xZFGt9lmU9m0Ga1lKaDyvLS7UIJ-4YJvA2c6Z3D6zZXvZdL22dFyVrV-76Yv3XcLY165ZwkGgQ8oiocGIqXmgr8rIghhWUIW-5M76jaD7RvXvQjX_DMD9O4ZSiDuZqxa5fCsByqJBEYUG_-jqtLYNak_GoJTO1dNqvnB5knpbQYbg-JYZLi2ykEDYtt25oxUXtTUA3oDTQunL4Runo0OorGAVeA; VISITOR_INFO1_LIVE=BxKm35EsG5Q; PREF=f4=4000000&f6=40000000&tz=America.El_Salvador;`;

const cookiesPath = path.join(__dirname, '../../cookies.txt');

if (!fs.existsSync(cookiesPath)) {
  fs.writeFileSync(cookiesPath, YT_COOKIES_TEXT, 'utf-8');
}

module.exports = {
  PORT: process.env.PORT || 3000,
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://ajbmpgnzkgtcmulocftd.supabase.co',
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYm1wZ256a2d0Y211bG9jZnRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM0NTYyOSwiZXhwIjoyMTA1OTIxNjI5fQ.JIw6EUefVcnQ7-P8-lRg__bAhEJvjcQYGFfaXpk9Vik',
  COOKIES_PATH: cookiesPath,
  TARGET_ARTISTS: ['Laufey', "Her's", 'Grupo Frontera', 'Eve', 'Bad Bunny', 'Cuarteto de Nos', 'Depresión Sonora']
};
