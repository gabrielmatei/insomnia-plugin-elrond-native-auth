export const signAndSendTransactions = (context: any) => {
  try {
    const rawResponse = context.response.getBody();
    const response = JSON.parse(rawResponse.toString('utf-8'));

    const apiUrl = context.request.getEnvironmentVariable('apiUrl');
    const pemPath = context.request.getEnvironmentVariable('pemPath');


    const debugData = {
      apiUrl,
      pemPath,
      response
    }

    response.debug = debugData;
  } catch (error) {
    console.log(error);
  }
}