export const saveAction = async (action: string, payload: any) => {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server Error: ${res.status} ${errorText}`);
    }
    
    return await res.json();
  } catch (err) {
    console.error(`Errore invio azione ${action} al DB:`, err);
    throw err;
  }
};
