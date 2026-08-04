import algosdk from 'algosdk';

const algodClient = new algosdk.Algodv2(
  "a".repeat(64), // no token needed
  "https://testnet-api.algonode.cloud",
  443
);
const appId = 1004; // Replace with your actual App ID

export async function issueVaccineToBlockchain(mnemonic, formData) {
  const sender = algosdk.mnemonicToSecretKey(mnemonic);
  const params = await algodClient.getTransactionParams().do();

  // Arguments must be Uint8Array — convert values
  const appArgs = [
    new Uint8Array(Buffer.from("issue")), // method selector or action keyword
    new Uint8Array(Buffer.from(formData.childIdHash)),
    new Uint8Array(Buffer.from(formData.vaccineId)),
    new Uint8Array(Buffer.from(formData.batchNumber)),
    new Uint8Array(Buffer.from(formData.dateAdministered)),
    new Uint8Array(Buffer.from(formData.doseNumber.toString())),
  ];

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: sender.addr,
    appIndex: appId,
    suggestedParams: params,
    appArgs,
  });

  const signedTxn = txn.signTxn(sender.sk);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(algodClient, txId, 3);
  return txId;
}
