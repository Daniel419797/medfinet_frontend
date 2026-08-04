export const issueTxn = async (walletAddress: string, vaccineId: string) => {
  const res = await fetch('http://localhost:4006/vaccine/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, vaccineId }),
  });
  const data = await res.json();
  return data.txn_b64;
};

export const submitSignedTxn = async (signedTxn: Uint8Array) => {
  const res = await fetch('http://localhost:4006/vaccine/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signedTxn: Buffer.from(signedTxn).toString('base64'),
    }),
  });
  return await res.json(); // returns { txId }
};
