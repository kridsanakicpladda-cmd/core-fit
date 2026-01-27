@echo off
echo Deploying parse-resume Edge Function...
npx supabase functions deploy parse-resume --no-verify-jwt
echo.
echo Done! Please check the logs in Supabase Dashboard.
pause
