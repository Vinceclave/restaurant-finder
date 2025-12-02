## SETUP Instructions on running it local setup
1. Download Zip Folder or Cloning it using git bash 
    - if using git bash use this "git clone https://github.com/Vinceclave/restaurant-finder"
2. Open the repo folder and npm 'install' / 'i' or yarn 'install' / 'i'
3. After initial set up of the repo create an .env file and paste the API Keys below:
    1. PORT=3000
    2. AI_KEY=AIzaSyCmXdtEp3mor0CKkKiSj3I5a_O_R8rl9Dk
    3. AI_MODEL=gemini-2.5-flash
    4. FOURSQUARE_API_KEY=IRNR5LT15NEIXYVSS1Q4O341SE3PZADZUOZGN0BRGJI3E2CM
4. Once your done doing that run the code "npm run dev"
5. Finally, if it's already running you can try it navigating through POSTMAN or in Web use this as an example:
    - If using Postman or thunderclient set the the method to 'GET' then paste the url I provide the run.   
        'http://localhost:3000/api/execute?message=Find%20me%20a%20cheap%20sushi%20restaurant%20in%20downtown%20Los%20Angeles%20that's%20open%20now%20and%20has%20at%20least%20a%204-star%20rating&code=pioneerdevai'
    - If using Web paste the url I provide and when trying to try another query try configuring through parameter in url.
