async function run() {
  console.log('Downloading dataset...');
  const fetchRes = await fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json');
  const data = await fetchRes.json();
  
  console.log('Total items: ' + data.length);
  
  const chunkSize = 100;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    console.log('Sending chunk ' + i + ' to ' + (i + chunk.length) + '...');
    
    // Retry logic loop
    for(let retry=0; retry<5; retry++) {
        const reqRes = await fetch('https://gestione-baie.vercel.app/api/territory_ingest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chunk)
        });
        
        const text = await reqRes.text();
        console.log('Response: ' + text);
        if(text.includes('NOT_FOUND') || text.includes('FUNCTION_INVOCATION_FAILED') || text.includes('error')) {
            console.log("Retry in 3s...");
            await new Promise(r => setTimeout(r, 3000));
        } else {
            break;
        }
    }
  }
  console.log('Done!');
}
run();
