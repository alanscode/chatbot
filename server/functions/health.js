exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'ok' }),
  };
}; 